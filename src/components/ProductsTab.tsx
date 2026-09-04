import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Clock,
  Edit2,
  Trash2,
  Filter,
  Layers,
  Droplet,
  Check,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Produto, Setor } from '../types';
import { useProduction } from '../context/ProductionContext';
import { formatarMinutosParaTexto } from '../initialData';

export const ProductsTab: React.FC = () => {
  const { produtos, adicionarProduto, editarProduto, excluirProduto } = useProduction();

  const [busca, setBusca] = useState('');
  const [setorFiltro, setSetorFiltro] = useState<'todos' | Setor>('todos');
  const [linhaFiltro, setLinhaFiltro] = useState<string>('todas');

  // Modal de Adicionar / Editar
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState<Produto | null>(null);

  // Form State
  const [nomeForm, setNomeForm] = useState('');
  const [setorForm, setSetorForm] = useState<Setor>('semissolidos');
  const [linhaForm, setLinhaForm] = useState('NORDEN I');
  const [horasForm, setHorasForm] = useState(6);
  const [minutosForm, setMinutosForm] = useState(15);
  const [salvando, setSalvando] = useState(false);

  // Confirmação de exclusão
  const [confirmandoExcluirId, setConfirmandoExcluirId] = useState<string | null>(null);

  // Lista de linhas disponíveis para filtro
  const linhasDisponiveis = useMemo(() => {
    const set = new Set<string>();
    produtos.forEach((p) => set.add(p.linha));
    return Array.from(set).sort();
  }, [produtos]);

  // Produtos filtrados
  const produtosFiltrados = useMemo(() => {
    return produtos.filter((p) => {
      if (setorFiltro !== 'todos' && p.setor !== setorFiltro) return false;
      if (linhaFiltro !== 'todas' && p.linha !== linhaFiltro) return false;
      if (busca.trim()) {
        const b = busca.toLowerCase();
        return p.nome.toLowerCase().includes(b) || p.linha.toLowerCase().includes(b);
      }
      return true;
    });
  }, [produtos, setorFiltro, linhaFiltro, busca]);

  // Agrupamento por Linha
  const gruposPorLinha = useMemo(() => {
    const map = new Map<string, Produto[]>();
    produtosFiltrados.forEach((p) => {
      const grupo = `${p.setor === 'semissolidos' ? 'Semissólidos — Linha ' : 'Líquidos — '}${p.linha}`;
      if (!map.has(grupo)) {
        map.set(grupo, []);
      }
      map.get(grupo)!.push(p);
    });
    return map;
  }, [produtosFiltrados]);

  // Abre modal para novo produto
  const handleNovo = () => {
    setProdutoEmEdicao(null);
    setNomeForm('');
    setSetorForm('semissolidos');
    setLinhaForm('NORDEN I');
    setHorasForm(6);
    setMinutosForm(15);
    setModalAberto(true);
  };

  // Abre modal para editar produto
  const handleEditar = (produto: Produto) => {
    setProdutoEmEdicao(produto);
    setNomeForm(produto.nome);
    setSetorForm(produto.setor);
    setLinhaForm(produto.linha);
    setHorasForm(Math.floor(produto.tempoEnvaseMinutos / 60));
    setMinutosForm(produto.tempoEnvaseMinutos % 60);
    setModalAberto(true);
  };

  // Salvar formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeForm.trim()) return;

    setSalvando(true);
    const tempoTotalMinutos = horasForm * 60 + minutosForm;

    try {
      if (produtoEmEdicao) {
        await editarProduto(produtoEmEdicao.id, {
          nome: nomeForm.trim().toUpperCase(),
          setor: setorForm,
          linha: linhaForm.trim(),
          tempoEnvaseMinutos: tempoTotalMinutos,
        });
      } else {
        await adicionarProduto({
          nome: nomeForm.trim().toUpperCase(),
          setor: setorForm,
          linha: linhaForm.trim(),
          tempoEnvaseMinutos: tempoTotalMinutos,
        });
      }
      setModalAberto(false);
    } finally {
      setSalvando(false);
    }
  };

  // Contagem para Líquidos
  const produtosLiquidos = produtos.filter((p) => p.setor === 'liquidos');

  return (
    <div id="produtos-tab-content" className="space-y-5">
      {/* Cabeçalho da Aba */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#161616] border border-white/10 border-l-4 border-l-[#FFD100] p-4 sm:p-5 rounded shadow-lg">
        <div>
          <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-white flex items-center gap-2">
            <span>Catálogo de Tempos Médios de Envase</span>
            <span className="text-[11px] bg-[#FFD100]/20 text-[#FFD100] border border-[#FFD100]/40 px-2 py-0.5 rounded font-mono font-bold">
              {produtos.length} Cadastrados
            </span>
          </h2>
          <p className="text-xs text-white/50 mt-1">
            Os tempos médios são utilizados pelo sistema para calcular automaticamente a previsão de término de cada máquina.
          </p>
        </div>

        <button
          id="btn-adicionar-produto"
          onClick={handleNovo}
          className="bg-[#FFD100] hover:bg-[#ffe043] text-black font-black uppercase text-xs tracking-wider px-4 py-2.5 rounded flex items-center justify-center gap-2 shadow transition-all active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Produto</span>
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#1a1a1a] border border-white/10 p-3 rounded shadow">
        {/* Campo de Busca */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            id="input-busca-produtos"
            type="text"
            placeholder="Buscar medicamento..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-black/60 border border-white/10 text-xs text-white pl-9 pr-3 py-2 rounded focus:outline-none focus:border-[#FFD100]"
          />
        </div>

        {/* Filtro de Setor */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/40 shrink-0" />
          <select
            id="select-filtro-setor"
            value={setorFiltro}
            onChange={(e) => setSetorFiltro(e.target.value as any)}
            className="w-full bg-black/60 border border-white/10 text-xs text-white px-3 py-2 rounded focus:outline-none focus:border-[#FFD100]"
          >
            <option value="todos">Todos os Setores</option>
            <option value="semissolidos">Semissólidos (Pomadas/Géis)</option>
            <option value="liquidos">Líquidos (Soluções/Frascos)</option>
          </select>
        </div>

        {/* Filtro de Linha */}
        <div>
          <select
            id="select-filtro-linha"
            value={linhaFiltro}
            onChange={(e) => setLinhaFiltro(e.target.value)}
            className="w-full bg-black/60 border border-white/10 text-xs text-white px-3 py-2 rounded focus:outline-none focus:border-[#FFD100]"
          >
            <option value="todas">Todas as Linhas</option>
            {linhasDisponiveis.map((linha) => (
              <option key={linha} value={linha}>
                Linha {linha}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Seção Pendente Líquidos (Conforme Especificado no Requisito 4) */}
      {(setorFiltro === 'todos' || setorFiltro === 'liquidos') && produtosLiquidos.length === 0 && (
        <div className="bg-[#1a1a1a] border border-sky-500/30 border-l-4 border-l-sky-500 rounded p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30 shrink-0">
              <Droplet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm uppercase tracking-wide">Setor Líquidos — Carga de Dados</h3>
                <span className="text-[10px] bg-sky-500/20 text-sky-300 font-bold px-2 py-0.5 rounded border border-sky-500/30 uppercase">
                  Pendente
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5 max-w-2xl">
                A tabela de tempos médios de líquidos está pronta para receber os novos produtos. Cadastre pelo botão lateral ou aguarde a lista oficial.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSetorForm('liquidos');
              setLinhaForm('Líquidos Geral');
              setNomeForm('');
              setHorasForm(4);
              setMinutosForm(0);
              setProdutoEmEdicao(null);
              setModalAberto(true);
            }}
            className="bg-sky-500 hover:bg-sky-400 text-black font-black uppercase text-xs px-3 py-1.5 rounded transition-colors whitespace-nowrap"
          >
            Cadastrar Líquido
          </button>
        </div>
      )}

      {/* Tabelas de Produtos Organizadas por Linha */}
      <div className="space-y-4">
        {Array.from(gruposPorLinha.entries()).map(([nomeGrupo, listaProdutos]) => (
          <div
            key={nomeGrupo}
            className="bg-[#1a1a1a] border border-white/10 rounded overflow-hidden shadow-lg"
          >
            {/* Cabeçalho da Linha */}
            <div className="bg-[#141414] px-4 py-2.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#FFD100]" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                  {nomeGrupo}
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-white/50 bg-black/40 px-2 py-0.5 rounded border border-white/10 uppercase">
                {listaProdutos.length} {listaProdutos.length === 1 ? 'item' : 'itens'}
              </span>
            </div>

            {/* Tabela de Produtos */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#111111] text-white/40 text-[10px] uppercase font-bold tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-2.5 px-4">Medicamento / Produto</th>
                    <th className="py-2.5 px-4 text-center">Tempo Padrão</th>
                    <th className="py-2.5 px-4 text-center">Minutos</th>
                    <th className="py-2.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {listaProdutos.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-white text-xs">
                          {p.nome}
                        </div>
                        <div className="text-[10px] text-white/40 font-mono">
                          {p.linha}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-[#FFD100] bg-[#FFD100]/10 px-2 py-0.5 rounded border border-[#FFD100]/20">
                          <Clock className="w-3 h-3 text-[#FFD100]" />
                          <span>{formatarMinutosParaTexto(p.tempoEnvaseMinutos)}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono text-[11px] text-white/40">
                        {p.tempoEnvaseMinutos} min
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        {confirmandoExcluirId === p.id ? (
                          <div className="inline-flex items-center gap-1 bg-black/80 p-1 rounded border border-white/10">
                            <span className="text-[10px] text-red-300 font-bold px-1 uppercase">Excluir?</span>
                            <button
                              onClick={() => {
                                excluirProduto(p.id);
                                setConfirmandoExcluirId(null);
                              }}
                              className="text-[10px] font-bold text-white bg-red-600 hover:bg-red-500 px-2 py-0.5 rounded uppercase"
                            >
                              Sim
                            </button>
                            <button
                              onClick={() => setConfirmandoExcluirId(null)}
                              className="text-[10px] text-white/60 hover:text-white px-1.5 py-0.5 uppercase"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleEditar(p)}
                              title="Editar tempo ou nome"
                              className="p-1 text-white/50 hover:text-[#FFD100] hover:bg-white/10 rounded transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setConfirmandoExcluirId(p.id)}
                              title="Excluir produto do catálogo"
                              className="p-1 text-white/50 hover:text-red-400 hover:bg-white/10 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {produtosFiltrados.length === 0 && (
          <div className="text-center py-12 bg-[#1a1a1a] rounded border border-white/10">
            <AlertCircle className="w-8 h-8 text-white/40 mx-auto mb-2" />
            <div className="text-white/80 font-bold text-sm uppercase tracking-wide">Nenhum produto encontrado</div>
            <p className="text-xs text-white/40 mt-1">
              Verifique os filtros selecionados ou cadastre um novo produto.
            </p>
          </div>
        )}
      </div>

      {/* Modal Adicionar / Editar Produto */}
      {modalAberto && (
        <div
          id="modal-produto-overlay"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => setModalAberto(false)}
        >
          <div
            id="modal-produto-container"
            className="bg-[#1a1a1a] border border-white/20 rounded w-full max-w-md shadow-2xl overflow-hidden text-white my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho */}
            <div className="bg-[#111111] px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FFD100]" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                  {produtoEmEdicao ? 'Editar Produto' : 'Novo Produto'}
                </h3>
              </div>
              <button
                onClick={() => setModalAberto(false)}
                className="p-1 text-white/40 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
              {/* Nome do Produto */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">
                  Nome do Medicamento / Produto
                </label>
                <input
                  id="input-produto-nome"
                  type="text"
                  required
                  placeholder="Ex: ACICLOVIR 50MG/G CREM BG 10G"
                  value={nomeForm}
                  onChange={(e) => setNomeForm(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 text-white text-xs px-3 py-2 rounded focus:outline-none focus:border-[#FFD100]"
                />
              </div>

              {/* Setor */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">
                  Setor de Fabricação
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSetorForm('semissolidos');
                      if (linhaForm === 'Líquidos Geral') setLinhaForm('NORDEN I');
                    }}
                    className={`py-2 px-3 rounded text-xs font-bold uppercase tracking-wider transition-all border flex items-center justify-center gap-1.5 ${
                      setorForm === 'semissolidos'
                        ? 'bg-[#FFD100] text-black border-[#FFD100]'
                        : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Semissólidos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSetorForm('liquidos');
                      setLinhaForm('Líquidos Geral');
                    }}
                    className={`py-2 px-3 rounded text-xs font-bold uppercase tracking-wider transition-all border flex items-center justify-center gap-1.5 ${
                      setorForm === 'liquidos'
                        ? 'bg-[#FFD100] text-black border-[#FFD100]'
                        : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                    }`}
                  >
                    <Droplet className="w-3.5 h-3.5" />
                    <span>Líquidos</span>
                  </button>
                </div>
              </div>

              {/* Linha de Produção */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">
                  Linha de Produção / Máquina
                </label>
                <input
                  id="input-produto-linha"
                  type="text"
                  required
                  placeholder="Ex: Norden I, Norden II, CAM, Gotas, Xarope..."
                  value={linhaForm}
                  onChange={(e) => setLinhaForm(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 text-white text-xs px-3 py-2 rounded focus:outline-none focus:border-[#FFD100]"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {(setorForm === 'semissolidos'
                    ? ['Norden I', 'Norden II', 'Norden III', 'Norden IV']
                    : ['CAM', 'Gotas', 'Xarope', 'Externo', 'Epativan']
                  ).map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setLinhaForm(sug)}
                      className="text-[9px] font-mono bg-white/5 hover:bg-[#FFD100] hover:text-black text-white/60 px-2 py-0.5 rounded border border-white/10 transition-colors uppercase"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tempo Médio de Envase (Horas + Minutos) */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">
                  Tempo Médio de Envase
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] uppercase text-white/40 mb-0.5 block">Horas</span>
                    <input
                      id="input-produto-horas"
                      type="number"
                      min="0"
                      max="72"
                      value={horasForm}
                      onChange={(e) => setHorasForm(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full bg-black/60 border border-white/10 text-white font-mono text-center font-bold text-sm px-2 py-1.5 rounded focus:outline-none focus:border-[#FFD100]"
                    />
                  </div>

                  <div>
                    <span className="text-[9px] uppercase text-white/40 mb-0.5 block">Minutos</span>
                    <input
                      id="input-produto-minutos"
                      type="number"
                      min="0"
                      max="59"
                      value={minutosForm}
                      onChange={(e) => setMinutosForm(Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0)))}
                      className="w-full bg-black/60 border border-white/10 text-white font-mono text-center font-bold text-sm px-2 py-1.5 rounded focus:outline-none focus:border-[#FFD100]"
                    />
                  </div>
                </div>

                <div className="mt-2 text-center text-xs bg-black/50 p-2 rounded border border-white/10 text-white/80">
                  Total calculado:{' '}
                  <strong className="text-[#FFD100] font-mono text-xs font-bold">
                    {formatarMinutosParaTexto(horasForm * 60 + minutosForm)}
                  </strong>{' '}
                  ({horasForm * 60 + minutosForm} min)
                </div>
              </div>

              {/* Botões do Modal */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white bg-white/5 border border-white/10 rounded transition-colors"
                >
                  Cancelar
                </button>
                <button
                  id="btn-salvar-produto"
                  type="submit"
                  disabled={salvando || !nomeForm.trim()}
                  className="bg-[#FFD100] hover:bg-[#ffe043] disabled:opacity-50 text-black font-black uppercase tracking-wider px-4 py-1.5 rounded text-xs flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{salvando ? 'Salvando...' : produtoEmEdicao ? 'Atualizar' : 'Cadastrar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
