import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Maquina, Produto, LoteHistorico, StatusMaquina, ResumoStatus, Setor, MembroEquipe, LoteBloqueio, StatusBloqueio } from '../types';
import {
  calcularPrevisaoTermino,
  calcularDuracaoRealMinutos,
  calcularProgressoLote,
  obterTempoProdutoParaMaquina,
  loteBloqueioCompativelComMaquina,
  PRODUTOS_INICIAIS,
  MAQUINAS_INICIAIS,
  EQUIPES_INICIAIS,
} from '../initialData';
import { tocarAlarmeProblemaMecanico, tocarSomSucesso, isSoundEnabled, setSoundEnabled } from '../utils/audio';
import {
  ouvirLotesBloqueio,
  cadastrarLoteBloqueio,
  atualizarLoteBloqueio as atualizarLoteBloqueioFirestore,
  concluirLoteBloqueio as concluirLoteBloqueioFirestore,
  excluirLoteBloqueio,
  obterLotesBloqueioLocais,
} from '../services/lotesBloqueioService';
import {
  ouvirMaquinasEmTempoReal,
  atualizarMaquinaFirestore,
  ouvirHistoricoEmTempoReal,
  adicionarLoteHistoricoFirestore,
  excluirLoteHistoricoFirestore,
  restaurarTodasMaquinasFirestore,
  obterMaquinasLocais,
  obterHistoricoLocal,
  obterProdutosLocais,
  salvarProdutosLocais,
  salvarProdutoFirestore,
  excluirProdutoFirestore,
  ouvirProdutosEmTempoReal,
} from '../services/realtimeSyncService';

interface ProductionContextType {
  maquinas: Maquina[];
  produtos: Produto[];
  historico: LoteHistorico[];
  equipes: MembroEquipe[];
  lotesBloqueio: LoteBloqueio[];
  horaAtual: Date;
  conectado: boolean;
  ultimaSincronizacao: Date | null;
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
  verificarLoteBloqueio: (
    produtoNomeOuCodigo: string,
    numeroLote?: string,
    maquinaNome?: string
  ) => LoteBloqueio | undefined;
  iniciarLote: (
    maquinaId: string,
    produtoId: string,
    dataInicio: string,
    horaInicio: string,
    numeroLote: string,
    tempoMinutosCustomizado?: number,
    isBloqueioForcado?: boolean,
    loteBloqueioId?: string
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
  // Métodos específicos para Lotes de Bloqueio (Firebase Firestore)
  adicionarLoteBloqueio: (
    dados: Omit<LoteBloqueio, 'id' | 'criadoEm' | 'status'> & {
      id?: string;
      criadoEm?: string;
      status?: StatusBloqueio;
    }
  ) => Promise<string>;
  atualizarLoteBloqueio: (id: string, dados: Partial<LoteBloqueio>) => Promise<void>;
  concluirLoteBloqueio: (id: string) => Promise<void>;
  removerLoteBloqueio: (id: string) => Promise<void>;
  atualizarLoteBloqueioDados: (id: string, dados: Partial<LoteBloqueio>) => Promise<void>;
  concluirLoteBloqueioStatus: (id: string) => Promise<void>;
}

const ProductionContext = createContext<ProductionContextType | null>(null);

export function ProductionProvider({ children }: { children: React.ReactNode }) {
  const [maquinas, setMaquinas] = useState<Maquina[]>(obterMaquinasLocais);
  const [produtos, setProdutos] = useState<Produto[]>(obterProdutosLocais);
  const [historico, setHistorico] = useState<LoteHistorico[]>(obterHistoricoLocal);
  const [equipes, setEquipes] = useState<MembroEquipe[]>(EQUIPES_INICIAIS);
  const [lotesBloqueio, setLotesBloqueio] = useState<LoteBloqueio[]>(obterLotesBloqueioLocais);
  const [conectado, setConectado] = useState(true);
  const [ultimaSincronizacao, setUltimaSincronizacao] = useState<Date | null>(new Date());
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

  // 1. Sincronização em tempo real das Máquinas no Firestore (sub-segundo entre todos os clientes)
  useEffect(() => {
    const cancelar = ouvirMaquinasEmTempoReal((novasMaquinas) => {
      setMaquinas(novasMaquinas);
      setConectado(true);
      setUltimaSincronizacao(new Date());
    });
    return () => cancelar();
  }, []);

  // 2. Sincronização em tempo real do Histórico de lotes no Firestore
  useEffect(() => {
    const cancelar = ouvirHistoricoEmTempoReal((novoHistorico) => {
      setHistorico(novoHistorico);
      setUltimaSincronizacao(new Date());
    });
    return () => cancelar();
  }, []);

  // 3. Sincronização em tempo real dos Produtos no Firestore (com fallback resiliente)
  useEffect(() => {
    const cancelar = ouvirProdutosEmTempoReal((novosProdutos) => {
      setProdutos(novosProdutos);
      setUltimaSincronizacao(new Date());
    });
    return () => cancelar();
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

  // Sincronização em tempo real dos Lotes de Bloqueio no Firebase Firestore (com fallback resiliente)
  useEffect(() => {
    const cancelarInscricao = ouvirLotesBloqueio((novosLotes) => {
      setLotesBloqueio(novosLotes);
    });
    return () => cancelarInscricao();
  }, []);

  // Verifica se um número de lote (e produto opcional) corresponde a um Lote de Bloqueio cadastrado e pendente
  // Exige correspondência estrita para evitar ações automáticas indesejadas
  const verificarLoteBloqueio = useCallback(
    (produtoNomeOuCodigo: string, numeroLote?: string, maquinaNome?: string): LoteBloqueio | undefined => {
      if (!numeroLote || !numeroLote.trim()) return undefined;
      const loteNorm = numeroLote.toLowerCase().trim();
      const prodNorm = (produtoNomeOuCodigo || '').toLowerCase().trim();
      const maqNorm = (maquinaNome || '').toLowerCase().trim();

      return lotesBloqueio.find((b) => {
        if (b.status === 'concluido' || b.status === 'cancelado') return false;

        // Número do lote obrigatório e idêntico
        const coincideLote = Boolean(b.numeroLote && b.numeroLote.toLowerCase().trim() === loteNorm);
        if (!coincideLote) return false;

        // Se informou produto, verifica compatibilidade
        if (prodNorm && b.produto) {
          const bProdNorm = b.produto.toLowerCase().trim();
          const coincideProd =
            (b.codigoProduto && b.codigoProduto.toLowerCase().trim() === prodNorm) ||
            bProdNorm === prodNorm ||
            bProdNorm.includes(prodNorm) ||
            prodNorm.includes(bProdNorm);
          if (!coincideProd) return false;
        }

        // Se a máquina foi informada, valida compatibilidade técnica rigorosa
        if (maqNorm) {
          const maqObj = maquinas.find((m) => {
            const mNorm = m.nome.toLowerCase().trim();
            return mNorm === maqNorm || maqNorm.includes(mNorm) || mNorm.includes(maqNorm);
          }) || { nome: maquinaNome || maqNorm };

          if (!loteBloqueioCompativelComMaquina(b, maqObj, produtos)) {
            return false;
          }
        }

        return true;
      });
    },
    [lotesBloqueio, maquinas, produtos]
  );

  // Determina status efetivo (calcula 'atrasado' se ultrapassou a previsão com suporte a múltiplos dias e fins de semana)
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
    if (maquina.status === 'em_andamento') {
      const prog = calcularProgressoLote(maquina, horaAtual);
      if (prog.estaAtrasado) {
        return 'atrasado';
      }
    }

    return 'em_andamento';
  }, [horaAtual]);

  // Calcula % de progresso e tempo restante com precisão de múltiplos dias / fins de semana
  const obterProgresso = useCallback((maquina: Maquina) => {
    return calcularProgressoLote(maquina, horaAtual);
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

  // Iniciar lote em uma máquina (detecta automaticamente se é Lote de Bloqueio cadastrado)
  const iniciarLote = async (
    maquinaId: string,
    produtoId: string,
    dataInicio: string,
    horaInicio: string,
    numeroLote: string,
    tempoMinutosCustomizado?: number,
    isBloqueioForcado?: boolean,
    loteBloqueioId?: string
  ) => {
    const maquina = maquinas.find((m) => m.id === maquinaId);
    const produto = produtos.find((p) => p.id === produtoId);
    if (!produto || !maquina) return;

    const tempoMinutos =
      tempoMinutosCustomizado !== undefined && tempoMinutosCustomizado > 0
        ? tempoMinutosCustomizado
        : obterTempoProdutoParaMaquina(produto, maquina);

    const previsaoTermino = calcularPrevisaoTermino(horaInicio, tempoMinutos);

    // Identifica se este lote corresponde a um Lote de Bloqueio cadastrado
    const loteLimpo = (numeroLote || '').trim().toUpperCase();
    const loteBloqueioEncontrado =
      loteBloqueioId
        ? lotesBloqueio.find((b) => b.id === loteBloqueioId)
        : lotesBloqueio.find(
            (b) =>
              b.numeroLote &&
              b.numeroLote.trim().toUpperCase() === loteLimpo &&
              b.status !== 'concluido' &&
              b.status !== 'cancelado'
          ) ||
          verificarLoteBloqueio(produto.nome, numeroLote, maquina.nome) ||
          (produto.codigo ? verificarLoteBloqueio(produto.codigo, numeroLote, maquina.nome) : undefined);

    const ehBloqueio = Boolean(isBloqueioForcado || loteBloqueioEncontrado);
    const agoraIso = new Date().toISOString();

    let idFinalLoteBloqueio: string | null = null;

    if (ehBloqueio) {
      if (loteBloqueioEncontrado) {
        idFinalLoteBloqueio = loteBloqueioEncontrado.id;
        // Atualiza otimista imediato no estado React para refletir instantaneamente
        setLotesBloqueio((prev) =>
          prev.map((b) =>
            b.id === loteBloqueioEncontrado.id
              ? {
                  ...b,
                  status: 'em_andamento' as StatusBloqueio,
                  maquina: maquina.nome,
                  maquinaEmUsoId: maquina.id,
                  iniciadoEm: agoraIso,
                }
              : b
          )
        );

        // Atualiza persistência no Firestore / localStorage
        atualizarLoteBloqueio(loteBloqueioEncontrado.id, {
          status: 'em_andamento',
          maquinaEmUsoId: maquina.id,
          maquina: maquina.nome,
          iniciadoEm: agoraIso,
        }).catch(console.warn);
      } else {
        // O usuário marcou a caixinha "Marcar como Bloqueio" para um lote não cadastrado previamente
        const novoId = `bloqueio-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        idFinalLoteBloqueio = novoId;

        const novoBloqueio: LoteBloqueio = {
          id: novoId,
          produto: produto.nome,
          codigoProduto: produto.codigo || null,
          numeroLote: loteLimpo,
          maquina: maquina.nome,
          maquinaEmUsoId: maquina.id,
          setor: maquina.setor,
          prazo: 'hoje',
          dataLimite: dataInicio || agoraIso.split('T')[0],
          status: 'em_andamento',
          observacoes: `Iniciado diretamente na envasadora ${maquina.nome} (Bloqueio Prioritário)`,
          criadoEm: agoraIso,
          iniciadoEm: agoraIso,
          concluidoEm: null,
        };

        // Adiciona otimista imediato no estado React: aparece na hora na aba "Lotes de Bloqueio" em "Em produção"
        setLotesBloqueio((prev) => [novoBloqueio, ...prev.filter((b) => b.id !== novoId)]);

        // Persiste via cadastrarLoteBloqueio no Firestore / localStorage
        cadastrarLoteBloqueio({
          id: novoId,
          produto: produto.nome,
          codigoProduto: produto.codigo || null,
          numeroLote: loteLimpo,
          maquina: maquina.nome,
          maquinaEmUsoId: maquina.id,
          setor: maquina.setor,
          prazo: 'hoje',
          dataLimite: dataInicio || agoraIso.split('T')[0],
          status: 'em_andamento',
          observacoes: `Iniciado diretamente na envasadora ${maquina.nome} (Bloqueio Prioritário)`,
          criadoEm: agoraIso,
          iniciadoEm: agoraIso,
        })
          .then((savedId) => {
            if (savedId && savedId !== novoId) {
              setLotesBloqueio((prev) =>
                prev.map((b) => (b.id === novoId ? { ...b, id: savedId } : b))
              );
              fetch(`/api/maquinas/${maquinaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ loteBloqueioId: savedId }),
              }).catch(() => {});
            }
          })
          .catch(console.warn);
      }
    }

    const dataInicioValida = dataInicio || new Date().toISOString().split('T')[0];

    const payload: Partial<Maquina> = {
      status: 'em_andamento' as const,
      produtoAtualId: produto.id,
      produtoAtualCodigo: produto.codigo || null,
      produtoAtualNome: produto.nome,
      dataInicio: dataInicioValida,
      horaInicio,
      numeroLote,
      previsaoTermino,
      tempoEnvaseMinutos: tempoMinutos,
      teveProblemaMecanico: false,
      detalheProblema: null,
      isBloqueio: ehBloqueio,
      loteBloqueioId: idFinalLoteBloqueio,
    };

    // Atualiza otimista local da máquina
    setMaquinas((prev) =>
      prev.map((m) => (m.id === maquinaId ? { ...m, ...payload } : m))
    );

    // Sincroniza instantaneamente no Firebase Firestore para todos os gestores
    atualizarMaquinaFirestore(maquinaId, payload).catch(console.warn);

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
      status: 'problema_mecanico' as const,
      teveProblemaMecanico: true,
      detalheProblema: detalhe || 'Parada por manutenção / problema mecânico',
    };

    setMaquinas((prev) =>
      prev.map((m) => (m.id === maquinaId ? { ...m, ...payload } : m))
    );

    tocarAlarmeProblemaMecanico();
    atualizarMaquinaFirestore(maquinaId, payload).catch(console.warn);

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
      status: 'em_andamento' as const,
      detalheProblema: null,
      teveProblemaMecanico: true, // Mantém que já teve no histórico deste lote
    };

    setMaquinas((prev) =>
      prev.map((m) => (m.id === maquinaId ? { ...m, ...payload } : m))
    );

    tocarSomSucesso();
    atualizarMaquinaFirestore(maquinaId, payload).catch(console.warn);

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

    atualizarMaquinaFirestore(maquinaId, payload).catch(console.warn);

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

    const payload: Partial<Maquina> = {
      horaInicio: novaHora,
      previsaoTermino: novaPrevisao,
    };

    if (!maquina.dataInicio) {
      payload.dataInicio = new Date().toISOString().split('T')[0];
    }

    setMaquinas((prev) =>
      prev.map((m) => (m.id === maquinaId ? { ...m, ...payload } : m))
    );

    atualizarMaquinaFirestore(maquinaId, payload).catch(console.warn);

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

    const horaInicioEfetiva = maquinaAlvo.horaInicio || horaTermino;
    const dataInicioEfetiva = maquinaAlvo.dataInicio || dataStr;
    const duracaoPrevista = maquinaAlvo.tempoEnvaseMinutos || 0;
    const duracaoReal = calcularDuracaoRealMinutos(horaInicioEfetiva, horaTermino, dataInicioEfetiva, dataStr);

    const loteLocalId = `lote-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const historicoOtimista: LoteHistorico = {
      id: loteLocalId,
      maquinaId: maquinaAlvo.id,
      maquinaNome: maquinaAlvo.nome,
      setor: maquinaAlvo.setor,
      produtoCodigo: maquinaAlvo.produtoAtualCodigo || null,
      produtoNome: maquinaAlvo.produtoAtualNome || 'Produto Finalizado',
      numeroLote: maquinaAlvo.numeroLote || '',
      dataInicio: dataInicioEfetiva,
      horaInicio: horaInicioEfetiva,
      horaTermino,
      duracaoMinutos: duracaoReal,
      duracaoPrevistaMinutos: duracaoPrevista,
      duracaoRealMinutos: duracaoReal,
      teveProblemaMecanico: Boolean(maquinaAlvo.teveProblemaMecanico || maquinaAlvo.status === 'problema_mecanico'),
      dataFinalizacao: dataStr,
      observacao: observacao || '',
      isBloqueio: Boolean(maquinaAlvo.isBloqueio),
    };

    // Se a máquina estava com lote de bloqueio ativo, conclui no Firestore e no estado local
    if (maquinaAlvo.isBloqueio || maquinaAlvo.loteBloqueioId) {
      const bId = maquinaAlvo.loteBloqueioId;
      const agoraIso = agora.toISOString();

      setLotesBloqueio((prev) =>
        prev.map((b) => {
          const matchId = bId && bId !== 'bloqueio-avulso' && b.id === bId;
          const matchLote =
            maquinaAlvo.numeroLote &&
            b.numeroLote &&
            b.numeroLote.toUpperCase().trim() === maquinaAlvo.numeroLote.toUpperCase().trim() &&
            b.status === 'em_andamento';
          const matchMaq = b.maquinaEmUsoId === maquinaId && b.status === 'em_andamento';

          if (matchId || matchLote || matchMaq) {
            concluirLoteBloqueioFirestore(b.id).catch(console.warn);
            return {
              ...b,
              status: 'concluido' as StatusBloqueio,
              concluidoEm: agoraIso,
            };
          }
          return b;
        })
      );
    }

    const maquinaResetada: Partial<Maquina> = {
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
      isBloqueio: false,
      loteBloqueioId: null,
      ultimaAtualizacao: agora.toISOString(),
    };

    // 1. Atualização Otimista Imediata: Libera a máquina na hora na interface
    setMaquinas((prev) =>
      prev.map((m) =>
        m.id === maquinaId
          ? {
              ...m,
              ...maquinaResetada,
            }
          : m
      )
    );

    // 2. Adiciona imediatamente ao histórico se tinha produto
    if (maquinaAlvo.produtoAtualNome) {
      setHistorico((prev) => [historicoOtimista, ...prev]);
      // Sincroniza o lote no Firestore para todos os gestores
      adicionarLoteHistoricoFirestore(historicoOtimista).catch(console.warn);
    }

    // Sincroniza a liberação da máquina no Firestore para todos os gestores
    atualizarMaquinaFirestore(maquinaId, maquinaResetada).catch(console.warn);

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
      console.warn('Finalização salva no cliente e no Firestore, aguardando API:', err);
    }
  };

  // Gerenciamento de produtos com atualização otimista instantânea e sincronização Firestore
  const adicionarProduto = async (novo: Omit<Produto, 'id'>): Promise<Produto> => {
    const id = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const codigo = novo.codigo ? String(novo.codigo).trim() : `P${Date.now().toString().slice(-6)}`;
    const tempoTotal = Number(novo.tempoEnvaseMinutos) || 60;
    const linhaStr = String(novo.linha || 'NORDEN I').trim();

    const novoProduto: Produto = {
      id,
      codigo,
      nome: String(novo.nome).trim().toUpperCase(),
      setor: novo.setor,
      linha: linhaStr,
      tempoEnvaseMinutos: tempoTotal,
      vinculos:
        novo.vinculos && novo.vinculos.length > 0
          ? novo.vinculos
          : [{ linhaOuMaquina: linhaStr, tempoEnvaseMinutos: tempoTotal }],
      temposPorMaquina:
        novo.temposPorMaquina && Object.keys(novo.temposPorMaquina).length > 0
          ? novo.temposPorMaquina
          : { [linhaStr]: tempoTotal },
    };

    // 1. Atualização Otimista Imediata: adiciona no estado local e salva no cache
    setProdutos((prev) => {
      const lista = Array.isArray(prev) ? prev : [];
      const atualizados = [...lista.filter((p) => p.id !== id), novoProduto];
      salvarProdutosLocais(atualizados);
      return atualizados;
    });

    // 2. Toca som de sucesso e sincroniza no Firestore
    tocarSomSucesso();
    salvarProdutoFirestore(novoProduto).catch((err) =>
      console.warn('Erro ao salvar produto no Firestore:', err)
    );

    // 3. Persistência na API local com fallback resiliente
    try {
      const res = await fetch('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoProduto),
      });
      if (res.ok) {
        const criadoServidor = await res.json();
        if (criadoServidor && criadoServidor.id) {
          setProdutos((prev) => {
            const lista = Array.isArray(prev) ? prev : [];
            const atualizados = lista.map((p) => (p.id === id ? { ...p, ...criadoServidor } : p));
            salvarProdutosLocais(atualizados);
            return atualizados;
          });
        }
      }
    } catch (err) {
      console.warn('Produto gravado no Firestore e cache local (API em fallback):', err);
    }

    return novoProduto;
  };

  const editarProduto = async (id: string, dados: Partial<Produto>) => {
    let produtoAtualizado: Produto | undefined;

    setProdutos((prev) => {
      const lista = Array.isArray(prev) ? prev : [];
      const atualizados = lista.map((p) => {
        if (p.id === id) {
          produtoAtualizado = { ...p, ...dados };
          return produtoAtualizado;
        }
        return p;
      });
      salvarProdutosLocais(atualizados);
      return atualizados;
    });

    tocarSomSucesso();

    if (produtoAtualizado) {
      salvarProdutoFirestore(produtoAtualizado).catch((err) =>
        console.warn('Erro ao atualizar produto no Firestore:', err)
      );
    }

    try {
      await fetch(`/api/produtos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
    } catch (err) {
      console.warn('Atualização salva no Firestore e cache local (API em fallback):', err);
    }
  };

  const excluirProduto = async (id: string) => {
    setProdutos((prev) => {
      const lista = Array.isArray(prev) ? prev : [];
      const atualizados = lista.filter((p) => p.id !== id);
      salvarProdutosLocais(atualizados);
      return atualizados;
    });

    excluirProdutoFirestore(id).catch((err) =>
      console.warn('Erro ao excluir produto no Firestore:', err)
    );

    try {
      await fetch(`/api/produtos/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Exclusão realizada no Firestore e cache local (API em fallback):', err);
    }
  };

  const excluirLoteHistorico = async (id: string) => {
    setHistorico((prev) => prev.filter((h) => h.id !== id));
    excluirLoteHistoricoFirestore(id).catch(console.warn);
    try {
      await fetch(`/api/historico/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Exclusão salva no Firestore:', err);
    }
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
    restaurarTodasMaquinasFirestore().catch(console.warn);
    try {
      await fetch('/api/reset-demo', { method: 'POST' });
    } catch {}
    setMaquinas(MAQUINAS_INICIAIS);
    setProdutos(PRODUTOS_INICIAIS);
    setHistorico([]);
    setEquipes(EQUIPES_INICIAIS);
  };

  // Funções de Lotes de Bloqueio (Firebase Firestore + Atualização Otimista Instantânea)
  const adicionarLoteBloqueio = async (
    dados: Omit<LoteBloqueio, 'id' | 'criadoEm' | 'status'> & {
      id?: string;
      criadoEm?: string;
      status?: StatusBloqueio;
    }
  ) => {
    const id = await cadastrarLoteBloqueio(dados);
    tocarSomSucesso();
    return id;
  };

  const atualizarLoteBloqueio = async (id: string, dados: Partial<LoteBloqueio>) => {
    setLotesBloqueio((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...dados } : b))
    );
    try {
      await atualizarLoteBloqueioFirestore(id, dados);
    } catch (err) {
      console.warn('Erro ao atualizar lote de bloqueio:', err);
    }
  };

  const concluirLoteBloqueio = async (id: string) => {
    const agora = new Date();
    const agoraIso = agora.toISOString();

    const loteAlvo = lotesBloqueio.find((b) => b.id === id);
    const maquinaVinculada = maquinas.find(
      (m) =>
        m.loteBloqueioId === id ||
        `bloqueio-maq-${m.id}` === id ||
        (loteAlvo?.numeroLote &&
          m.numeroLote &&
          m.numeroLote.trim().toUpperCase() === loteAlvo.numeroLote.trim().toUpperCase() &&
          m.isBloqueio)
    );

    // 1. Atualização Otimista Imediata dos lotes de bloqueio
    setLotesBloqueio((prev) => {
      const existe = prev.some((b) => b.id === id || (loteAlvo && b.id === loteAlvo.id));
      if (existe) {
        return prev.map((b) =>
          b.id === id || (loteAlvo && b.id === loteAlvo.id)
            ? { ...b, status: 'concluido' as StatusBloqueio, concluidoEm: agoraIso, maquinaEmUsoId: null }
            : b
        );
      } else if (maquinaVinculada) {
        const novo: LoteBloqueio = {
          id,
          produto: maquinaVinculada.produtoAtualNome || 'Produto Finalizado',
          codigoProduto: maquinaVinculada.produtoAtualCodigo || null,
          numeroLote: (maquinaVinculada.numeroLote || '').trim().toUpperCase(),
          maquina: maquinaVinculada.nome,
          maquinaEmUsoId: null,
          setor: maquinaVinculada.setor,
          prazo: 'hoje',
          dataLimite: agoraIso.split('T')[0],
          status: 'concluido',
          observacoes: 'Lote finalizado via Baixa em Lotes de Bloqueio',
          criadoEm: maquinaVinculada.ultimaAtualizacao || agoraIso,
          concluidoEm: agoraIso,
        };
        return [novo, ...prev];
      }
      return prev;
    });

    // 2. Se a máquina vinculada estiver em processamento com este lote, finaliza a máquina e grava no histórico
    if (maquinaVinculada && (maquinaVinculada.status === 'em_andamento' || maquinaVinculada.status === 'problema_mecanico')) {
      await finalizarLote(maquinaVinculada.id, 'Lote de bloqueio baixado com sucesso');
    }

    // 3. Sincroniza no Firebase Firestore
    try {
      if (id.startsWith('bloqueio-maq-')) {
        if (maquinaVinculada) {
          await cadastrarLoteBloqueio({
            produto: maquinaVinculada.produtoAtualNome || 'Produto Finalizado',
            codigoProduto: maquinaVinculada.produtoAtualCodigo || undefined,
            numeroLote: (maquinaVinculada.numeroLote || '').trim().toUpperCase(),
            maquina: maquinaVinculada.nome,
            setor: maquinaVinculada.setor,
            prazo: 'hoje',
            status: 'concluido',
            concluidoEm: agoraIso,
            observacoes: 'Baixado via painel de bloqueio',
          });
        }
      } else {
        await concluirLoteBloqueioFirestore(id);
      }
    } catch (err) {
      console.warn('Erro ao sincronizar conclusão do lote de bloqueio no Firestore:', err);
    }

    tocarSomSucesso();
  };

  const removerLoteBloqueio = async (id: string) => {
    setLotesBloqueio((prev) => prev.filter((b) => b.id !== id));
    await excluirLoteBloqueio(id);
  };

  return (
    <ProductionContext.Provider
      value={{
        maquinas,
        produtos,
        historico,
        equipes,
        lotesBloqueio,
        horaAtual,
        conectado,
        ultimaSincronizacao,
        somAtivo,
        alternarSom,
        resumo,
        obterStatusEfetivo,
        obterProgresso,
        verificarLoteBloqueio,
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
        adicionarLoteBloqueio,
        atualizarLoteBloqueio,
        concluirLoteBloqueio,
        atualizarLoteBloqueioDados: atualizarLoteBloqueio,
        concluirLoteBloqueioStatus: concluirLoteBloqueio,
        removerLoteBloqueio,
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
