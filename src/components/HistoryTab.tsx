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
  Pause,
  X,
  Eye,
} from 'lucide-react';
import { LoteHistorico, Setor, ParadaLote } from '../types';
import { useProduction } from '../context/ProductionContext';
import { formatarMinutosParaTexto, calcularDuracaoRealMinutos } from '../initialData';
import { exportarHistoricoParaExcel } from '../utils/excelExport';

export const HistoryTab: React.FC = () => {
  const { historico, maquinas, produtos, excluirLoteHistorico } = useProduction();

  const [busca, setBusca] = useState('');
  const [maquinaFiltro, setMaquinaFiltro] = useState('todas');
  const [setorFiltro, setSetorFiltro] = useState<'todos' | Setor>('todos');
  const [dataFiltro, setDataFiltro] = useState('');
  const [apenasProblemas, setApenasProblemas] = useState(false);
  const [apenasComParadas, setApenasComParadas] = useState(false);
  const [exportandoExcel, setExportandoExcel] = useState(false);
  const [loteParadasModal, setLoteParadasModal] = useState<LoteHistorico | null>(null);

  // Obtém o tempo previsto, tempo real, tempo parado e tempo efetivo de produção
  const obterTempos = (lote: LoteHistorico) => {
    // 1. Tempo Previsto
    let tempoPrevisto = lote.duracaoPrevistaMinutos;
    if (tempoPrevisto === undefined || tempoPrevisto === null) {
      tempoPrevisto = lote.duracaoMinutos || 0;
    }
    if (!tempoPrevisto) {
      const prod = produtos.find(
        (p) => (lote.produtoCodigo && p.codigo === lote.produtoCodigo) || p.nome === lote.produtoNome
      );
      if (prod) {
        tempoPrevisto =
          (prod.temposPorMaquina && (prod.temposPorMaquina[lote.maquinaNome] || prod.temposPorMaquina[lote.maquinaId])) ||
          prod.tempoEnvaseMinutos ||
          0;
      }
    }

    // 2. Duração Real Total
    let tempoReal = lote.duracaoRealMinutos;
    if (tempoReal === undefined || tempoReal === null) {
      tempoReal = calcularDuracaoRealMinutos(lote.horaInicio, lote.horaTermino, lote.dataInicio, lote.dataFinalizacao);
    }

    // 3. Tempo Total Parado
    let tempoParado = lote.tempoParadoMinutos;
    if (tempoParado === undefined || tempoParado === null) {
      tempoParado = (lote.paradas || []).reduce((acc, p) => {
        if (!p.inicio) return acc;
        const ini = new Date(p.inicio).getTime();
        const fim = p.fim ? new Date(p.fim).getTime() : new Date().getTime();
        return acc + (fim > ini ? Math.round((fim - ini) / 60000) : 0);
      }, 0);
    }

    // 4. Tempo Efetivo de Produção (duração total menos paradas)
    let tempoEfetivo = lote.tempoEfetivoMinutos;
    if (tempoEfetivo === undefined || tempoEfetivo === null) {
      tempoEfetivo = Math.max(0, (tempoReal || 0) - (tempoParado || 0));
    }

    return {
      tempoPrevisto: tempoPrevisto || 0,
      tempoReal: tempoReal !== undefined ? tempoReal : 0,
      tempoParado: tempoParado || 0,
      tempoEfetivo: tempoEfetivo !== undefined ? tempoEfetivo : (tempoReal || 0),
    };
  };

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
        if (apenasComParadas) {
          const temParadas =
            (lote.paradas && lote.paradas.length > 0) ||
            (lote.tempoParadoMinutos && lote.tempoParadoMinutos > 0) ||
            lote.teveProblemaMecanico;
          if (!temParadas) return false;
        }
        if (apenasProblemas && !lote.teveProblemaMecanico) {
          return false;
        }
        if (busca.trim()) {
          const b = busca.toLowerCase();
          return (
            (lote.numeroLote && lote.numeroLote.toLowerCase().includes(b)) ||
            (lote.produtoCodigo && lote.produtoCodigo.toLowerCase().includes(b)) ||
            lote.produtoNome.toLowerCase().includes(b) ||
            lote.maquinaNome.toLowerCase().includes(b)
          );
        }
        return true;
      })
      .sort((a, b) => {
        return b.id.localeCompare(a.id);
      });
  }, [historico, maquinaFiltro, setorFiltro, dataFiltro, apenasProblemas, apenasComParadas, busca]);

  // Exportar histórico para Excel (.xlsx) formatado e estilizado
  const handleExportarExcel = async () => {
    if (historicoFiltrado.length === 0 || exportandoExcel) return;
    try {
      setExportandoExcel(true);
      await exportarHistoricoParaExcel(historicoFiltrado, obterTempos);
    } catch (err) {
      console.error('Erro ao exportar planilha Excel:', err);
    } finally {
      setExportandoExcel(false);
    }
  };

  // Exportar histórico para CSV (sem ID e com delimitador adequado)
  const exportarCSV = () => {
    if (historicoFiltrado.length === 0) return;

    const cabecalho = [
      'Data Término',
      'Máquina',
      'Setor',
      'Código',
      'Produto',
      'Lote',
      'Data Início',
      'Hora Início',
      'Término Real',
      'Previsão',
      'Duração Total',
      'Tempo Parado',
      'Tempo Efetivo',
      'Qtd Paradas',
      'Problema Mecânico',
      'Observação',
    ];
    const linhas = historicoFiltrado.map((lote) => {
      const { tempoPrevisto, tempoReal, tempoParado, tempoEfetivo } = obterTempos(lote);
      const dataFormatada = lote.dataFinalizacao || lote.dataInicio || '';
      const qtdParadas = lote.paradas ? lote.paradas.length : 0;
      return [
        dataFormatada,
        `"${lote.maquinaNome}"`,
        lote.setor === 'liquidos' ? 'Líquidos' : 'Semissólidos',
        `"${lote.produtoCodigo || ''}"`,
        `"${lote.produtoNome.replace(/"/g, '""')}"`,
        `"${lote.numeroLote || ''}"`,
        lote.dataInicio || lote.dataFinalizacao,
        lote.horaInicio,
        lote.horaTermino,
        `"${formatarMinutosParaTexto(tempoPrevisto)}"`,
        `"${formatarMinutosParaTexto(tempoReal)}"`,
        `"${formatarMinutosParaTexto(tempoParado)}"`,
        `"${formatarMinutosParaTexto(tempoEfetivo)}"`,
        qtdParadas,
        lote.teveProblemaMecanico ? 'SIM' : 'NÃO',
        `"${(lote.observacao || '').replace(/"/g, '""')}"`,
      ];
    });

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
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-exportar-excel"
              onClick={handleExportarExcel}
              disabled={exportandoExcel}
              className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold uppercase tracking-wider px-3.5 py-2 rounded text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-950/40 transition-all cursor-pointer disabled:opacity-50"
              title="Baixar planilha Excel (.xlsx) formatada e colorida com larguras automáticas"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
              <span>{exportandoExcel ? 'Gerando Planilha...' : 'Exportar Excel (.xlsx)'}</span>
            </button>
            <button
              id="btn-exportar-csv"
              onClick={exportarCSV}
              className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 font-bold uppercase tracking-wider px-2.5 py-2 rounded text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Exportar dados em formato de texto CSV"
            >
              <Download className="w-3.5 h-3.5 text-white/40" />
              <span>CSV</span>
            </button>
          </div>
        )}
      </div>

      {/* Painel de Filtros */}
      <div className="bg-[#1a1a1a] border border-white/10 p-3 rounded shadow text-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Busca por Lote/Produto */}
          <div>
            <label className="block text-white/50 text-[10px] font-bold mb-1 uppercase tracking-wider">
              Lote ou Produto
            </label>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por lote, código ou produto..."
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
        </div>

        {/* Linha de Botões de Filtro Rápido */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-white/5">
          <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider mr-1">
            Filtros rápidos:
          </span>

          {/* Filtro: Lotes com Paradas */}
          <button
            type="button"
            id="filtro-lotes-com-paradas"
            onClick={() => setApenasComParadas(!apenasComParadas)}
            className={`py-1.5 px-3 rounded border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              apenasComParadas
                ? 'bg-purple-900/60 border-purple-500 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'bg-black/60 border-white/10 text-white/50 hover:text-white hover:border-white/30'
            }`}
          >
            <Pause className="w-3.5 h-3.5 text-purple-300" />
            <span>Lotes com paradas</span>
            {apenasComParadas && (
              <span className="ml-1 bg-purple-500 text-black text-[9px] px-1 rounded font-black">
                ATIVO
              </span>
            )}
          </button>

          {/* Filtro: Apenas com Problemas Mecânicos */}
          <button
            type="button"
            id="filtro-problemas-mecanicos"
            onClick={() => setApenasProblemas(!apenasProblemas)}
            className={`py-1.5 px-3 rounded border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              apenasProblemas
                ? 'bg-red-950/70 border-red-500 text-red-200 shadow-[0_0_10px_rgba(220,38,38,0.3)]'
                : 'bg-black/60 border-white/10 text-white/50 hover:text-white hover:border-white/30'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>Problemas mecânicos</span>
            {apenasProblemas && (
              <span className="ml-1 bg-red-500 text-white text-[9px] px-1 rounded font-black">
                ATIVO
              </span>
            )}
          </button>

          {(apenasComParadas || apenasProblemas || maquinaFiltro !== 'todas' || setorFiltro !== 'todos' || dataFiltro || busca) && (
            <button
              type="button"
              onClick={() => {
                setBusca('');
                setMaquinaFiltro('todas');
                setSetorFiltro('todos');
                setDataFiltro('');
                setApenasComParadas(false);
                setApenasProblemas(false);
              }}
              className="text-[11px] text-white/40 hover:text-[#FFD100] underline ml-auto cursor-pointer"
            >
              Limpar todos os filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabela Desktop / Cards Mobile */}
      {historicoFiltrado.length === 0 ? (
        <div className="text-center py-16 bg-[#1a1a1a] border border-white/10 rounded">
          <CheckCircle2 className="w-10 h-10 text-white/30 mx-auto mb-3" />
          <h3 className="text-sm font-bold uppercase tracking-wide text-white">Nenhum lote finalizado encontrado</h3>
          <p className="text-xs text-white/40 mt-1 max-w-sm mx-auto">
            Ajuste os filtros acima ou aguarde a finalização dos lotes em produção nas máquinas.
          </p>
        </div>
      ) : (
        <>
          {/* VISUALIZAÇÃO DESKTOP: TABELA */}
          <div className="hidden lg:block bg-[#1a1a1a] border border-white/10 rounded overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#111111] text-white/40 text-[10px] uppercase font-bold tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-2.5 px-3">Data</th>
                    <th className="py-2.5 px-3">Máquina</th>
                    <th className="py-2.5 px-3">Setor</th>
                    <th className="py-2.5 px-3">Lote / Produto</th>
                    <th className="py-2.5 px-2 text-center">Horários</th>
                    <th className="py-2.5 px-3 text-center">Duração Total</th>
                    <th className="py-2.5 px-3 text-center">Tempo Parado</th>
                    <th className="py-2.5 px-3 text-center">Tempo Efetivo</th>
                    <th className="py-2.5 px-3 text-center">Paradas</th>
                    <th className="py-2.5 px-2 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {historicoFiltrado.map((lote) => {
                    const { tempoPrevisto, tempoReal, tempoParado, tempoEfetivo } = obterTempos(lote);
                    const paradasLista = lote.paradas || [];
                    const qtdParadas = paradasLista.length;

                    return (
                      <tr key={lote.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-white/60 whitespace-nowrap">
                          {lote.dataInicio || lote.dataFinalizacao}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">
                          {lote.maquinaNome}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`text-[9px] uppercase px-1.5 py-0.5 rounded border font-bold inline-flex items-center gap-1 ${
                              lote.setor === 'liquidos'
                                ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                                : 'bg-[#FFD100]/10 border-[#FFD100]/30 text-[#FFD100]'
                            }`}
                          >
                            {lote.setor === 'liquidos' ? <Droplet className="w-2.5 h-2.5" /> : <Layers className="w-2.5 h-2.5" />}
                            {lote.setor === 'liquidos' ? 'Líquidos' : 'Semissólidos'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-white/80 max-w-xs">
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            {lote.numeroLote && (
                              <span className="text-[9px] text-[#FFD100] font-mono font-bold uppercase tracking-wider bg-[#FFD100]/10 px-1 py-0.5 rounded border border-[#FFD100]/30">
                                LT {lote.numeroLote}
                              </span>
                            )}
                            {lote.produtoCodigo && (
                              <span className="text-[9px] text-white/50 font-mono">
                                CÓD {lote.produtoCodigo}
                              </span>
                            )}
                          </div>
                          <div className="text-white font-medium truncate" title={lote.produtoNome}>
                            {lote.produtoNome}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 font-mono text-center text-xs whitespace-nowrap">
                          <div className="text-white/60 text-[11px]">{lote.horaInicio}</div>
                          <div className="text-white font-bold text-xs">{lote.horaTermino}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap font-mono">
                          <div className="text-xs font-bold text-white">
                            {formatarMinutosParaTexto(tempoReal)}
                          </div>
                          <div className="text-[9px] text-white/40">
                            Prev: {formatarMinutosParaTexto(tempoPrevisto)}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap font-mono">
                          <span
                            className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                              tempoParado > 0
                                ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40'
                                : 'text-white/40'
                            }`}
                          >
                            {tempoParado > 0 ? formatarMinutosParaTexto(tempoParado) : '0 min'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap font-mono">
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                            {formatarMinutosParaTexto(tempoEfetivo)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {qtdParadas > 0 ? (
                            <button
                              type="button"
                              onClick={() => setLoteParadasModal(lote)}
                              className="inline-flex items-center gap-1 text-[10px] uppercase font-bold bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 px-2 py-1 rounded transition-colors cursor-pointer shadow-sm"
                              title="Clique para visualizar o detalhamento das paradas"
                            >
                              <Eye className="w-3 h-3 text-purple-300" />
                              <span>{qtdParadas} {qtdParadas === 1 ? 'parada' : 'paradas'}</span>
                            </button>
                          ) : lote.teveProblemaMecanico ? (
                            <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold bg-red-950/70 border border-red-500/40 text-red-300 px-1.5 py-0.5 rounded">
                              <AlertTriangle className="w-2.5 h-2.5 text-red-400" />
                              <span>Problema</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-white/30 font-mono">
                              Nenhuma
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          <button
                            onClick={() => excluirLoteHistorico(lote.id)}
                            title="Excluir do histórico"
                            className="text-white/40 hover:text-red-400 p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* VISUALIZAÇÃO MOBILE/TABLET: CARDS */}
          <div className="lg:hidden space-y-3">
            {historicoFiltrado.map((lote) => {
              const { tempoPrevisto, tempoReal, tempoParado, tempoEfetivo } = obterTempos(lote);
              const paradasLista = lote.paradas || [];
              const qtdParadas = paradasLista.length;

              return (
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
                      className="text-white/40 hover:text-red-400 p-1 cursor-pointer"
                      title="Excluir do histórico"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {lote.numeroLote && (
                        <span className="text-[9px] text-black bg-[#FFD100] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                          LOTE {lote.numeroLote}
                        </span>
                      )}
                      {lote.produtoCodigo && (
                        <span className="text-[9px] text-white/50 font-mono bg-white/10 px-1.5 py-0.5 rounded border border-white/10">
                          CÓD {lote.produtoCodigo}
                        </span>
                      )}
                      <span
                        className={`text-[9px] uppercase px-1.5 py-0.5 rounded border font-bold inline-flex items-center gap-0.5 ${
                          lote.setor === 'liquidos'
                            ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                            : 'bg-[#FFD100]/10 border-[#FFD100]/30 text-[#FFD100]'
                        }`}
                      >
                        {lote.setor === 'liquidos' ? 'Líquidos' : 'Semissólidos'}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-white leading-tight">
                      {lote.produtoNome}
                    </div>
                  </div>

                  {/* Grid de Horários e Duração */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-black/60 p-2.5 rounded text-center font-mono text-xs border border-white/5">
                    <div>
                      <div className="text-[9px] text-white/40 uppercase font-bold">Início</div>
                      <div className="text-white font-bold mt-0.5">{lote.horaInicio}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-white/40 uppercase font-bold">Término</div>
                      <div className="text-white font-bold mt-0.5">{lote.horaTermino}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-white/40 uppercase font-bold">Duração Total</div>
                      <div className="text-[#FFD100] font-bold mt-0.5">
                        {formatarMinutosParaTexto(tempoReal)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-white/40 uppercase font-bold">(Previsão)</div>
                      <div className="text-white/70 font-semibold mt-0.5">
                        {formatarMinutosParaTexto(tempoPrevisto)}
                      </div>
                    </div>
                  </div>

                  {/* Linha de Tempo Parado e Efetivo */}
                  <div className="grid grid-cols-2 gap-2 bg-black/40 p-2 rounded text-center font-mono text-xs border border-white/5">
                    <div className="border-r border-white/5 pr-2">
                      <div className="text-[9px] text-purple-300 uppercase font-bold">Tempo Parado</div>
                      <div className={`font-bold mt-0.5 ${tempoParado > 0 ? 'text-purple-300' : 'text-white/40'}`}>
                        {tempoParado > 0 ? formatarMinutosParaTexto(tempoParado) : '0 min'}
                      </div>
                    </div>
                    <div className="pl-2">
                      <div className="text-[9px] text-emerald-400 uppercase font-bold">Tempo Efetivo</div>
                      <div className="text-emerald-400 font-bold mt-0.5">
                        {formatarMinutosParaTexto(tempoEfetivo)}
                      </div>
                    </div>
                  </div>

                  {/* Rodapé do Card: Paradas Registradas */}
                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    {qtdParadas > 0 ? (
                      <button
                        type="button"
                        onClick={() => setLoteParadasModal(lote)}
                        className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 px-2 py-1 rounded transition-colors cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-purple-300" />
                        <span>Ver {qtdParadas} {qtdParadas === 1 ? 'parada' : 'paradas'} do lote</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-white/40 font-mono">
                        Nenhuma parada no lote
                      </span>
                    )}

                    {lote.teveProblemaMecanico && (
                      <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold bg-red-950/70 border border-red-500/50 text-red-300 px-1.5 py-0.5 rounded">
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                        <span>Problema Mecânico</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal para Visualização de Paradas do Lote Histórico */}
      {loteParadasModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setLoteParadasModal(null)}
        >
          <div
            className="bg-[#1a1a1a] border border-white/20 rounded-lg max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho do Modal */}
            <div className="p-4 border-b border-white/10 bg-[#161616] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Pause className="w-4 h-4 text-purple-400" />
                  <span>Detalhamento de Paradas do Lote</span>
                </h3>
                <p className="text-[11px] text-white/50 mt-0.5 font-mono">
                  {loteParadasModal.maquinaNome} • {loteParadasModal.numeroLote ? `Lote ${loteParadasModal.numeroLote}` : 'Sem lote'} • {loteParadasModal.produtoNome}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLoteParadasModal(null)}
                className="text-white/40 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resumo de Tempos do Lote */}
            {(() => {
              const { tempoReal, tempoParado, tempoEfetivo } = obterTempos(loteParadasModal);
              return (
                <div className="grid grid-cols-3 gap-2 p-3 bg-black/40 border-b border-white/10 text-center font-mono text-xs">
                  <div>
                    <div className="text-[9px] text-white/40 uppercase font-bold">Duração Total</div>
                    <div className="text-white font-bold mt-0.5">{formatarMinutosParaTexto(tempoReal)}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-purple-300 uppercase font-bold">Tempo Parado</div>
                    <div className="text-purple-300 font-bold mt-0.5">{formatarMinutosParaTexto(tempoParado)}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-emerald-400 uppercase font-bold">Tempo Efetivo</div>
                    <div className="text-emerald-400 font-bold mt-0.5">{formatarMinutosParaTexto(tempoEfetivo)}</div>
                  </div>
                </div>
              );
            })()}

            {/* Lista das Paradas */}
            <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
              {(!loteParadasModal.paradas || loteParadasModal.paradas.length === 0) ? (
                <div className="text-center py-8 text-white/40 text-xs">
                  Nenhuma parada detalhada registrada neste lote.
                </div>
              ) : (
                loteParadasModal.paradas.map((p, idx) => {
                  const iniDate = p.inicio ? new Date(p.inicio) : null;
                  const fimDate = p.fim ? new Date(p.fim) : null;

                  const duracaoMin = (() => {
                    if (!iniDate) return 0;
                    const fimMs = fimDate ? fimDate.getTime() : iniDate.getTime();
                    return Math.max(0, Math.round((fimMs - iniDate.getTime()) / 60000));
                  })();

                  const iniStr = iniDate
                    ? iniDate.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                    : '--';
                  const fimStr = fimDate
                    ? fimDate.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                    : 'Em andamento na finalização';

                  return (
                    <div
                      key={p.id || idx}
                      className="bg-white/5 border border-white/10 rounded p-3 space-y-1.5 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="font-bold text-purple-300 uppercase text-[11px] bg-purple-950/60 border border-purple-500/40 px-2 py-0.5 rounded">
                          {p.motivo}
                        </span>
                        <span className="text-[#FFD100] font-bold">
                          {formatarMinutosParaTexto(duracaoMin)}
                        </span>
                      </div>

                      <div className="text-[11px] text-white/70 flex items-center gap-1.5 flex-wrap">
                        <span className="text-white/40 font-bold">Início:</span>
                        <span>{iniStr}</span>
                        <span className="text-white/30">•</span>
                        <span className="text-white/40 font-bold">Fim:</span>
                        <span>{fimStr}</span>
                      </div>

                      {p.observacao && (
                        <div className="text-[11px] text-white/60 bg-black/40 p-2 rounded border border-white/5 font-sans mt-1">
                          <span className="text-white/40 font-bold font-mono uppercase text-[9px] block mb-0.5">Observação:</span>
                          {p.observacao}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Rodapé do Modal */}
            <div className="p-3 border-t border-white/10 bg-[#161616] flex justify-end">
              <button
                type="button"
                onClick={() => setLoteParadasModal(null)}
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase px-4 py-2 rounded transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
