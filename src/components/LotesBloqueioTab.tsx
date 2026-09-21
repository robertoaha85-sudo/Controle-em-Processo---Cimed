import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Clock,
  Calendar,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Hash,
  FileText,
  X,
  Check,
} from 'lucide-react';
import { useProduction } from '../context/ProductionContext';
import { LoteBloqueio, PrazoBloqueio, Setor, Produto } from '../types';
import {
  encontrarProdutoDoLote,
  produtoVinculadoAMaquina,
  loteBloqueioCompativelComMaquina,
} from '../initialData';

interface LotesBloqueioTabProps {
  aoIrParaDashboard?: () => void;
}

export const LotesBloqueioTab: React.FC<LotesBloqueioTabProps> = ({ aoIrParaDashboard }) => {
  const {
    lotesBloqueio,
    produtos,
    maquinas,
    adicionarLoteBloqueio,
    concluirLoteBloqueio,
    removerLoteBloqueio,
    atualizarLoteBloqueio,
    horaAtual,
  } = useProduction();

  // Estados de controle do formulário
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'bloqueio' | 'em_producao' | 'concluidos'>('todos');
  const [busca, setBusca] = useState('');

  // Campos do formulário de cadastro
  const [produtoNome, setProdutoNome] = useState('');
  const [codigoProduto, setCodigoProduto] = useState('');
  const [numeroLote, setNumeroLote] = useState('');
  const [maquinaDestino, setMaquinaDestino] = useState('Todas');
  const [setorDestino, setSetorDestino] = useState<'todos' | Setor>('todos');
  const [prazo, setPrazo] = useState<PrazoBloqueio>('hoje');
  const [dataLimiteCustom, setDataLimiteCustom] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [cliente, setCliente] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [loteParaExcluir, setLoteParaExcluir] = useState<string | null>(null);

  // Busca rápida de produtos no modal
  const [buscaProdutoModal, setBuscaProdutoModal] = useState('');

  const produtosSugeridosModal = useMemo(() => {
    if (!buscaProdutoModal.trim()) return produtos.slice(0, 8);
    const termo = buscaProdutoModal.toLowerCase().trim();
    return produtos.filter(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        (p.codigo && p.codigo.toLowerCase().includes(termo)) ||
        p.linha.toLowerCase().includes(termo)
    ).slice(0, 10);
  }, [produtos, buscaProdutoModal]);

  // Detecção do produto e cálculo estrito de compatibilidade no modal de cadastro
  const produtoModalDetectado = useMemo(() => {
    return encontrarProdutoDoLote({ produto: produtoNome, codigoProduto }, produtos);
  }, [produtoNome, codigoProduto, produtos]);

  const maquinasCompativeisModal = useMemo(() => {
    if (!produtoModalDetectado) {
      if (setorDestino === 'todos') return maquinas;
      return maquinas.filter((m) => m.setor === setorDestino);
    }
    return maquinas.filter((m) => produtoVinculadoAMaquina(produtoModalDetectado, m));
  }, [produtoModalDetectado, maquinas, setorDestino]);

  const selecionarProdutoModal = (p: Produto) => {
    setProdutoNome(p.nome);
    setCodigoProduto(p.codigo || '');
    setSetorDestino(p.setor);
    setBuscaProdutoModal('');
    // Se a máquina atual não for compatível com o produto recém-escolhido, reseta para "Todas"
    if (
      maquinaDestino !== 'Todas' &&
      !produtoVinculadoAMaquina(p, { nome: maquinaDestino, linhaPadrao: maquinaDestino, setor: p.setor })
    ) {
      setMaquinaDestino('Todas');
    }
  };

  // Lista unificada: lotesBloqueio + qualquer máquina ativa com lote de bloqueio
  const lotesBloqueioUnificados = useMemo(() => {
    const lista = [...lotesBloqueio];
    const lotesExistentesSet = new Set(
      lista.map((l) => (l.numeroLote || '').trim().toUpperCase())
    );

    // Garante que qualquer envasadora com lote de bloqueio em andamento conste como 'em_andamento'
    maquinas.forEach((m) => {
      if (m.isBloqueio && m.status === 'em_andamento' && m.numeroLote) {
        const numNorm = m.numeroLote.trim().toUpperCase();
        if (!lotesExistentesSet.has(numNorm)) {
          lista.unshift({
            id: m.loteBloqueioId && m.loteBloqueioId !== 'bloqueio-avulso' ? m.loteBloqueioId : `bloqueio-maq-${m.id}`,
            produto: m.produtoAtualNome || 'Produto em Linha',
            codigoProduto: m.produtoAtualCodigo || null,
            numeroLote: numNorm,
            maquina: m.nome,
            maquinaEmUsoId: m.id,
            setor: m.setor,
            prazo: 'hoje',
            dataLimite: m.dataInicio || new Date().toISOString().split('T')[0],
            status: 'em_andamento',
            observacoes: `Em processamento na envasadora ${m.nome}`,
            criadoEm: m.ultimaAtualizacao || new Date().toISOString(),
            iniciadoEm: m.horaInicio || new Date().toISOString(),
            concluidoEm: null,
          });
          lotesExistentesSet.add(numNorm);
        } else {
          // Se já existe na lista mas ainda não constava como em_andamento, atualiza
          const idx = lista.findIndex((l) => (l.numeroLote || '').trim().toUpperCase() === numNorm);
          if (idx !== -1 && lista[idx].status !== 'em_andamento' && lista[idx].status !== 'concluido') {
            lista[idx] = {
              ...lista[idx],
              status: 'em_andamento',
              maquina: m.nome,
              maquinaEmUsoId: m.id,
              iniciadoEm: lista[idx].iniciadoEm || m.horaInicio || new Date().toISOString(),
            };
          }
        }
      }
    });

    return lista;
  }, [lotesBloqueio, maquinas]);

  // Contadores analíticos: Lotes em Bloqueio - Em produção - Concluídos
  const metricas = useMemo(() => {
    const bloqueio = lotesBloqueioUnificados.filter(
      (b) => b.status !== 'concluido' && b.status !== 'em_andamento' && b.status !== 'cancelado'
    ).length;
    const emProducao = lotesBloqueioUnificados.filter((b) => b.status === 'em_andamento').length;
    const concluidos = lotesBloqueioUnificados.filter((b) => b.status === 'concluido').length;
    const total = lotesBloqueioUnificados.length;

    return { bloqueio, emProducao, concluidos, total };
  }, [lotesBloqueioUnificados]);

  // Ordenação e filtragem: Lotes em Bloqueio - Em produção - Concluídos
  const lotesOrdenados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return [...lotesBloqueioUnificados]
      .filter((lote) => {
        // Filtro por tab/status
        if (filtroStatus === 'todos') {
          return true;
        }
        if (filtroStatus === 'bloqueio' && (lote.status === 'concluido' || lote.status === 'em_andamento')) return false;
        if (filtroStatus === 'em_producao' && lote.status !== 'em_andamento') return false;
        if (filtroStatus === 'concluidos' && lote.status !== 'concluido') return false;

        // Busca por texto
        if (termo) {
          const matchLote = lote.numeroLote.toLowerCase().includes(termo);
          const matchProduto = lote.produto.toLowerCase().includes(termo);
          const matchCodigo = lote.codigoProduto?.toLowerCase().includes(termo);
          const matchMaquina = lote.maquina?.toLowerCase().includes(termo);
          const matchCliente = lote.cliente?.toLowerCase().includes(termo);
          return matchLote || matchProduto || matchCodigo || matchMaquina || matchCliente;
        }

        return true;
      })
      .sort((a, b) => {
        // Concluídos sempre no final
        if (a.status === 'concluido' && b.status !== 'concluido') return 1;
        if (a.status !== 'concluido' && b.status === 'concluido') return -1;

        // Em andamento (Em Produção) SEMPRE no topo absoluto
        if (a.status === 'em_andamento' && b.status !== 'em_andamento') return -1;
        if (a.status !== 'em_andamento' && b.status === 'em_andamento') return 1;

        // Desempate pela data de criação (mais recentes primeiro)
        return new Date(b.criadoEm || 0).getTime() - new Date(a.criadoEm || 0).getTime();
      });
  }, [lotesBloqueioUnificados, filtroStatus, busca]);

  const limparFormulario = () => {
    setProdutoNome('');
    setCodigoProduto('');
    setNumeroLote('');
    setMaquinaDestino('Todas');
    setSetorDestino('todos');
    setPrazo('hoje');
    setDataLimiteCustom('');
    setQuantidade('');
    setCliente('');
    setObservacoes('');
    setBuscaProdutoModal('');
  };

  const handleSalvarLote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoNome.trim() || !numeroLote.trim()) return;

    setSalvando(true);
    try {
      await adicionarLoteBloqueio({
        produto: produtoNome.trim(),
        codigoProduto: codigoProduto.trim() || undefined,
        numeroLote: numeroLote.trim().toUpperCase(),
        maquina: maquinaDestino,
        setor: setorDestino === 'todos' ? undefined : setorDestino,
        prazo,
        dataLimiteCustom: dataLimiteCustom || undefined,
        quantidade: quantidade.trim() || undefined,
        cliente: cliente.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
      });

      limparFormulario();
      setModalCadastroAberto(false);
    } catch (err) {
      console.error('Erro ao salvar lote de bloqueio:', err);
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExcluirLote = async (id: string) => {
    await removerLoteBloqueio(id);
    setLoteParaExcluir(null);
  };

  return (
    <div id="lotes-bloqueio-container" className="space-y-5">
      {/* Cabeçalho da Seção */}
      <div className="bg-[#18121c] border-2 border-fuchsia-600/40 rounded-lg p-4 sm:p-6 shadow-[0_0_25px_rgba(217,70,239,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <div className="w-8 h-8 rounded bg-fuchsia-600 flex items-center justify-center text-white shadow-[0_0_12px_rgba(217,70,239,0.6)]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-xl font-black uppercase tracking-wider text-white flex items-center gap-2">
              <span>Lotes de Bloqueio</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-black tracking-widest bg-fuchsia-600 text-white uppercase animate-pulse border border-fuchsia-400">
                PRIORIDADE MÁXIMA
              </span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-fuchsia-200/80 max-w-2xl">
            Lotes <strong>já vendidos antecipadamente</strong> com atendimento mandatório. Ao ser
            iniciado o envase, a respectiva máquina receberá <strong>destaque visual magenta</strong> e a etiqueta piscando <strong>"BLOQUEIO"</strong>.
          </p>
        </div>

        <button
          id="btn-abrir-cadastro-bloqueio"
          onClick={() => {
            limparFormulario();
            setModalCadastroAberto(true);
          }}
          className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-4 py-2.5 rounded font-bold uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(217,70,239,0.4)] transition-all cursor-pointer hover:scale-[1.02] shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Cadastrar Lote de Bloqueio</span>
        </button>
      </div>

      {/* Cards de Métricas e Filtros Rápidos: Lotes em Bloqueio - Em produção - Concluídos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Lotes em Bloqueio */}
        <button
          onClick={() => setFiltroStatus('bloqueio')}
          className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
            filtroStatus === 'bloqueio'
              ? 'bg-red-950/80 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] ring-1 ring-red-400'
              : 'bg-[#181119] border-red-900/40 hover:border-red-600/60 text-white'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1">
            <span>Lotes em Bloqueio</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-mono font-black text-red-300">{metricas.bloqueio}</div>
          <div className="text-[9px] text-red-400/70 font-mono mt-0.5">Aguardando Produção</div>
        </button>

        {/* Em Produção */}
        <button
          onClick={() => setFiltroStatus('em_producao')}
          className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
            filtroStatus === 'em_producao'
              ? 'bg-fuchsia-950/90 border-fuchsia-400 shadow-[0_0_18px_rgba(217,70,239,0.35)] ring-1 ring-fuchsia-300'
              : 'bg-[#181119] border-fuchsia-900/40 hover:border-fuchsia-600/60 text-white'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-fuchsia-300 mb-1">
            <span>Em Produção</span>
            {metricas.emProducao > 0 ? (
              <span className="text-[9px] font-black bg-fuchsia-600 text-white px-1.5 rounded uppercase animate-pulse">
                RODANDO
              </span>
            ) : (
              <Play className="w-3.5 h-3.5 fill-fuchsia-400 text-fuchsia-400" />
            )}
          </div>
          <div className="text-2xl font-mono font-black text-fuchsia-200">{metricas.emProducao}</div>
          <div className="text-[9px] text-fuchsia-300/70 font-mono mt-0.5">Nas Envasadoras</div>
        </button>

        {/* Concluídos */}
        <button
          onClick={() => setFiltroStatus('concluidos')}
          className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
            filtroStatus === 'concluidos'
              ? 'bg-emerald-950/80 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400'
              : 'bg-[#181119] border-emerald-900/30 hover:border-emerald-600/60 text-white'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <span>Concluídos</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-black text-emerald-300">{metricas.concluidos}</div>
          <div className="text-[9px] text-emerald-400/70 font-mono mt-0.5">Baixados / Finalizados</div>
        </button>
      </div>

      {/* Barra de Filtros e Busca: Todos - Em produção - Lotes em Bloqueio - Concluídos */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#161616] p-3 rounded-lg border border-white/10">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setFiltroStatus('todos')}
            className={`px-3.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filtroStatus === 'todos'
                ? 'bg-white/20 text-white shadow ring-1 ring-white/30 font-black'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>Todos ({metricas.total})</span>
          </button>
          <button
            onClick={() => setFiltroStatus('em_producao')}
            className={`px-3.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filtroStatus === 'em_producao'
                ? 'bg-fuchsia-600 text-white shadow-[0_0_12px_rgba(217,70,239,0.4)] ring-1 ring-fuchsia-300'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Em Produção ({metricas.emProducao})</span>
            {metricas.emProducao > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            )}
          </button>
          <button
            onClick={() => setFiltroStatus('bloqueio')}
            className={`px-3.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filtroStatus === 'bloqueio'
                ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Aguardando Produção ({metricas.bloqueio})</span>
          </button>
          <button
            onClick={() => setFiltroStatus('concluidos')}
            className={`px-3.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filtroStatus === 'concluidos'
                ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Concluídos ({metricas.concluidos})</span>
          </button>
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por lote, produto, cliente..."
            className="w-full bg-black/60 border border-white/20 text-white text-xs pl-9 pr-3 py-1.5 rounded focus:outline-none focus:border-fuchsia-500 font-mono"
          />
        </div>
      </div>

      {/* Lista de Lotes de Bloqueio */}
      {lotesOrdenados.length === 0 ? (
        <div className="bg-[#161616] border border-white/10 rounded-lg p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-fuchsia-950 border border-fuchsia-600/40 text-fuchsia-400 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            {filtroStatus === 'bloqueio'
              ? 'Nenhum Lote Aguardando Produção'
              : filtroStatus === 'em_producao'
              ? 'Nenhum Lote em Produção'
              : filtroStatus === 'concluidos'
              ? 'Nenhum Lote Concluído'
              : 'Nenhum Lote Cadastrado'}
          </h3>
          <p className="text-xs text-white/50 max-w-md mx-auto">
            {busca
              ? 'Nenhum resultado para os termos da busca.'
              : filtroStatus === 'bloqueio'
              ? 'Cadastre os lotes já vendidos para alertar a produção com prioridade máxima.'
              : filtroStatus === 'em_producao'
              ? 'Quando uma envasadora iniciar o processamento de um lote de bloqueio, ele aparecerá aqui com destaque.'
              : filtroStatus === 'concluidos'
              ? 'Os lotes finalizados ou baixados aparecerão nesta lista.'
              : 'Cadastre um lote de bloqueio ou inicie uma máquina marcando a caixinha "Marcar como Bloqueio".'}
          </p>
          {(filtroStatus === 'bloqueio' || filtroStatus === 'todos') && (
            <button
              onClick={() => {
                limparFormulario();
                setModalCadastroAberto(true);
              }}
              className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded inline-flex items-center gap-2 cursor-pointer shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cadastrar Lote em Bloqueio</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {lotesOrdenados.map((lote) => {
            const emAndamento = lote.status === 'em_andamento';
            const concluido = lote.status === 'concluido';

            return (
              <div
                key={lote.id}
                id={`card-bloqueio-${lote.id}`}
                className={`rounded-lg p-4 border transition-all flex flex-col justify-between relative shadow-lg ${
                  concluido
                    ? 'bg-[#141414] border-white/10 opacity-75'
                    : emAndamento
                    ? 'bg-gradient-to-b from-[#2d0f36] via-[#1f0b26] to-[#140817] border-2 border-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.3)] ring-1 ring-fuchsia-300'
                    : 'bg-gradient-to-b from-[#260f1c] via-[#1a0b14] to-[#11070e] border border-red-800/60 hover:border-red-500/80'
                }`}
              >
                <div>
                  {/* Topo do Card: Número do Lote e Selo de Status */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm sm:text-base font-black text-white tracking-wider">
                          LOTE: {lote.numeroLote}
                        </span>
                        {emAndamento && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-fuchsia-600 text-white animate-pulse shadow">
                            RODANDO
                          </span>
                        )}
                      </div>
                      {lote.codigoProduto && (
                        <span className="text-[10px] font-mono text-fuchsia-300/70 block">
                          Cód: {lote.codigoProduto}
                        </span>
                      )}
                    </div>

                    {/* Selos: Lotes em Bloqueio - Em produção - Concluídos */}
                    {concluido ? (
                      <span className="text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Concluído</span>
                      </span>
                    ) : emAndamento ? (
                      <span className="text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider bg-fuchsia-600 text-white animate-pulse border border-fuchsia-400 shadow-[0_0_10px_rgba(217,70,239,0.7)] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        <span>EM PRODUÇÃO</span>
                      </span>
                    ) : (
                      <span className="text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider bg-red-600/30 text-red-300 border border-red-500/50 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-red-400" />
                        <span>LOTE EM BLOQUEIO</span>
                      </span>
                    )}
                  </div>

                  {/* Nome do Produto */}
                  <div
                    className="text-xs sm:text-sm font-bold text-white mb-2 leading-tight"
                    title={lote.produto}
                  >
                    {lote.produto}
                  </div>

                  {/* Detalhes de Máquina, Setor e Quantidade */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono mb-3 bg-black/40 p-2 rounded border border-white/5">
                    <div>
                      <span className="text-white/40 block text-[9px] uppercase">Envasadora / Compatibilidade:</span>
                      <span className="font-bold text-fuchsia-200 truncate block">
                        {lote.maquina &&
                        lote.maquina !== 'Todas' &&
                        lote.maquina !== 'Qualquer Máquina Compatível' ? (
                          lote.maquina
                        ) : (
                          (() => {
                            const compativas = maquinas.filter((m) =>
                              loteBloqueioCompativelComMaquina(lote, m, produtos)
                            );
                            if (compativas.length > 0) {
                              return compativas.map((m) => m.nome).join(', ');
                            }
                            return 'Qualquer Máquina Compatível';
                          })()
                        )}
                        {lote.setor && (
                          <span className="text-white/50 text-[10px]">
                            {' '}• {lote.setor === 'liquidos' ? 'Líquidos' : 'Semissólidos'}
                          </span>
                        )}
                      </span>
                    </div>

                    <div>
                      <span className="text-white/40 block text-[9px] uppercase">Quantidade:</span>
                      <span className="font-bold text-white">
                        {lote.quantidade || 'Lote Completo'}
                      </span>
                    </div>

                    {lote.cliente && (
                      <div className="col-span-2">
                        <span className="text-white/40 block text-[9px] uppercase">Cliente / Pedido:</span>
                        <span className="text-fuchsia-300 font-semibold truncate block">
                          {lote.cliente}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Alerta de Máquina em Uso atual */}
                  {emAndamento && (
                    <div className="text-[11px] bg-fuchsia-950/90 border border-fuchsia-500/70 text-fuchsia-200 font-bold p-2 rounded mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse shrink-0" />
                        <span>Em processamento na envasadora: <strong className="text-white uppercase font-black">{lote.maquina || 'Em Linha'}</strong></span>
                      </span>
                      {aoIrParaDashboard && (
                        <button
                          onClick={aoIrParaDashboard}
                          className="text-[10px] uppercase font-mono text-white underline hover:text-[#FFD100] shrink-0 ml-2"
                        >
                          Ver no Painel
                        </button>
                      )}
                    </div>
                  )}

                  {/* Observações */}
                  {lote.observacoes && (
                    <p className="text-[11px] text-white/50 italic mb-3 bg-white/5 p-1.5 rounded">
                      "{lote.observacoes}"
                    </p>
                  )}

                  {concluido && lote.finalizadoEm && (
                    <p className="text-[10px] font-mono text-emerald-400 mb-2">
                      Finalizado em: {new Date(lote.finalizadoEm).toLocaleString('pt-BR')}
                    </p>
                  )}
                </div>

                {/* Ações do Card */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    {!concluido ? (
                      <button
                        id={`btn-concluir-bloqueio-${lote.id}`}
                        onClick={() => concluirLoteBloqueio(lote.id)}
                        title="Dar baixa manual no lote (Marcar como concluído)"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded flex items-center gap-1 cursor-pointer transition-colors shadow"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Dar Baixa</span>
                      </button>
                    ) : (
                      <button
                        id={`btn-reabrir-bloqueio-${lote.id}`}
                        onClick={() =>
                          atualizarLoteBloqueio(lote.id, {
                            status: 'pendente',
                            finalizadoEm: undefined,
                            maquinaEmUsoId: undefined,
                          })
                        }
                        title="Reabrir lote de bloqueio pendente"
                        className="bg-white/10 hover:bg-white/20 text-white/80 text-[11px] font-bold uppercase tracking-wider px-2 py-1.5 rounded flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reabrir</span>
                      </button>
                    )}

                    {!concluido && !emAndamento && aoIrParaDashboard && (
                      <button
                        onClick={aoIrParaDashboard}
                        title="Ir para o Dashboard para iniciar este lote na máquina"
                        className="bg-fuchsia-700 hover:bg-fuchsia-600 text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Produzir</span>
                      </button>
                    )}
                  </div>

                  <button
                    id={`btn-excluir-bloqueio-${lote.id}`}
                    onClick={() => setLoteParaExcluir(lote.id)}
                    title="Excluir cadastro deste lote de bloqueio"
                    className="text-red-400/60 hover:text-red-400 p-1.5 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Cadastro de Lote de Bloqueio */}
      {modalCadastroAberto && (
        <div
          id="modal-cadastro-bloqueio-overlay"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => setModalCadastroAberto(false)}
        >
          <div
            id="modal-cadastro-bloqueio-container"
            className="bg-[#1c1322] border-2 border-fuchsia-500 rounded-lg w-full max-w-xl shadow-[0_0_35px_rgba(217,70,239,0.3)] overflow-hidden text-white my-6 flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Topo do Modal */}
            <div className="bg-[#140b19] px-4 py-3.5 border-b border-fuchsia-900/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-fuchsia-600 text-white flex items-center justify-center shadow">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base uppercase tracking-wider text-white">
                    Cadastrar Lote de Bloqueio
                  </h3>
                  <p className="text-[10px] text-fuchsia-300/70 font-mono">
                    Lote já vendido • Prioridade Máxima no Chão de Fábrica
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalCadastroAberto(false)}
                className="p-1 text-white/40 hover:text-white rounded hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSalvarLote} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
              {/* Seleção rápida ou digitação de produto */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-fuchsia-300 mb-1 flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-fuchsia-400" />
                  <span>Produto</span>
                  <span className="text-red-400 font-bold">*</span>
                </label>

                {/* Campo de Busca de Produtos Cadastrados */}
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={buscaProdutoModal}
                    onChange={(e) => setBuscaProdutoModal(e.target.value)}
                    placeholder="Pesquisar produto pelo catálogo da fábrica (ex: Bepantriz, Aciclovir)..."
                    className="w-full bg-black/60 border border-fuchsia-900/80 text-white text-xs px-3 py-1.5 rounded focus:outline-none focus:border-fuchsia-400"
                  />

                  {/* Pílulas de sugestão rápida */}
                  {produtosSugeridosModal.length > 0 && buscaProdutoModal && (
                    <div className="max-h-32 overflow-y-auto bg-black/80 border border-fuchsia-800/60 rounded p-1 space-y-0.5">
                      {produtosSugeridosModal.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => selecionarProdutoModal(p)}
                          className="w-full text-left px-2 py-1 text-xs text-white/90 hover:bg-fuchsia-900/60 rounded flex items-center justify-between"
                        >
                          <span className="font-bold truncate">{p.nome}</span>
                          <span className="text-[10px] font-mono text-fuchsia-400 shrink-0 ml-2">
                            {p.codigo || p.setor}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Nome do Produto Definido */}
                  <input
                    type="text"
                    value={produtoNome}
                    onChange={(e) => setProdutoNome(e.target.value)}
                    placeholder="Nome completo do produto..."
                    required
                    className="w-full bg-black/60 border border-white/20 text-white font-bold text-xs sm:text-sm px-3 py-2 rounded focus:outline-none focus:border-fuchsia-400"
                  />
                </div>
              </div>

              {/* Número do Lote e Código */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-fuchsia-300 mb-1 flex items-center gap-1.5">
                    <Hash className="w-3 h-3 text-fuchsia-400" />
                    <span>Número do Lote</span>
                    <span className="text-red-400 font-bold">*</span>
                  </label>
                  <input
                    id="input-cadastrar-numero-lote"
                    type="text"
                    value={numeroLote}
                    onChange={(e) => setNumeroLote(e.target.value)}
                    placeholder="Ex: 100031-L01, 2026-B08..."
                    required
                    className="w-full bg-black/60 border border-fuchsia-500 text-fuchsia-200 font-mono text-sm font-black px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-fuchsia-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">
                    Código do Produto (Opcional)
                  </label>
                  <input
                    type="text"
                    value={codigoProduto}
                    onChange={(e) => setCodigoProduto(e.target.value)}
                    placeholder="Ex: 100031, 100003..."
                    className="w-full bg-black/60 border border-white/20 text-white font-mono text-xs px-3 py-2 rounded focus:outline-none focus:border-fuchsia-400"
                  />
                </div>
              </div>

              {/* Data Limite Prevista (Opcional) */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-fuchsia-400" />
                  <span>Data Limite Prevista (Opcional)</span>
                </label>
                <input
                  type="date"
                  value={dataLimiteCustom}
                  onChange={(e) => setDataLimiteCustom(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 text-white text-xs px-3 py-2 rounded focus:outline-none focus:border-fuchsia-400 font-mono"
                />
              </div>

              {/* Máquina e Setor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">
                    Máquina / Envasadora
                  </label>
                  <select
                    value={maquinaDestino}
                    onChange={(e) => setMaquinaDestino(e.target.value)}
                    className="w-full bg-black/60 border border-white/20 text-white text-xs font-bold px-3 py-2 rounded focus:outline-none focus:border-fuchsia-400"
                  >
                    <option value="Todas">
                      Qualquer Máquina Compatível{' '}
                      {produtoModalDetectado && maquinasCompativeisModal.length > 0
                        ? `(${maquinasCompativeisModal.map((m) => m.nome).join(', ')})`
                        : ''}
                    </option>
                    {maquinas.map((m) => {
                      const ehCompativel = produtoModalDetectado
                        ? produtoVinculadoAMaquina(produtoModalDetectado, m)
                        : true;
                      return (
                        <option key={m.id} value={m.nome} disabled={!ehCompativel}>
                          {m.nome} ({m.setor === 'liquidos' ? 'Líquidos' : 'Semissólidos'})
                          {!ehCompativel ? ' — Incompatível' : ''}
                        </option>
                      );
                    })}
                  </select>

                  {/* Indicador de compatibilidade do produto */}
                  {produtoModalDetectado && (
                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                      <span className="text-white/40 text-[9px] uppercase font-mono">Compatível com:</span>
                      {maquinasCompativeisModal.length > 0 ? (
                        maquinasCompativeisModal.map((m) => (
                          <span
                            key={m.id}
                            className="bg-fuchsia-950/90 border border-fuchsia-500/50 text-fuchsia-200 px-1.5 py-0.5 rounded font-bold text-[10px]"
                          >
                            {m.nome}
                          </span>
                        ))
                      ) : (
                        <span className="text-amber-400 text-[10px] font-bold">Nenhuma máquina vinculada</span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">
                    Setor da Fábrica
                  </label>
                  <select
                    value={setorDestino}
                    onChange={(e) => setSetorDestino(e.target.value as 'todos' | Setor)}
                    className="w-full bg-black/60 border border-white/20 text-white text-xs font-bold px-3 py-2 rounded focus:outline-none focus:border-fuchsia-400"
                  >
                    <option value="todos">Todos os Setores</option>
                    <option value="liquidos">Setor Líquidos</option>
                    <option value="semissolidos">Setor Semissólidos</option>
                  </select>
                </div>
              </div>

              {/* Quantidade e Cliente/Pedido */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">
                    Quantidade Prevista (Opcional)
                  </label>
                  <input
                    type="text"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    placeholder="Ex: 50.000 bisnagas, 120 caixas..."
                    className="w-full bg-black/60 border border-white/20 text-white text-xs px-3 py-2 rounded focus:outline-none focus:border-fuchsia-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">
                    Cliente / Pedido de Venda (Opcional)
                  </label>
                  <input
                    type="text"
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                    placeholder="Ex: Raia Drogasil - Pedido 9482..."
                    className="w-full bg-black/60 border border-white/20 text-white text-xs px-3 py-2 rounded focus:outline-none focus:border-fuchsia-400"
                  />
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">
                  Observações para a Produção (Opcional)
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={2}
                  placeholder="Instruções de prioridade ou notas de expedição..."
                  className="w-full bg-black/60 border border-white/20 text-white text-xs px-3 py-2 rounded focus:outline-none focus:border-fuchsia-400 resize-none"
                />
              </div>

              {/* Rodapé de Ações do Modal */}
              <div className="pt-3 border-t border-fuchsia-900/60 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalCadastroAberto(false)}
                  className="px-4 py-2 rounded text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold uppercase tracking-wider px-5 py-2 rounded shadow-[0_0_15px_rgba(217,70,239,0.5)] cursor-pointer disabled:opacity-50"
                >
                  {salvando ? 'Cadastrando...' : 'Salvar Lote de Bloqueio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {loteParaExcluir && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLoteParaExcluir(null)}
        >
          <div
            className="bg-[#1c1322] border border-red-500/80 rounded-lg p-5 max-w-sm w-full text-white space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="font-bold text-sm uppercase tracking-wider">Confirmar Exclusão</h4>
            </div>
            <p className="text-xs text-white/70">
              Deseja realmente remover este lote de bloqueio? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setLoteParaExcluir(null)}
                className="px-3 py-1.5 text-xs text-white/60 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => confirmarExcluirLote(loteParaExcluir)}
                className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
