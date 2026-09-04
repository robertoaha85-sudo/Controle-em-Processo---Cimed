import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { PRODUTOS_INICIAIS, MAQUINAS_INICIAIS, EQUIPES_INICIAIS } from './src/initialData.ts';
import { Maquina, Produto, LoteHistorico, MembroEquipe } from './src/types.ts';

// Fix for ESM/CJS compatibility
let currentDir: string;
if (typeof __dirname !== 'undefined') {
  currentDir = __dirname;
} else {
  const currentFile = fileURLToPath(import.meta.url);
  currentDir = path.dirname(currentFile);
}

const PORT = 3000;
const DATA_DIR = path.join(currentDir, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

interface StoreData {
  maquinas: Maquina[];
  produtos: Produto[];
  historico: LoteHistorico[];
  equipes: MembroEquipe[];
}

// Inicializa dados do banco
function carregarDados(): StoreData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        maquinas: parsed.maquinas || MAQUINAS_INICIAIS,
        produtos: parsed.produtos || PRODUTOS_INICIAIS,
        historico: parsed.historico || [],
        equipes: parsed.equipes || EQUIPES_INICIAIS,
      };
    }
  } catch (err) {
    console.error('Erro ao ler store.json, usando padrão:', err);
  }

  const defaultData: StoreData = {
    maquinas: MAQUINAS_INICIAIS,
    produtos: PRODUTOS_INICIAIS,
    historico: [],
    equipes: EQUIPES_INICIAIS,
  };
  salvarDados(defaultData);
  return defaultData;
}

function salvarDados(data: StoreData) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao gravar store.json:', err);
  }
}

let store = carregarDados();

// Clientes SSE conectados
type SSEClient = {
  id: number;
  res: Response;
};
let sseClients: SSEClient[] = [];
let nextClientId = 1;

function broadcast(eventType: string, payload: any) {
  const data = JSON.stringify({ type: eventType, payload });
  sseClients.forEach((client) => {
    try {
      client.res.write(`data: ${data}\n\n`);
    } catch {
      // Ignora erro no socket fechado
    }
  });
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // SSE (Server-Sent Events) para sincronização multiusuário instantânea
  app.get('/api/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const clientId = nextClientId++;
    sseClients.push({ id: clientId, res });

    // Envia o estado completo imediatamente ao conectar
    res.write(`data: ${JSON.stringify({ type: 'sync_all', payload: store })}\n\n`);

    req.on('close', () => {
      sseClients = sseClients.filter((c) => c.id !== clientId);
    });
  });

  // Heartbeat para manter SSE ativo em proxies
  setInterval(() => {
    sseClients.forEach((client) => {
      try {
        client.res.write(`: heartbeat\n\n`);
      } catch {}
    });
  }, 25000);

  // Retorna todos os dados
  app.get('/api/data', (req: Request, res: Response) => {
    res.json(store);
  });

  // Atualiza uma máquina
  app.put('/api/maquinas/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    const index = store.maquinas.findIndex((m) => m.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Máquina não encontrada' });
    }

    store.maquinas[index] = {
      ...store.maquinas[index],
      ...updates,
      ultimaAtualizacao: new Date().toISOString(),
    };

    salvarDados(store);
    broadcast('maquinas_updated', store.maquinas);
    res.json(store.maquinas[index]);
  });

  // Finaliza lote de uma máquina e move para histórico
  app.post('/api/maquinas/:id/finalizar', (req: Request, res: Response) => {
    const { id } = req.params;
    const { horaTermino, duracaoMinutos, observacao } = req.body;
    const index = store.maquinas.findIndex((m) => m.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Máquina não encontrada' });
    }

    const maquina = store.maquinas[index];
    const agora = new Date();
    const horaAtualStr = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
    const dataStr = agora.toISOString().split('T')[0];

    // Cria registro de histórico
    const novoLote: LoteHistorico = {
      id: `lote-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      maquinaId: maquina.id,
      maquinaNome: maquina.nome,
      setor: maquina.setor,
      produtoNome: maquina.produtoAtualNome || 'Produto não especificado',
      numeroLote: maquina.numeroLote || '',
      dataInicio: maquina.dataInicio || dataStr,
      horaInicio: maquina.horaInicio || horaAtualStr,
      horaTermino: horaTermino || horaAtualStr,
      duracaoMinutos: duracaoMinutos || maquina.tempoEnvaseMinutos || 0,
      teveProblemaMecanico: Boolean(maquina.teveProblemaMecanico || maquina.status === 'problema_mecanico'),
      dataFinalizacao: dataStr,
      observacao: observacao || '',
    };

    store.historico.unshift(novoLote);

    // Reseta máquina para livre
    store.maquinas[index] = {
      ...maquina,
      status: 'livre',
      produtoAtualId: null,
      produtoAtualNome: null,
      numeroLote: null,
      dataInicio: null,
      horaInicio: null,
      previsaoTermino: null,
      tempoEnvaseMinutos: null,
      teveProblemaMecanico: false,
      detalheProblema: null,
      ultimaAtualizacao: agora.toISOString(),
    };

    salvarDados(store);
    broadcast('lote_finalizado', {
      maquinas: store.maquinas,
      historico: store.historico,
    });

    res.json({ maquina: store.maquinas[index], lote: novoLote });
  });

  // Produtos: Criar novo
  app.post('/api/produtos', (req: Request, res: Response) => {
    const { nome, setor, linha, tempoEnvaseMinutos } = req.body;
    if (!nome || !setor || !linha || tempoEnvaseMinutos === undefined) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }

    const novoProduto: Produto = {
      id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      nome: String(nome).trim().toUpperCase(),
      setor,
      linha: String(linha).trim(),
      tempoEnvaseMinutos: Number(tempoEnvaseMinutos),
    };

    store.produtos.push(novoProduto);
    salvarDados(store);
    broadcast('produtos_updated', store.produtos);
    res.status(201).json(novoProduto);
  });

  // Produtos: Atualizar
  app.put('/api/produtos/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const { nome, setor, linha, tempoEnvaseMinutos } = req.body;
    const index = store.produtos.findIndex((p) => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    store.produtos[index] = {
      ...store.produtos[index],
      ...(nome ? { nome: String(nome).trim().toUpperCase() } : {}),
      ...(setor ? { setor } : {}),
      ...(linha ? { linha: String(linha).trim() } : {}),
      ...(tempoEnvaseMinutos !== undefined ? { tempoEnvaseMinutos: Number(tempoEnvaseMinutos) } : {}),
    };

    salvarDados(store);
    broadcast('produtos_updated', store.produtos);
    res.json(store.produtos[index]);
  });

  // Produtos: Excluir
  app.delete('/api/produtos/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    store.produtos = store.produtos.filter((p) => p.id !== id);
    salvarDados(store);
    broadcast('produtos_updated', store.produtos);
    res.json({ success: true });
  });

  // Histórico: Excluir item
  app.delete('/api/historico/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    store.historico = store.historico.filter((h) => h.id !== id);
    salvarDados(store);
    broadcast('historico_updated', store.historico);
    res.json({ success: true });
  });

  // Equipes: Substituir todos (salvar edição em lote)
  app.put('/api/equipes', (req: Request, res: Response) => {
    const equipes = req.body;
    if (!Array.isArray(equipes)) {
      return res.status(400).json({ error: 'Espera um array de membros de equipe' });
    }
    store.equipes = equipes;
    salvarDados(store);
    broadcast('equipes_updated', store.equipes);
    res.json({ success: true, equipes: store.equipes });
  });

  // Resetar dados para padrão (opcional para testes da fábrica)
  app.post('/api/reset-demo', (req: Request, res: Response) => {
    store = {
      maquinas: MAQUINAS_INICIAIS,
      produtos: PRODUTOS_INICIAIS,
      historico: [],
      equipes: EQUIPES_INICIAIS,
    };
    salvarDados(store);
    broadcast('sync_all', store);
    res.json({ success: true, message: 'Dados restaurados para o padrão inicial' });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CIMED Servidor] Rodando com sucesso em http://0.0.0.0:${PORT}`);
  });
}

startServer();
