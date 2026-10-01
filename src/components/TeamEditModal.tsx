import React, { useState } from 'react';
import { X, Plus, Trash2, Save, AlertCircle, Check } from 'lucide-react';
import { MembroEquipe, Setor } from '../types';
import { useProduction } from '../context/ProductionContext';

interface TeamEditModalProps {
  setor: Setor;
  aoFechar: () => void;
}

const TURNOS_SUGERIDOS = ['1º turno', '2º turno', '3º turno', 'Geral'];
const CARGOS_SUGERIDOS = ['Coordenador da área', 'Supervisor', 'Supervisora', 'Analista', 'Operador Líder'];

export const TeamEditModal: React.FC<TeamEditModalProps> = ({ setor, aoFechar }) => {
  const { equipes, atualizarEquipes } = useProduction();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  
  const [equipeEditavel, setEquipeEditavel] = useState<MembroEquipe[]>(() => {
    return equipes.filter(e => e.setor === setor);
  });
  
  const outrasEquipes = equipes.filter(e => e.setor !== setor);

  const handleMembroChange = (id: string, field: keyof MembroEquipe, value: string) => {
    setEquipeEditavel(prev => 
      prev.map(m => m.id === id ? { ...m, [field]: value } : m)
    );
    if (erro) setErro(null);
  };

  const handleRemove = (id: string) => {
    setEquipeEditavel(prev => prev.filter(m => m.id !== id));
  };

  const handleAdd = () => {
    const novoMembro: MembroEquipe = {
      id: `eq-${Date.now()}-${Math.random().toString(36).substr(2,4)}`,
      setor,
      turno: '1º turno',
      cargo: 'Coordenador da área',
      nome: '',
      email: ''
    };
    setEquipeEditavel(prev => [...prev, novoMembro]);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErro(null);

    // Validação: membros com campos em branco
    const semNome = equipeEditavel.find(m => !m.nome || !m.nome.trim());
    if (semNome) {
      setErro('Por favor, informe o nome de todos os membros da equipe antes de salvar.');
      return;
    }

    setSalvando(true);
    try {
      const membrosFormatados = equipeEditavel.map(m => ({
        ...m,
        nome: m.nome.trim(),
        cargo: m.cargo.trim() || 'Colaborador',
        turno: m.turno.trim() || '1º turno',
        email: m.email?.trim() || '',
      }));

      const novasEquipes = [...outrasEquipes, ...membrosFormatados];
      await atualizarEquipes(novasEquipes);
      aoFechar();
    } catch (err: any) {
      console.error('Erro ao salvar equipe:', err);
      setErro('Erro ao persistir alterações da equipe. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl my-8">
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/40">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-widest flex items-center gap-2">
              Editar Equipe - {setor === 'semissolidos' ? 'Semissólidos' : 'Líquidos'}
            </h2>
            <p className="text-[11px] text-white/50 mt-0.5">
              Gerencie coordenadores, supervisores e turnos responsáveis pela linha.
            </p>
          </div>
          <button onClick={aoFechar} className="text-white/40 hover:text-white transition-colors p-1.5 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {erro && (
          <div className="mx-4 mt-3 bg-red-950/80 border border-red-500/80 text-red-200 text-xs px-3.5 py-2.5 rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="p-4 overflow-y-auto flex-1 space-y-4">
          <div className="space-y-3">
            {equipeEditavel.length === 0 && (
              <div className="text-center text-white/40 py-8 text-xs">
                Nenhum membro cadastrado nesta equipe. Clique no botão abaixo para adicionar.
              </div>
            )}
            {equipeEditavel.map((membro) => (
              <div key={membro.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start bg-black/40 p-3 rounded border border-white/10 relative">
                
                {/* Turno */}
                <div className="md:col-span-3">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/60">Turno</label>
                  </div>
                  <input
                    type="text"
                    value={membro.turno}
                    onChange={e => handleMembroChange(membro.id, 'turno', e.target.value)}
                    placeholder="Ex: 1º turno, Geral..."
                    required
                    className="w-full bg-black/60 border border-white/10 text-white text-xs px-2.5 py-2 rounded focus:outline-none focus:border-[#FFD100]"
                  />
                  <div className="flex flex-wrap gap-1 mt-1">
                    {TURNOS_SUGERIDOS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleMembroChange(membro.id, 'turno', t)}
                        className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                          membro.turno === t
                            ? 'bg-[#FFD100] text-black border-[#FFD100] font-bold'
                            : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cargo */}
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">Cargo</label>
                  <input
                    type="text"
                    value={membro.cargo}
                    onChange={e => handleMembroChange(membro.id, 'cargo', e.target.value)}
                    placeholder="Ex: Coordenador da área"
                    required
                    className="w-full bg-black/60 border border-white/10 text-white text-xs px-2.5 py-2 rounded focus:outline-none focus:border-[#FFD100]"
                  />
                  <div className="flex flex-wrap gap-1 mt-1">
                    {CARGOS_SUGERIDOS.slice(0, 3).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleMembroChange(membro.id, 'cargo', c)}
                        className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                          membro.cargo === c
                            ? 'bg-[#FFD100] text-black border-[#FFD100] font-bold'
                            : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                        }`}
                      >
                        {c.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nome */}
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">
                    Nome Completo <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={membro.nome}
                    onChange={e => handleMembroChange(membro.id, 'nome', e.target.value)}
                    placeholder="Nome completo do responsável"
                    required
                    className="w-full bg-black/60 border border-white/10 text-white text-xs px-2.5 py-2 rounded focus:outline-none focus:border-[#FFD100]"
                  />
                </div>

                {/* E-mail */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">E-mail</label>
                  <input
                    type="text"
                    value={membro.email}
                    onChange={e => handleMembroChange(membro.id, 'email', e.target.value)}
                    placeholder="email@grupocimed..."
                    className="w-full bg-black/60 border border-white/10 text-white text-xs px-2.5 py-2 rounded focus:outline-none focus:border-[#FFD100]"
                  />
                </div>

                {/* Ações */}
                <div className="md:col-span-1 flex items-center justify-end h-full pt-4">
                  <button
                    type="button"
                    onClick={() => handleRemove(membro.id)}
                    className="text-red-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                    title="Remover membro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="w-full py-2.5 border border-dashed border-white/20 text-white/70 hover:text-white hover:border-[#FFD100]/60 hover:bg-[#FFD100]/5 rounded flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#FFD100]" />
            Adicionar Novo Membro / Coordenador
          </button>
        </form>

        <div className="p-4 border-t border-white/10 bg-black/40 flex justify-end gap-3">
          <button
            type="button"
            onClick={aoFechar}
            disabled={salvando}
            className="px-4 py-2 bg-transparent text-white/60 hover:text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={salvando}
            className="px-6 py-2 bg-[#FFD100] hover:bg-[#FFE04D] disabled:opacity-50 text-black rounded font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow transition-all active:scale-95 cursor-pointer"
          >
            {salvando ? (
              <span>Salvando...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Salvar Equipe</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

