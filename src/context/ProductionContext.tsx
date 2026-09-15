import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Maquina, Produto, LoteHistorico, StatusMaquina, ResumoStatus, Setor, MembroEquipe } from '../types';
import { calcularPrevisaoTermino, obterTempoProdutoParaMaquina, PRODUTOS_INICIAIS, MAQUINAS_INICIAIS, EQUIPES_INICIAIS } from '../initialData';
import { tocarAlarmeProblemaMecanico, tocarSomSucesso, isSoundEnabled, setSoundEnabled } from '../utils/audio';

interface ProductionContextType {
  maquinas: Maquina[];
  produtos: Produto[];
  historico: LoteHistorico[];
  equipes: MembroEquipe[];
  horaAtual: Date;
  conectado: boolean;
  somAtivo: boolean;
  alternarSom: () => void;
  resumo: ResumoStatus;
  obterStatusEfetivo: (maquina: Maquina) => StatusMaquina;
  obterProgresso: (maquina: Maquina) => {
    porcentagem: number;
    tempoRestanteTexto: string;
    estaAtrasado: boolean;
    atrasoMinutos: number;
  };
  iniciarLote: (
    maquinaId: string,
    produtoId: string,
    dataInicio: string,
    horaInicio: string,
    numeroLote: string,
    tempoMinutosCustomizado?: number
  ) => Promise<void>;
  marcarProblemaMecanico: (maquinaId: string, detalhe?: string) => Promise<void>;
  resolverProblemaMecanico: (maquinaId: string) => Promise<void>;
  alterarStatusMaquina: (
    maquinaId: string,
    novoStatus: 'em_andamento' | 'problema_mecanico' | 'livre' | 'em_limpeza_total' | 'em_limpeza_parcial' | 'aguardando_manipulacao',
    detalhe?: string
  ) => Promise<void>;
  atualizarHoraInicio: (maquinaId: string, novaHora: string) => Promise<void>;
  finalizarLote: (maquinaId: string, observacao?: string) => Promise<void>;
  adicionarProduto: (novo: Omit<Produto, 'id'>) => Promise<Produto>;
  editarProduto: (id: string, dados: Partial<Produto>) => Promise<void>;
  excluirProduto: (id: string) => Promise<void>;
  excluirLoteHistorico: (id: string) => Promise<void>;
  atualizarEquipes: (novasEquipes: MembroEquipe[]) => Promise<void>;
  restaurarDadosPadrao: () => Promise<void>;
}

const ProductionContext = createContext<ProductionContextType | null>(null);

export function ProductionProvider({ children }: { children: React.ReactNode }) {
  const [maquinas, setMaquinas] = useState<Maquina[]>(MAQUINAS_INICIAIS);
  const [produtos, setProdutos] = useState<Produto[]>(PRODUTOS_INICIAIS);
  const [historico, setHistorico] = useState<LoteHistorico[]>([]);
  const [equipes, setEquipes] = useState<MembroEquipe[]>(EQUIPES_INICIAIS);
  const [conectado, setConectado] = useState(false);
  const [horaAtual, setHoraAtual] = useState(new Date());
  const [somAtivo, setSomAtivo] = useState(isSoundEnabled());

  const alternarSom = useCallback(() => {
    const novo = !somAtivo;
    setSomAtivo(novo);
    setSoundEnabled(novo);
  }, [somAtivo]);

  // Atualiza relógio a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setHoraAtual(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Carga inicial e conexão SSE em tempo real com fallback resiliente de polling
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;
    let pollingInterval: any = null;
    let cancelado = false;

    const carregarDadosIniciais = async () => {
      try {
        const res = await fetch('/api/data');
        if (res.ok) {
          const data = await res.json();
          if (cancelado) return;
          setConectado(true);
          if (data.maquinas) setMaquinas(data.maquinas);
          if (data.produtos) setProdutos(data.produtos);
          if (data.historico) setHistorico(data.historico);
          if (data.equipes) setEquipes(data.equipes);
        }
      } catch (err) {
        console.warn('Fallback: usando dados locais:', err);
      }
    };

    const verificarConexao = async () => {
      try {
        const res = await fetch('/api/data');
        if (res.ok && !cancelado) {
          setConectado(true);
          const data = await res.json();
          if (data.maquinas) setMaquinas(data.maquinas);
          if (data.produtos) setProdutos(data.produtos);
          if (data.historico) setHistorico(data.historico);
          if (data.equipes) setEquipes(data.equipes);
        }
      } catch {
        if (!cancelado) setConectado(false);
      }
    };

    const conectarSSE = () => {
      try {
        if (eventSource) {
          eventSource.close();
        }

        eventSource = new EventSource('/api/events');

        eventSource.onopen = () => {
          if (!cancelado) setConectado(true);
        };

        eventSource.onmessage = (event) => {
          if (cancelado) return;
          try {
            const data = JSON.parse(event.data);
            setConectado(true);
            if (data.type === 'sync_all') {
              if (data.payload.maquinas) setMaquinas(data.payload.maquinas);
              if (data.payload.produtos) setProdutos(data.payload.produtos);
              if (data.payload.historico) setHistorico(data.payload.historico);
              if (data.payload.equipes) setEquipes(data.payload.equipes);
            } else if (data.type === 'maquinas_updated') {
              setMaquinas(data.payload);
            } else if (data.type === 'produtos_updated') {
              setProdutos(data.payload);
            } else if (data.type === 'historico_updated') {
              setHistorico(data.payload);
            } else if (data.type === 'equipes_updated') {
              setEquipes(data.payload);
            } else if (data.type === 'lote_finalizado') {
              if (data.payload.maquinas) setMaquinas(data.payload.maquinas);
              if (data.payload.historico) setHistorico(data.payload.historico);
            }
          } catch {}
        };

        eventSource.onerror = () => {
          // Se o navegador perdeu a conexão SSE, verifica via HTTP imediatamente
          verificarConexao();
          if (eventSource && eventSource.readyState === EventSource.CLOSED) {
            eventSource.close();
            reconnectTimeout = setTimeout(conectarSSE, 5000);
          }
        };
      } catch (err) {
        verificarConexao();
        reconnectTimeout = setTimeout(conectarSSE, 5000);
      }
    };

    carregarDadosIniciais();
    conectarSSE();

    // Polling de segurança periódico (a cada 6s) para garantir sincronização mesmo atrás de proxies restritivos
    pollingInterval = setInterval(verificarConexao, 6000);

    return () => {
      cancelado = true;
      if (eventSource) eventSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, []);

  // Determina status efetivo (calcula 'atrasado' se ultrapassou a previsão)
  const obterStatusEfetivo = useCallback((maquina: Maquina): StatusMaquina => {
    if (maquina.status === 'problema_mecanico') {
      return 'problema_mecanico';
    }
    if (maquina.status === 'em_limpeza_total') {
      return 'em_limpeza_total';
    }
    if (maquina.status === 'em_limpeza_parcial') {
      return 'em_limpeza_parcial';
    }
    if (maquina.status === 'aguardando_manipulacao') {
      return 'aguardando_manipulacao';
    }
    if (maquina.status === 'livre') {
      return 'livre';
    }

    // Se estiver em andamento, verifica se já passou do horário previsto
    if (maquina.status === 'em_andamento' && maquina.horaInicio && maquina.previsaoTermino) {
      const [hIni, mIni] = maquina.horaInicio.split(':').map(Number);
      const [hFim, mFim] = maquina.previsaoTermino.split(':').map(Number);
      const hAtual = horaAtual.getHours();
      const mAtual = horaAtual.getMinutes();

      let minInicioTotal = hIni * 60 + mIni;
      let minFimTotal = hFim * 60 + mFim;
      let minAtualTotal = hAtual * 60 + mAtual;

      // Trata cruzamento de meia-noite
      if (minFimTotal < minInicioTotal) {
        minFimTotal += 24 * 60;
        if (minAtualTotal < minInicioTotal) {
          minAtualTotal += 24 * 60;
        }
      }

      if (minAtualTotal > minFimTotal) {
        return 'atrasado';
      }
    }

    return 'em_andamento';
  }, [horaAtual]);

  // Calcula % de progresso e tempo restante
  const obterProgresso = useCallback((maquina: Maquina) => {
    if (
      maquina.status === 'livre' ||
      maquina.status === 'em_limpeza_total' ||
      maquina.status === 'em_limpeza_parcial' ||
      maquina.status === 'aguardando_manipulacao' ||
      !maquina.horaInicio ||
      !maquina.previsaoTermino ||
      !maquina.tempoEnvaseMinutos
    ) {
      let texto = 'Máquina parada / livre';
      if (maquina.status === 'em_limpeza_total') texto = 'Em limpeza total';
      else if (maquina.status === 'em_limpeza_parcial') texto = 'Em limpeza parcial';
      else if (maquina.status === 'aguardando_manipulacao') texto = 'Aguardando manipulação';

      return {
        porcentagem: 0,
        tempoRestanteTexto: texto,
        estaAtrasado: false,
        atrasoMinutos: 0,
      };
    }

    const [hIni, mIni] = maquina.horaInicio.split(':').map(Number);
    const [hFim, mFim] = maquina.previsaoTermino.split(':').map(Number);
    const hAtual = horaAtual.getHours();
    const mAtual = horaAtual.getMinutes();
    const sAtual = horaAtual.getSeconds();

    let minInicioTotal = hIni * 60 + mIni;
    let minFimTotal = hFim * 60 + mFim;
    let minAtualTotal = hAtual * 60 + mAtual + sAtual / 60;

    if (minFimTotal < minInicioTotal) {
      minFimTotal += 24 * 60;
      if (minAtualTotal < minInicioTotal) {
        minAtualTotal += 24 * 60;
      }
    }

    const duracaoMin = minFimTotal - minInicioTotal;
    const decorridoMin = minAtualTotal - minInicioTotal;

    if (decorridoMin < 0) {
      // Início agendado para o futuro
      const faltaMin = Math.ceil(-decorridoMin);
      return {
        porcentagem: 0,
        tempoRestanteTexto: `Inicia em ${faltaMin} min`,
        estaAtrasado: false,
        atrasoMinutos: 0,
      };
    }

    if (decorridoMin >= duracaoMin) {
      const atraso = Math.floor(decorridoMin - duracaoMin);
      const horasAtraso = Math.floor(atraso / 60);
      const minsAtraso = atraso % 60;
      const textoAtraso = horasAtraso > 0 ? `${horasAtraso}h ${minsAtraso}min` : `${minsAtraso}min`;
      return {
        porcentagem: 100,
        tempoRestanteTexto: `Atrasado há ${textoAtraso}`,
        estaAtrasado: true,
        atrasoMinutos: atraso,
      };
    }

    const pct = Math.min(100, Math.max(0, (decorridoMin / duracaoMin) * 100));
    const restante = Math.ceil(duracaoMin - decorridoMin);
    const horasRest = Math.floor(restante / 60);
    const minsRest = restante % 60;
    const textoRest = horasRest > 0 ? `${horasRest}h ${minsRest}min restantes` : `${minsRest}min restantes`;

    return {
      porcentagem: Number(pct.toFixed(1)),
      tempoRestanteTexto: textoRest,
      estaAtrasado: false,
      atrasoMinutos: 0,
    };
  }, [horaAtual]);

  // Resumo de contagem das máquinas
  const resumo = useMemo((): ResumoStatus => {
    let emAndamento = 0;
    let problemaMecanico = 0;
    let atrasadas = 0;
    let livres = 0;
    let emLimpezaTotal = 0;
    let emLimpezaParcial = 0;
    let aguardandoManipulacao = 0;

    maquinas.forEach((m) => {
      const st = obterStatusEfetivo(m);
      if (st === 'problema_mecanico') problemaMecanico++;
      else if (st === 'atrasado') atrasadas++;
      else if (st === 'em_andamento') emAndamento++;
      else if (st === 'em_limpeza_total') emLimpezaTotal++;
      else if (st === 'em_limpeza_parcial') emLimpezaParcial++;
      else if (st === 'aguardando_manipulacao') aguardandoManipulacao++;
      else livres++;
    });

    return {
      total: maquinas.length,
      emAndamento,
      problemaMecanico,
      atrasadas,
      livres,
      emLimpezaTotal,
      emLimpezaParcial,
      aguardandoManipulacao,
    };
  }, [maquinas, obterStatusEfetivo]);

  // Iniciar lote em uma máquina
  const iniciarLote = async (
    maquinaId: string,
    produtoId: string,
    dataInicio: string,
    horaInicio: string,
    numeroLote: string,
    tempoMinutosCustomizado?: number
  ) => {
    const maquina = maquinas.find((m) => m.id === maquinaId);
    const produto = produtos.find((p) => p.id === produtoId);
    if (!produto || !maquina) return;

    const tempoMinutos =
      tempoMinutosCustomizado !== undefined && tempoMinutosCustomizado > 0
        ? tempoMinutosCustomizado
        : obterTempoProdutoParaMaquina(produto, maquina);

    const previsaoTermino = calcularPrevisaoTermino(horaInicio, tempoMinutos);

    const payload = {
      status: 'em_andamento' as const,
      produtoAtualId: produto.id,
      produtoAtualCodigo: produto.codigo || null,
      produtoAtualNome: produto.nome,
      dataInicio,
      horaInicio,
      numeroLote,
      previsaoTermino,
      tempoEnvaseMinutos: tempoMinutos,
      teveProblemaMecanico: false,
      detalheProblema: null,
    };

    // Atualiza otimista local
    setMaquinas((prev) =>
      prev.map((m) => (m.id === maquinaId ? { ...m, ...payload } : m))
    );

    try {
      await fetch(`/api/maquinas/${maquinaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      tocarSomSucesso();
    } catch (err) {
      console.error('Erro ao iniciar lote:', err);
    }
  };

  // Marcar problema mecânico (dispara alerta visual e sonoro)
  const marcarProblemaMecanico = async (maquinaId: string, detalhe?: string) => {
    const payload = {
      status: 'problema_mecanico',
      teveProblemaMecanico: true,
      detalheProblema: detalhe || 'Parada por manutenção / problema mecânico',
    };

    setMaquinas((prev) =>
      prev.map((m) => (m.id === maquinaId ? { ...m, ...payload } : m))
    );

    tocarAlarmeProblemaMecanico();

    try {
      await fetch(`/api/maquinas/${maquinaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Erro ao marcar problema mecânico:', err);
    }
  };

  // Resolver problema mecânico (retorna para 'em_andamento')
  const resolverProblemaMecanico = async (maquinaId: string) => {
    const maquina = maquinas.find((m) => m.id === maquinaId);
    if (!maquina) return;

    const payload = {
      status: 'em_andamento',
      detalheProblema: null,
      teveProblemaMecanico: true, // Mantém que já teve no histórico deste lote
    };

    setMaquinas((prev) =>
      prev.map((m) => (m.id === maquinaId ? { ...m, ...payload } : m))
    );

    tocarSomSucesso();

    try {
      await fetch(`/api/maquinas/${maquinaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Erro ao resolver problema mecânico:', err);
    }
  };

  // Alterar status da máquina (limpeza total, parcial, aguardando manipulação, etc.)
  const alterarStatusMaquina = async (
    maquinaId: string,
    novoStatus: 'em_andamento' | 'problema_mecanico' | 'livre' | 'em_limpeza_total' | 'em_limpeza_parcial' | 'aguardando_manipulacao',
    detalhe?: string
  ) => {
    const payload: Partial<Maquina> = {
      status: novoStatus,
      detalheProblema: novoStatus === 'problema_mecanico' ? (detalhe || 'Problema mecânico registrado') : null,
    };

    if (novoStatus === 'problema_mecanico') {
      payload.teveProblemaMecanico = true;
      tocarAlarmeProblemaMecanico();
    } else {
      tocarSomSucesso();
    }

    setMaquinas((prev) =>
      prev.map((m) => (m.id === maquinaId ? { ...m, ...payload } : m))
    );

    try {
      await fetch(`/api/maquinas/${maquinaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Erro ao alterar status da máquina:', err);
    }
  };

  // Atualizar horário de início
  const atualizarHoraInicio = async (maquinaId: string, novaHora: string) => {
    const maquina = maquinas.find((m) => m.id === maquinaId);
    if (!maquina || !maquina.tempoEnvaseMinutos) return;

    const novaPrevisao = calcularPrevisaoTermino(novaHora, maquina.tempoEnvaseMinutos);

    const payload = {
      horaInicio: novaHora,
      previsaoTermino: novaPrevisao,
    };

    setMaquinas((prev) =>
      prev.map((m) => (m.id === maquinaId ? { ...m, ...payload } : m))
    );

    try {
      await fetch(`/api/maquinas/${maquinaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {}
  };

  // Finalizar lote com atualização otimista instantânea
  const finalizarLote = async (maquinaId: string, observacao?: string) => {
    const agora = new Date();
    const horaTermino = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
    const dataStr = agora.toISOString().split('T')[0];

    const maquinaAlvo = maquinas.find((m) => m.id === maquinaId);
    if (!maquinaAlvo) return;

    // Se já estiver livre e sem produto, não faz nada
    if (maquinaAlvo.status === 'livre' && !maquinaAlvo.produtoAtualNome) return;

    const loteLocalId = `lote-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const historicoOtimista: LoteHistorico = {
      id: loteLocalId,
      maquinaId: maquinaAlvo.id,
      maquinaNome: maquinaAlvo.nome,
      setor: maquinaAlvo.setor,
      produtoCodigo: maquinaAlvo.produtoAtualCodigo || null,
      produtoNome: maquinaAlvo.produtoAtualNome || 'Produto Finalizado',
      numeroLote: maquinaAlvo.numeroLote || '',
      dataInicio: maquinaAlvo.dataInicio || dataStr,
      horaInicio: maquinaAlvo.horaInicio || horaTermino,
      horaTermino,
      duracaoMinutos: maquinaAlvo.tempoEnvaseMinutos || 0,
      teveProblemaMecanico: Boolean(maquinaAlvo.teveProblemaMecanico || maquinaAlvo.status === 'problema_mecanico'),
      dataFinalizacao: dataStr,
      observacao: observacao || '',
    };

    // 1. Atualização Otimista Imediata: Libera a máquina na hora na interface
    setMaquinas((prev) =>
      prev.map((m) =>
        m.id === maquinaId
          ? {
              ...m,
              status: 'livre',
              produtoAtualId: null,
              produtoAtualCodigo: null,
              produtoAtualNome: null,
              numeroLote: null,
              dataInicio: null,
              horaInicio: null,
              previsaoTermino: null,
              tempoEnvaseMinutos: null,
              teveProblemaMecanico: false,
              detalheProblema: null,
              ultimaAtualizacao: agora.toISOString(),
            }
          : m
      )
    );

    // 2. Adiciona imediatamente ao histórico se tinha produto
    if (maquinaAlvo.produtoAtualNome) {
      setHistorico((prev) => [historicoOtimista, ...prev]);
    }

    tocarSomSucesso();

    // 3. Envia para o backend para persistência
    try {
      const res = await fetch(`/api/maquinas/${maquinaId}/finalizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ horaTermino, observacao }),
      });
      if (res.ok) {
        setConectado(true);
        const data = await res.json();
        // Sincroniza com retorno oficial do servidor
        setMaquinas((prev) => prev.map((m) => (m.id === maquinaId ? data.maquina : m)));
        if (data.lote) {
          setHistorico((prev) => [data.lote, ...prev.filter((h) => h.id !== loteLocalId)]);
        }
      }
    } catch (err) {
      console.warn('Finalização salva no cliente, aguardando conexão:', err);
    }
  };

  // Gerenciamento de produtos
  const adicionarProduto = async (novo: Omit<Produto, 'id'>): Promise<Produto> => {
    const res = await fetch('/api/produtos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novo),
    });
    const criado = await res.json();
    setProdutos((prev) => [...prev, criado]);
    return criado;
  };

  const editarProduto = async (id: string, dados: Partial<Produto>) => {
    setProdutos((prev) => prev.map((p) => (p.id === id ? { ...p, ...dados } : p)));
    await fetch(`/api/produtos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
  };

  const excluirProduto = async (id: string) => {
    setProdutos((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/produtos/${id}`, { method: 'DELETE' });
  };

  const excluirLoteHistorico = async (id: string) => {
    setHistorico((prev) => prev.filter((h) => h.id !== id));
    await fetch(`/api/historico/${id}`, { method: 'DELETE' });
  };

  const atualizarEquipes = async (novasEquipes: MembroEquipe[]) => {
    setEquipes(novasEquipes);
    await fetch('/api/equipes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novasEquipes),
    });
  };

  const restaurarDadosPadrao = async () => {
    await fetch('/api/reset-demo', { method: 'POST' });
    setMaquinas(MAQUINAS_INICIAIS);
    setProdutos(PRODUTOS_INICIAIS);
    setHistorico([]);
    setEquipes(EQUIPES_INICIAIS);
  };

  return (
    <ProductionContext.Provider
      value={{
        maquinas,
        produtos,
        historico,
        equipes,
        horaAtual,
        conectado,
        somAtivo,
        alternarSom,
        resumo,
        obterStatusEfetivo,
        obterProgresso,
        iniciarLote,
        marcarProblemaMecanico,
        resolverProblemaMecanico,
        alterarStatusMaquina,
        atualizarHoraInicio,
        finalizarLote,
        adicionarProduto,
        editarProduto,
        excluirProduto,
        excluirLoteHistorico,
        atualizarEquipes,
        restaurarDadosPadrao,
      }}
    >
      {children}
    </ProductionContext.Provider>
  );
}

export function useProduction() {
  const context = useContext(ProductionContext);
  if (!context) {
    throw new Error('useProduction deve ser usado dentro de um ProductionProvider');
  }
  return context;
}
