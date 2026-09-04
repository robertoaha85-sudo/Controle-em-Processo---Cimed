import React, { useState, useMemo } from 'react';
import { X, Play, Search, Clock, Check, AlertCircle } from 'lucide-react';
import { Maquina, Produto } from '../types';
import { useProduction } from '../context/ProductionContext';
import { formatarMinutosParaTexto, calcularPrevisaoTermino } from '../initialData';

interface StartBatchModalProps {
  maquina: Maquina | null;
  aoFechar: () => void;
}

export const StartBatchModal: React.FC<StartBatchModalProps> = ({ maquina, aoFechar }) => {
  const { produtos, iniciarLote, horaAtual } = useProduction();

  const [busca, setBusca] = useState('');
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState<string>('');
  
  // Data e hora padrão
  const agora = horaAtual;
  const dataPadraoStr = agora.toISOString().split('T')[0];
  const horaPadraoStr = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
  
  const [dataInicio, setDataInicio] = useState(dataPadraoStr);
  const [horaInicio, setHoraInicio] = useState(horaPadraoStr);
  const [numeroLote, setNumeroLote] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Produtos filtrados por setor da máquina
  const produtosFiltrados = useMemo(() => {
    if (!maquina) return [];
    return produtos
      .filter((p) => p.setor === maquina.setor)
      .filter((p) => {
        if (!busca.trim()) return true;
        const b = busca.toLowerCase();
        return p.nome.toLowerCase().includes(b) || p.linha.toLowerCase().includes(b);
      })
      .sort((a, b) => {
        // Prioriza a linha padrão da máquina
        if (maquina.linhaPadrao) {
          const aMatch = a.linha.toLowerCase() === maquina.linhaPadrao.toLowerCase();
          const bMatch = b.linha.toLowerCase() === maquina.linhaPadrao.toLowerCase();
          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;
        }
        return a.nome.localeCompare(b.nome);
      });
  }, [produtos, maquina, busca]);

  const produtoSelecionado = useMemo(() => {
    return produtos.find((p) => p.id === produtoSelecionadoId);
  }, [produtos, produtoSelecionadoId]);

  const previsaoCalculada = useMemo(() => {
    if (!produtoSelecionado || !horaInicio) return '--:--';
    return calcularPrevisaoTermino(horaInicio, produtoSelecionado.tempoEnvaseMinutos);
  }, [produtoSelecionado, horaInicio]);

  if (!maquina) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoSelecionadoId || !dataInicio || !horaInicio || !numeroLote) return;

    setSalvando(true);
    try {
      await iniciarLote(maquina.id, produtoSelecionadoId, dataInicio, horaInicio, numeroLote);
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
        className="bg-[#1a1a1a] border border-white/20 rounded w-full max-w-lg shadow-2xl overflow-hidden text-white my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="bg-[#111111] px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#FFD100] text-black font-black flex items-center justify-center text-xs shadow">
              <Play className="w-3.5 h-3.5 fill-black" />
            </div>
            <div>
              <h2 className="font-bold text-xs uppercase tracking-wider text-white">Iniciar Lote de Produção</h2>
              <p className="text-[10px] text-[#FFD100] font-mono uppercase">
                {maquina.nome} • {maquina.setor === 'liquidos' ? 'Setor Líquidos' : 'Setor Semissólidos'}
              </p>
            </div>
          </div>
          <button
            id="btn-fechar-modal"
            onClick={aoFechar}
            className="p-1 text-white/40 hover:text-white rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          {/* Lote */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">
              Número do Lote
            </label>
            <input
              id="input-numero-lote-modal"
              type="text"
              value={numeroLote}
              onChange={(e) => setNumeroLote(e.target.value)}
              placeholder="Ex: 123456"
              required
              className="w-full bg-black/60 border border-white/10 text-white font-mono text-sm font-bold px-3 py-2 rounded focus:outline-none focus:border-[#FFD100]"
            />
          </div>

          {/* Data e Hora de Início */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">
                Data de Início
              </label>
              <input
                id="input-data-inicio-modal"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                required
                className="w-full bg-black/60 border border-white/10 text-white font-mono text-sm font-bold px-3 py-2 rounded focus:outline-none focus:border-[#FFD100]"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1 flex items-center justify-between">
                <span>Horário</span>
                <button
                  type="button"
                  onClick={() => {
                    const agora = new Date();
                    setHoraInicio(
                      `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`
                    );
                    setDataInicio(agora.toISOString().split('T')[0]);
                  }}
                  className="text-[9px] text-[#FFD100] hover:underline uppercase font-bold"
                >
                  Agora
                </button>
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  id="input-hora-inicio-modal"
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  required
                  className="w-full bg-black/60 border border-white/10 text-white font-mono text-sm font-bold pl-9 pr-3 py-2 rounded focus:outline-none focus:border-[#FFD100]"
                />
              </div>
            </div>
          </div>

          {/* Seleção de Produto com Busca */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">
              Selecione o Produto para Envase
            </label>
            
            {/* Campo de Busca rápida */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                id="input-busca-produto-modal"
                type="text"
                placeholder="Buscar por nome ou linha..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full bg-black/60 border border-white/10 text-xs text-white pl-8 pr-3 py-1.5 rounded focus:outline-none focus:border-[#FFD100]"
              />
            </div>

            {/* Lista com scroll de produtos */}
            <div className="max-h-48 overflow-y-auto border border-white/10 rounded divide-y divide-white/5 bg-black/40">
              {produtosFiltrados.length === 0 ? (
                <div className="p-4 text-center text-xs text-white/40 flex flex-col items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-white/30" />
                  <span>Nenhum produto cadastrado para este setor.</span>
                </div>
              ) : (
                produtosFiltrados.map((p) => {
                  const isSelected = produtoSelecionadoId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProdutoSelecionadoId(p.id)}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-[#FFD100]/15 text-[#FFD100] border-l-4 border-[#FFD100]'
                          : 'hover:bg-white/5 text-white/80'
                      }`}
                    >
                      <div className="pr-2 truncate">
                        <div className="font-semibold text-xs text-white truncate">
                          {p.nome}
                        </div>
                        <div className="text-[10px] text-white/40 mt-0.5 flex items-center gap-2 font-mono">
                          <span>{p.linha}</span>
                        </div>
                      </div>
                      <div className="text-right whitespace-nowrap pl-2">
                        <div className="text-[11px] font-mono font-bold text-[#FFD100]">
                          {formatarMinutosParaTexto(p.tempoEnvaseMinutos)}
                        </div>
                        {isSelected && (
                          <div className="text-[9px] text-emerald-400 font-bold uppercase flex items-center justify-end gap-0.5 mt-0.5">
                            <Check className="w-3 h-3" />
                            <span>OK</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Resumo da Previsão Calculada */}
          {produtoSelecionado && (
            <div className="bg-black/50 border border-white/10 rounded p-3 space-y-2">
              <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
                Cálculo Automático de Previsão
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#141414] p-1.5 rounded border border-white/5">
                  <div className="text-[9px] text-white/40 uppercase">Início</div>
                  <div className="font-mono text-xs font-bold text-white mt-0.5">{horaInicio}</div>
                </div>
                <div className="bg-[#141414] p-1.5 rounded border border-white/5">
                  <div className="text-[9px] text-white/40 uppercase">Padrão</div>
                  <div className="font-mono text-xs font-bold text-[#FFD100] mt-0.5">
                    {formatarMinutosParaTexto(produtoSelecionado.tempoEnvaseMinutos)}
                  </div>
                </div>
                <div className="bg-[#FFD100]/20 border border-[#FFD100]/40 p-1.5 rounded">
                  <div className="text-[9px] text-[#FFD100] font-bold uppercase">Previsão</div>
                  <div className="font-mono text-sm font-black text-[#FFD100] mt-0.5">
                    {previsaoCalculada}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
            <button
              type="button"
              onClick={aoFechar}
              className="px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white bg-white/5 border border-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              id="btn-confirmar-iniciar-lote"
              type="submit"
              disabled={!produtoSelecionadoId || !horaInicio || salvando}
              className="bg-[#FFD100] hover:bg-[#ffe043] disabled:opacity-50 text-black font-black uppercase tracking-wider px-4 py-1.5 rounded text-xs transition-colors flex items-center gap-1.5 shadow cursor-pointer"
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
