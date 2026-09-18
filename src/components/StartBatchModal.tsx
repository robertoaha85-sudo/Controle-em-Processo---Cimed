import React, { useState, useMemo, useRef, useEffect } from 'react';
import { X, Play, Search, Clock, Check, AlertCircle, Hash, Layers, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Maquina, Produto, LoteBloqueio } from '../types';
import { useProduction } from '../context/ProductionContext';
import {
  formatarMinutosParaTexto,
  calcularPrevisaoTermino,
  obterTempoProdutoParaMaquina,
  produtoVinculadoAMaquina,
  loteBloqueioCompativelComMaquina,
} from '../initialData';

interface StartBatchModalProps {
  maquina: Maquina | null;
  aoFechar: () => void;
}

export const StartBatchModal: React.FC<StartBatchModalProps> = ({ maquina, aoFechar }) => {
  const { produtos, iniciarLote, horaAtual, lotesBloqueio, verificarLoteBloqueio } = useProduction();

  const [busca, setBusca] = useState('');
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState<string>('');
  const [apenasVinculados, setApenasVinculados] = useState(false);

  // Data e hora padrão
  const agora = horaAtual;
  const dataPadraoStr = agora.toISOString().split('T')[0];
  const horaPadraoStr = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;

  const [dataInicio, setDataInicio] = useState(dataPadraoStr);
  const [horaInicio, setHoraInicio] = useState(horaPadraoStr);
  const [numeroLote, setNumeroLote] = useState('');
  const [forcarBloqueio, setForcarBloqueio] = useState(false);
  const [bloqueioIdSelecionado, setBloqueioIdSelecionado] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const inputBuscaRef = useRef<HTMLInputElement>(null);

  // Foco no campo de lote ao abrir
  useEffect(() => {
    const timer = setTimeout(() => {
      const el = document.getElementById('input-numero-lote-modal');
      if (el) el.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Lotes de bloqueio pendentes estritamente compatíveis com esta máquina
  const bloqueiosCompativeis = useMemo(() => {
    if (!maquina) return [];
    return lotesBloqueio.filter((b) => {
      if (b.status === 'concluido' || b.status === 'cancelado') return false;
      if (b.status === 'em_andamento') return false;
      return loteBloqueioCompativelComMaquina(b, maquina, produtos);
    });
  }, [maquina, lotesBloqueio, produtos]);

  // Produtos filtrados por setor da máquina e busca (código ou nome)
  const produtosFiltrados = useMemo(() => {
    if (!maquina) return [];

    const termoBusca = busca.trim().toLowerCase();

    return produtos
      .filter((p) => {
        // Filtro básico por setor
        if (p.setor !== maquina.setor) return false;

        // Se o usuário optar por apenas vinculados à máquina
        if (apenasVinculados && !produtoVinculadoAMaquina(p, maquina)) {
          return false;
        }

        // Filtro de busca por nome OU código OU máquina/linha vinculada
        if (termoBusca) {
          const matchCodigo = p.codigo ? p.codigo.toLowerCase().includes(termoBusca) : false;
          const matchNome = p.nome.toLowerCase().includes(termoBusca);
          const matchLinha = p.linha.toLowerCase().includes(termoBusca);
          const matchVinculo = p.vinculos?.some((v) => v.linhaOuMaquina.toLowerCase().includes(termoBusca));
          return matchCodigo || matchNome || matchLinha || matchVinculo;
        }

        return true;
      })
      .sort((a, b) => {
        // Prioriza produtos vinculados diretamente a esta máquina
        const aVinculado = produtoVinculadoAMaquina(a, maquina);
        const bVinculado = produtoVinculadoAMaquina(b, maquina);

        if (aVinculado && !bVinculado) return -1;
        if (!aVinculado && bVinculado) return 1;

        // Se ambos são vinculados ou não, ordena alfabeticamente pelo código e nome
        return a.nome.localeCompare(b.nome);
      });
  }, [produtos, maquina, busca, apenasVinculados]);

  // Produto atualmente selecionado
  const produtoSelecionado = useMemo(() => {
    return produtos.find((p) => p.id === produtoSelecionadoId);
  }, [produtos, produtoSelecionadoId]);

  // Detecta se o número de lote digitado pelo usuário corresponde a um Lote de Bloqueio cadastrado
  const bloqueioDetectado = useMemo(() => {
    if (!maquina) return undefined;

    if (bloqueioIdSelecionado) {
      const achado = lotesBloqueio.find((b) => b.id === bloqueioIdSelecionado);
      if (achado && loteBloqueioCompativelComMaquina(achado, maquina, produtos)) {
        return achado;
      }
    }
    const loteLimpo = numeroLote.trim();
    // Exige estritamente o número do lote digitado para evitar falso positivo automático
    if (!loteLimpo) return undefined;

    const achado = verificarLoteBloqueio(
      produtoSelecionado?.nome || produtoSelecionado?.codigo || '',
      loteLimpo,
      maquina.nome
    );
    if (achado && loteBloqueioCompativelComMaquina(achado, maquina, produtos)) {
      return achado;
    }
    return undefined;
  }, [bloqueioIdSelecionado, produtoSelecionado, numeroLote, maquina, lotesBloqueio, produtos, verificarLoteBloqueio]);

  const ehLoteBloqueio = Boolean(bloqueioDetectado || forcarBloqueio);

  // Ação de preenchimento rápido ao clicar em um Lote de Bloqueio pendente
  const selecionarLoteBloqueioRapido = (bloqueio: LoteBloqueio) => {
    setNumeroLote(bloqueio.numeroLote);
    setBloqueioIdSelecionado(bloqueio.id);
    setForcarBloqueio(true);

    const prodEncontrado = produtos.find((p) => {
      if (bloqueio.codigoProduto && p.codigo === bloqueio.codigoProduto) return true;
      const nomeP = p.nome.toLowerCase().trim();
      const nomeB = bloqueio.produto.toLowerCase().trim();
      return nomeP === nomeB || nomeP.includes(nomeB) || nomeB.includes(nomeP);
    });

    if (prodEncontrado) {
      setProdutoSelecionadoId(prodEncontrado.id);
    }
  };

  // Tempo de envase específico para ESTA máquina
  const tempoEnvaseMaquina = useMemo(() => {
    if (!produtoSelecionado || !maquina) return 0;
    return obterTempoProdutoParaMaquina(produtoSelecionado, maquina);
  }, [produtoSelecionado, maquina]);

  // Previsão de término calculada com o tempo da máquina
  const previsaoCalculada = useMemo(() => {
    if (!tempoEnvaseMaquina || !horaInicio) return '--:--';
    return calcularPrevisaoTermino(horaInicio, tempoEnvaseMaquina);
  }, [tempoEnvaseMaquina, horaInicio]);

  if (!maquina) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoSelecionadoId || !dataInicio || !horaInicio || !numeroLote.trim()) return;

    setSalvando(true);
    try {
      await iniciarLote(
        maquina.id,
        produtoSelecionadoId,
        dataInicio,
        horaInicio,
        numeroLote.trim(),
        tempoEnvaseMaquina,
        ehLoteBloqueio,
        bloqueioDetectado?.id || bloqueioIdSelecionado || undefined
      );
      aoFechar();
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div
      id="modal-iniciar-lote-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={aoFechar}
    >
      <div
        id="modal-iniciar-lote-container"
        className="bg-[#1a1a1a] border border-white/20 rounded w-full max-w-xl shadow-2xl overflow-hidden text-white my-6 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="bg-[#111111] px-4 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#FFD100] text-black font-black flex items-center justify-center text-xs shadow">
              <Play className="w-4 h-4 fill-black ml-0.5" />
            </div>
            <div>
              <h2 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-white flex items-center gap-2">
                <span>Iniciar Lote de Produção</span>
                <span className="text-[10px] bg-[#FFD100]/20 text-[#FFD100] border border-[#FFD100]/40 px-2 py-0.5 rounded font-mono font-bold">
                  {maquina.nome}
                </span>
              </h2>
              <p className="text-[10px] text-white/50 uppercase tracking-wider font-mono mt-0.5">
                {maquina.setor === 'liquidos' ? 'Setor Líquidos' : 'Setor Semissólidos'}
              </p>
            </div>
          </div>
          <button
            id="btn-fechar-modal"
            onClick={aoFechar}
            className="p-1.5 text-white/40 hover:text-white rounded hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulário com Scroll Interno */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Sugestões de Lotes de Bloqueio Pendentes para esta máquina */}
          {bloqueiosCompativeis.length > 0 && (
            <div className="bg-fuchsia-950/40 border border-fuchsia-500/40 rounded p-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-fuchsia-300 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" />
                  <span>Lotes de Bloqueio Pendentes para {maquina.nome}</span>
                </span>
                <span className="text-[9px] text-fuchsia-400/80 hidden sm:inline">Clique para preencher</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {bloqueiosCompativeis.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => selecionarLoteBloqueioRapido(b)}
                    className={`text-left text-[11px] px-2.5 py-1.5 rounded border transition-all flex items-center gap-2 cursor-pointer ${
                      bloqueioIdSelecionado === b.id || numeroLote.trim() === b.numeroLote.trim()
                        ? 'bg-fuchsia-600 text-white border-fuchsia-300 shadow-md font-bold'
                        : 'bg-black/60 text-fuchsia-200 border-fuchsia-800 hover:border-fuchsia-500 hover:bg-fuchsia-900/40'
                    }`}
                  >
                    <span className="font-mono font-black">{b.numeroLote}</span>
                    <span className="text-white/40">|</span>
                    <span className="truncate max-w-[130px] text-[10px]">{b.produto}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-black/40 uppercase font-mono font-bold text-fuchsia-300">
                      {b.prazo === 'hoje' ? 'HOJE' : b.prazo === 'semana' ? 'SEMANA' : 'MÊS'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Alerta de Lote de Bloqueio Identificado */}
          {ehLoteBloqueio && (
            <div
              id="alerta-bloqueio-detectado-modal"
              className="bg-fuchsia-950/90 border-2 border-fuchsia-500 text-fuchsia-100 rounded p-3 flex items-start gap-2.5 shadow-[0_0_20px_rgba(217,70,239,0.3)] animate-pulse"
            >
              <ShieldAlert className="w-5 h-5 text-fuchsia-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-black text-xs uppercase tracking-wider text-white">
                    Lote de Bloqueio Detectado (Prioridade Máxima)
                  </span>
                  <span className="bg-fuchsia-600 text-white text-[9px] px-1.5 py-0.2 rounded font-black tracking-widest uppercase shadow">
                    BLOQUEIO
                  </span>
                </div>
                <p className="text-[11px] text-fuchsia-200/90 leading-tight">
                  Este lote possui prioridade máxima (venda antecipada). Ao iniciar, o card da máquina mostrará o
                  alerta visual magenta e a etiqueta piscando <strong>"BLOQUEIO"</strong> durante todo o processamento.
                </p>
              </div>
            </div>
          )}

          {/* Número do Lote */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Hash className="w-3 h-3 text-[#FFD100]" />
                <span>Número do Lote</span>
                <span className="text-red-400 font-bold">*</span>
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-fuchsia-400 hover:text-fuchsia-300">
                <input
                  type="checkbox"
                  checked={ehLoteBloqueio}
                  onChange={(e) => {
                    setForcarBloqueio(e.target.checked);
                    if (!e.target.checked) setBloqueioIdSelecionado(null);
                  }}
                  className="w-3.5 h-3.5 rounded accent-fuchsia-600 cursor-pointer"
                />
                <span className="font-bold uppercase tracking-wide">Marcar como Bloqueio</span>
              </label>
            </label>
            <input
              id="input-numero-lote-modal"
              type="text"
              value={numeroLote}
              onChange={(e) => setNumeroLote(e.target.value)}
              placeholder="Digite o número do lote (ex: 104523, 2026-L01)..."
              required
              className={`w-full bg-black/60 border text-white font-mono text-sm font-bold px-3 py-2 rounded focus:outline-none ${
                ehLoteBloqueio
                  ? 'border-fuchsia-500 ring-1 ring-fuchsia-500 text-fuchsia-200'
                  : 'border-white/20 focus:border-[#FFD100] focus:ring-1 focus:ring-[#FFD100]'
              }`}
            />
          </div>

          {/* Data e Hora de Início */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">
                Data de Início
              </label>
              <input
                id="input-data-inicio-modal"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                required
                className="w-full bg-black/60 border border-white/20 text-white font-mono text-xs sm:text-sm font-bold px-3 py-2 rounded focus:outline-none focus:border-[#FFD100]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1 flex items-center justify-between">
                <span>Horário de Início</span>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    setHoraInicio(
                      `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
                    );
                    setDataInicio(d.toISOString().split('T')[0]);
                  }}
                  className="text-[9px] text-[#FFD100] hover:underline uppercase font-bold"
                >
                  Agora
                </button>
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  id="input-hora-inicio-modal"
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  required
                  className="w-full bg-black/60 border border-white/20 text-white font-mono text-xs sm:text-sm font-bold pl-9 pr-3 py-2 rounded focus:outline-none focus:border-[#FFD100]"
                />
              </div>
            </div>
          </div>

          {/* Seleção de Produto com Busca em Tempo Real */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-[#FFD100]" />
                <span>Selecione o Produto (Tempo Específico p/ {maquina.nome})</span>
                <span className="text-red-400 font-bold">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setApenasVinculados(!apenasVinculados)}
                  className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-colors ${
                    apenasVinculados
                      ? 'bg-[#FFD100] text-black font-bold border-[#FFD100]'
                      : 'bg-white/5 text-white/50 border-white/10 hover:text-white'
                  }`}
                >
                  {apenasVinculados ? '✓ Apenas vinculados' : 'Filtrar vinculados'}
                </button>
              </div>
            </div>

            {/* Campo de Busca em Tempo Real */}
            <div className="relative mb-2">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                ref={inputBuscaRef}
                id="input-busca-produto-modal"
                type="text"
                placeholder="Buscar por código (ex: 100000) ou nome do produto..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full bg-black/70 border border-white/20 text-xs sm:text-sm text-white pl-9 pr-8 py-2 rounded focus:outline-none focus:border-[#FFD100] focus:ring-1 focus:ring-[#FFD100]"
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => setBusca('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] text-white/40 mb-1.5 font-mono px-0.5">
              <span>{produtosFiltrados.length} produto(s) encontrado(s)</span>
              <span>Tempo de envase específico para: <strong className="text-white">{maquina.nome}</strong></span>
            </div>

            {/* Lista com scroll de produtos */}
            <div className="max-h-56 overflow-y-auto border border-white/15 rounded divide-y divide-white/5 bg-black/50 shadow-inner">
              {produtosFiltrados.length === 0 ? (
                <div className="p-6 text-center text-xs text-white/40 flex flex-col items-center gap-1.5">
                  <AlertCircle className="w-5 h-5 text-white/30" />
                  <span className="font-semibold text-white/60">Nenhum produto encontrado</span>
                  <span className="text-[11px]">
                    Tente buscar por outro código ou nome, ou desmarque o filtro de vinculados.
                  </span>
                </div>
              ) : (
                produtosFiltrados.map((p) => {
                  const isSelected = produtoSelecionadoId === p.id;
                  const tempoParaEstaMaquina = obterTempoProdutoParaMaquina(p, maquina);
                  const isVinculadoEstaMaquina = produtoVinculadoAMaquina(p, maquina);

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProdutoSelecionadoId(p.id)}
                      className={`w-full text-left px-3 py-2.5 flex items-center justify-between gap-3 transition-colors ${
                        isSelected
                          ? 'bg-[#FFD100]/20 text-white border-l-4 border-[#FFD100]'
                          : 'hover:bg-white/5 text-white/90'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {/* Código do Produto */}
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-[#FFD100] border border-white/10">
                            CÓD {p.codigo || '—'}
                          </span>

                          {/* Tag de vínculo com esta máquina */}
                          {isVinculadoEstaMaquina ? (
                            <span className="text-[9px] uppercase font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-700/50 px-1.5 py-0.2 rounded">
                              Linha {maquina.nome}
                            </span>
                          ) : (
                            <span className="text-[9px] uppercase font-mono text-white/40">
                              {p.linha}
                            </span>
                          )}

                          {/* Se tiver múltiplos vínculos */}
                          {p.vinculos && p.vinculos.length > 1 && (
                            <span className="text-[9px] text-white/50 font-mono">
                              ({p.vinculos.length} máquinas vinculadas)
                            </span>
                          )}
                        </div>

                        {/* Nome do Produto */}
                        <div className="font-semibold text-xs text-white leading-snug">
                          {p.nome}
                        </div>

                        {/* Outros vínculos informativos */}
                        {p.vinculos && p.vinculos.length > 1 && (
                          <div className="text-[9px] text-white/40 mt-1 flex flex-wrap gap-1 font-mono">
                            {p.vinculos.map((v, idx) => (
                              <span
                                key={idx}
                                className={`px-1 py-0.2 rounded ${
                                  v.linhaOuMaquina.toLowerCase() === maquina.nome.toLowerCase()
                                    ? 'text-[#FFD100] font-bold bg-[#FFD100]/10 border border-[#FFD100]/30'
                                    : 'bg-white/5 text-white/40'
                                }`}
                              >
                                {v.linhaOuMaquina}: {formatarMinutosParaTexto(v.tempoEnvaseMinutos)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Tempo e Status de Seleção */}
                      <div className="text-right whitespace-nowrap shrink-0 pl-2">
                        <div className="text-[12px] font-mono font-bold text-[#FFD100]">
                          {formatarMinutosParaTexto(tempoParaEstaMaquina)}
                        </div>
                        <div className="text-[9px] text-white/40 uppercase font-mono mt-0.5">
                          tempo em {maquina.nome}
                        </div>
                        {isSelected && (
                          <div className="text-[10px] text-emerald-400 font-bold uppercase flex items-center justify-end gap-1 mt-1">
                            <Check className="w-3 h-3" />
                            <span>Selecionado</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Resumo da Previsão Calculada para Esta Máquina */}
          {produtoSelecionado && (
            <div className="bg-black/60 border border-[#FFD100]/30 rounded p-3.5 space-y-2.5 shadow-lg">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-white uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Produto Selecionado</span>
                </div>
                <span className="text-[10px] font-mono text-[#FFD100] font-bold">
                  CÓDIGO: {produtoSelecionado.codigo}
                </span>
              </div>

              <div className="text-xs font-bold text-white leading-tight">
                {produtoSelecionado.nome}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-[#141414] p-2 rounded border border-white/10">
                  <div className="text-[9px] text-white/50 uppercase font-bold">Início</div>
                  <div className="font-mono text-xs sm:text-sm font-bold text-white mt-0.5">
                    {horaInicio || '--:--'}
                  </div>
                </div>

                <div className="bg-[#141414] p-2 rounded border border-white/10">
                  <div className="text-[9px] text-white/50 uppercase font-bold">
                    Tempo em {maquina.nome}
                  </div>
                  <div className="font-mono text-xs sm:text-sm font-bold text-[#FFD100] mt-0.5">
                    {formatarMinutosParaTexto(tempoEnvaseMaquina)}
                  </div>
                </div>

                <div className="bg-[#FFD100]/15 border border-[#FFD100]/40 p-2 rounded">
                  <div className="text-[9px] text-[#FFD100] font-bold uppercase tracking-wider">
                    Previsão Término
                  </div>
                  <div className="font-mono text-sm sm:text-base font-black text-[#FFD100] mt-0.5">
                    {previsaoCalculada}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-white/10 shrink-0">
            <button
              type="button"
              onClick={aoFechar}
              className="px-3.5 py-2 rounded text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white bg-white/5 border border-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              id="btn-confirmar-iniciar-lote"
              type="submit"
              disabled={!produtoSelecionadoId || !horaInicio || !numeroLote.trim() || salvando}
              className="bg-[#FFD100] hover:bg-[#ffe043] disabled:opacity-40 disabled:cursor-not-allowed text-black font-black uppercase tracking-wider px-5 py-2 rounded text-xs transition-colors flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{salvando ? 'Iniciando...' : 'Iniciar Lote'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
