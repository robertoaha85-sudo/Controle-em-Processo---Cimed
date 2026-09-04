import React, { useState, useMemo } from 'react';
import {
  Clock,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Download,
  Trash2,
  Layers,
  Droplet,
  FileSpreadsheet,
} from 'lucide-react';
import { LoteHistorico, Setor } from '../types';
import { useProduction } from '../context/ProductionContext';
import { formatarMinutosParaTexto } from '../initialData';

export const HistoryTab: React.FC = () => {
  const { historico, maquinas, excluirLoteHistorico } = useProduction();

  const [busca, setBusca] = useState('');
  const [maquinaFiltro, setMaquinaFiltro] = useState('todas');
  const [setorFiltro, setSetorFiltro] = useState<'todos' | Setor>('todos');
  const [dataFiltro, setDataFiltro] = useState('');
  const [apenasProblemas, setApenasProblemas] = useState(false);

  // Filtra e ordena do mais recente para o mais antigo
  const historicoFiltrado = useMemo(() => {
    return historico
      .filter((lote) => {
        if (maquinaFiltro !== 'todas' && lote.maquinaId !== maquinaFiltro && lote.maquinaNome !== maquinaFiltro) {
          return false;
        }
        if (setorFiltro !== 'todos' && lote.setor !== setorFiltro) {
          return false;
        }
        if (dataFiltro && lote.dataFinalizacao !== dataFiltro) {
          return false;
        }
        if (apenasProblemas && !lote.teveProblemaMecanico) {
          return false;
        }
        if (busca.trim()) {
          const b = busca.toLowerCase();
          return (
            (lote.numeroLote && lote.numeroLote.toLowerCase().includes(b)) ||
            lote.produtoNome.toLowerCase().includes(b) ||
            lote.maquinaNome.toLowerCase().includes(b)
          );
        }
        return true;
      })
      .sort((a, b) => {
        // Ordena por id decrescente (timestamp)
        return b.id.localeCompare(a.id);
      });
  }, [historico, maquinaFiltro, setorFiltro, dataFiltro, apenasProblemas, busca]);

  // Exportar histórico para CSV
  const exportarCSV = () => {
    if (historicoFiltrado.length === 0) return;

    const cabecalho = ['ID', 'Data Finalização', 'Máquina', 'Setor', 'Produto', 'Lote', 'Data Início', 'Hora Início', 'Término Real', 'Duração', 'Problema Mecânico', 'Observação'];
    const linhas = historicoFiltrado.map((lote) => [
      lote.id,
      lote.dataFinalizacao,
      `"${lote.maquinaNome}"`,
      lote.setor === 'liquidos' ? 'Líquidos' : 'Semissólidos',
      `"${lote.produtoNome.replace(/"/g, '""')}"`,
      `"${lote.numeroLote || ''}"`,
      lote.dataInicio || lote.dataFinalizacao,
      lote.horaInicio,
      lote.horaTermino,
      `"${formatarMinutosParaTexto(lote.duracaoMinutos)}"`,
      lote.teveProblemaMecanico ? 'SIM' : 'NÃO',
      `"${(lote.observacao || '').replace(/"/g, '""')}"`,
    ]);

    const conteudoCSV = [cabecalho.join(';'), ...linhas.map((l) => l.join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + conteudoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CIMED_Historico_Lotes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="historico-tab-content" className="space-y-5">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#161616] border border-white/10 border-l-4 border-l-[#FFD100] p-4 sm:p-5 rounded shadow-lg">
        <div>
          <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-white flex items-center gap-2">
            <span>Histórico de Lotes Finalizados</span>
            <span className="text-[11px] bg-[#FFD100]/20 text-[#FFD100] border border-[#FFD100]/40 px-2 py-0.5 rounded font-mono font-bold">
              {historicoFiltrado.length} Registros
            </span>
          </h2>
          <p className="text-xs text-white/50 mt-1">
            Auditoria completa de envase com horários reais de início e término, duração e registro de problemas mecânicos.
          </p>
        </div>

        {historicoFiltrado.length > 0 && (
          <button
            id="btn-exportar-csv"
            onClick={exportarCSV}
            className="bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 font-bold uppercase tracking-wider px-3.5 py-2 rounded text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>
        )}
      </div>

      {/* Painel de Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-[#1a1a1a] border border-white/10 p-3 rounded shadow text-xs">
        {/* Busca por Lote/Produto */}
        <div>
          <label className="block text-white/50 text-[10px] font-bold mb-1 uppercase tracking-wider">
            Lote ou Produto
          </label>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar..."
            className="w-full bg-black/60 border border-white/10 text-white text-xs px-3 py-2 rounded focus:outline-none focus:border-[#FFD100]"
          />
        </div>

        {/* Filtro por Máquina */}
        <div>
          <label className="block text-white/50 text-[10px] font-bold mb-1 uppercase tracking-wider">
            Máquina
          </label>
          <select
            id="filtro-historico-maquina"
            value={maquinaFiltro}
            onChange={(e) => setMaquinaFiltro(e.target.value)}
            className="w-full bg-black/60 border border-white/10 text-white text-xs px-3 py-2 rounded focus:outline-none focus:border-[#FFD100]"
          >
            <option value="todas">Todas as Máquinas (01 a 09)</option>
            {maquinas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome} ({m.setor === 'liquidos' ? 'Líquidos' : 'Semissólidos'})
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Setor */}
        <div>
          <label className="block text-white/50 text-[10px] font-bold mb-1 uppercase tracking-wider">
            Setor
          </label>
          <select
            id="filtro-historico-setor"
            value={setorFiltro}
            onChange={(e) => setSetorFiltro(e.target.value as any)}
            className="w-full bg-black/60 border border-white/10 text-white text-xs px-3 py-2 rounded focus:outline-none focus:border-[#FFD100]"
          >
            <option value="todos">Todos os Setores</option>
            <option value="liquidos">Líquidos</option>
            <option value="semissolidos">Semissólidos</option>
          </select>
        </div>

        {/* Filtro por Data */}
        <div>
          <label className="block text-white/50 text-[10px] font-bold mb-1 uppercase tracking-wider">
            Data de Finalização
          </label>
          <div className="relative">
            <input
              id="filtro-historico-data"
              type="date"
              value={dataFiltro}
              onChange={(e) => setDataFiltro(e.target.value)}
              className="w-full bg-black/60 border border-white/10 text-white text-xs px-3 py-2 rounded focus:outline-none focus:border-[#FFD100]"
            />
            {dataFiltro && (
              <button
                onClick={() => setDataFiltro('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-[10px] uppercase font-bold"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Checkbox Apenas com Problemas Mecânicos */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => setApenasProblemas(!apenasProblemas)}
            className={`w-full py-2 px-3 rounded border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
              apenasProblemas
                ? 'bg-red-950/60 border-red-500 text-red-300'
                : 'bg-black/60 border-white/10 text-white/50 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>Apenas c/ Parada</span>
          </button>
        </div>
      </div>

      {/* Tabela Desktop / Cards Mobile */}
      {historicoFiltrado.length === 0 ? (
        <div className="text-center py-16 bg-[#1a1a1a] border border-white/10 rounded">
          <CheckCircle2 className="w-10 h-10 text-white/30 mx-auto mb-3" />
          <h3 className="text-sm font-bold uppercase tracking-wide text-white">Nenhum lote finalizado registrado</h3>
          <p className="text-xs text-white/40 mt-1 max-w-sm mx-auto">
            Quando as máquinas de produção tiverem seus lotes concluídos e clicado em "Finalizar Lote", eles aparecerão automaticamente nesta listagem.
          </p>
        </div>
      ) : (
        <>
          {/* VISUALIZAÇÃO DESKTOP: TABELA */}
          <div className="hidden md:block bg-[#1a1a1a] border border-white/10 rounded overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#111111] text-white/40 text-[10px] uppercase font-bold tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-2.5 px-4">Data</th>
                    <th className="py-2.5 px-4">Máquina</th>
                    <th className="py-2.5 px-4">Setor</th>
                    <th className="py-2.5 px-4">Lote / Produto</th>
                    <th className="py-2.5 px-3 text-center">Início</th>
                    <th className="py-2.5 px-3 text-center">Término</th>
                    <th className="py-2.5 px-3 text-center">Duração</th>
                    <th className="py-2.5 px-4 text-center">Problema Mecânico</th>
                    <th className="py-2.5 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {historicoFiltrado.map((lote) => (
                    <tr key={lote.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-[11px] text-white/60 whitespace-nowrap">
                        {lote.dataInicio || lote.dataFinalizacao}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-white whitespace-nowrap">
                        {lote.maquinaNome}
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] uppercase px-2 py-0.5 rounded border font-bold inline-flex items-center gap-1 ${
                            lote.setor === 'liquidos'
                              ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                              : 'bg-[#FFD100]/10 border-[#FFD100]/30 text-[#FFD100]'
                          }`}
                        >
                          {lote.setor === 'liquidos' ? <Droplet className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
                          {lote.setor === 'liquidos' ? 'Líquidos' : 'Semissólidos'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-white/80">
                        {lote.numeroLote && (
                          <span className="block text-[10px] text-[#FFD100] font-mono uppercase tracking-wider mb-0.5">
                            LOTE {lote.numeroLote}
                          </span>
                        )}
                        {lote.produtoNome}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-center text-xs text-white/60">
                        {lote.horaInicio}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-center text-xs text-white font-bold">
                        {lote.horaTermino}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-mono text-xs font-bold text-[#FFD100] bg-black/50 px-2 py-0.5 rounded border border-white/10">
                          {formatarMinutosParaTexto(lote.duracaoMinutos)}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {lote.teveProblemaMecanico ? (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold bg-red-950/70 border border-red-500/50 text-red-300 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3 text-red-400" />
                            <span>Houve parada</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold bg-emerald-950/50 border border-emerald-700/40 text-emerald-400 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Sem ocorrências</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => excluirLoteHistorico(lote.id)}
                          title="Excluir do histórico"
                          className="text-white/40 hover:text-red-400 p-1 rounded hover:bg-white/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* VISUALIZAÇÃO MOBILE: CARDS */}
          <div className="md:hidden space-y-3">
            {historicoFiltrado.map((lote) => (
              <div
                key={lote.id}
                className="bg-[#1a1a1a] border border-white/10 rounded p-3.5 space-y-2.5 shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-black text-white text-sm uppercase tracking-wide">{lote.maquinaNome}</span>
                    <span className="text-[11px] text-white/40 ml-2 font-mono">{lote.dataInicio || lote.dataFinalizacao}</span>
                  </div>
                  <button
                    onClick={() => excluirLoteHistorico(lote.id)}
                    className="text-white/40 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="font-bold text-xs text-white/90 leading-tight">
                  {lote.numeroLote && (
                    <span className="inline-block text-[9px] text-black bg-[#FFD100] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider mr-2 align-middle">
                      LOTE {lote.numeroLote}
                    </span>
                  )}
                  <span className="text-[#FFD100] align-middle">{lote.produtoNome}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-black/60 p-2 rounded text-center font-mono text-xs border border-white/5">
                  <div>
                    <div className="text-[9px] text-white/40 uppercase font-bold">Início</div>
                    <div className="text-white font-bold mt-0.5">{lote.horaInicio}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-white/40 uppercase font-bold">Término</div>
                    <div className="text-white font-bold mt-0.5">{lote.horaTermino}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-white/40 uppercase font-bold">Duração</div>
                    <div className="text-[#FFD100] font-bold mt-0.5">
                      {formatarMinutosParaTexto(lote.duracaoMinutos)}
                    </div>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <span className="text-white/40 uppercase text-[10px] font-mono">
                    {lote.setor === 'liquidos' ? 'Setor Líquidos' : 'Setor Semissólidos'}
                  </span>
                  {lote.teveProblemaMecanico ? (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold bg-red-950/70 border border-red-500/50 text-red-300 px-2 py-0.5 rounded">
                      <AlertTriangle className="w-3 h-3 text-red-400" />
                      <span>Parada</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold bg-emerald-950/50 border border-emerald-700/40 text-emerald-400 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Sem falhas</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
