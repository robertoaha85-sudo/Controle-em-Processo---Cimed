import React, { useState } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { MembroEquipe, Setor } from '../types';
import { useProduction } from '../context/ProductionContext';

interface TeamEditModalProps {
  setor: Setor;
  aoFechar: () => void;
}

export const TeamEditModal: React.FC<TeamEditModalProps> = ({ setor, aoFechar }) => {
  const { equipes, atualizarEquipes } = useProduction();
  
  const [equipeEditavel, setEquipeEditavel] = useState<MembroEquipe[]>(
    equipes.filter(e => e.setor === setor)
  );
  
  const outrasEquipes = equipes.filter(e => e.setor !== setor);

  const handleMembroChange = (id: string, field: keyof MembroEquipe, value: string) => {
    setEquipeEditavel(prev => 
      prev.map(m => m.id === id ? { ...m, [field]: value } : m)
    );
  };

  const handleRemove = (id: string) => {
    setEquipeEditavel(prev => prev.filter(m => m.id !== id));
  };

  const handleAdd = () => {
    const novoMembro: MembroEquipe = {
      id: `eq-${Date.now()}-${Math.random().toString(36).substr(2,4)}`,
      setor,
      turno: '1º turno',
      cargo: 'Analista',
      nome: '',
      email: ''
    };
    setEquipeEditavel(prev => [...prev, novoMembro]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const novasEquipes = [...outrasEquipes, ...equipeEditavel];
    await atualizarEquipes(novasEquipes);
    aoFechar();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/40">
          <h2 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2">
            Editar Equipe - {setor === 'semissolidos' ? 'Semissólidos' : 'Líquidos'}
          </h2>
          <button onClick={aoFechar} className="text-white/40 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto flex-1 space-y-4">
          
          <div className="space-y-4">
            {equipeEditavel.length === 0 && (
              <div className="text-center text-white/40 py-8 text-sm">
                Nenhum membro cadastrado nesta equipe.
              </div>
            )}
            {equipeEditavel.map((membro) => (
              <div key={membro.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start bg-black/40 p-3 rounded border border-white/5 relative">
                
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">Turno</label>
                  <input
                    type="text"
                    value={membro.turno}
                    onChange={e => handleMembroChange(membro.id, 'turno', e.target.value)}
                    placeholder="Ex: 1º turno"
                    required
                    className="w-full bg-black/60 border border-white/10 text-white text-xs px-2 py-1.5 rounded focus:outline-none focus:border-[#FFD100]"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">Cargo</label>
                  <input
                    type="text"
                    value={membro.cargo}
                    onChange={e => handleMembroChange(membro.id, 'cargo', e.target.value)}
                    placeholder="Ex: Supervisor"
                    required
                    className="w-full bg-black/60 border border-white/10 text-white text-xs px-2 py-1.5 rounded focus:outline-none focus:border-[#FFD100]"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">Nome</label>
                  <input
                    type="text"
                    value={membro.nome}
                    onChange={e => handleMembroChange(membro.id, 'nome', e.target.value)}
                    placeholder="Nome completo"
                    required
                    className="w-full bg-black/60 border border-white/10 text-white text-xs px-2 py-1.5 rounded focus:outline-none focus:border-[#FFD100]"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">E-mail</label>
                  <input
                    type="text"
                    value={membro.email}
                    onChange={e => handleMembroChange(membro.id, 'email', e.target.value)}
                    placeholder="nome.sobrenome@grupocimed.com.br"
                    className="w-full bg-black/60 border border-white/10 text-white text-xs px-2 py-1.5 rounded focus:outline-none focus:border-[#FFD100]"
                  />
                </div>

                <div className="md:col-span-1 flex items-end h-full pt-5 justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemove(membro.id)}
                    className="text-red-500 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded transition-colors"
                    title="Remover"
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
            className="w-full py-3 border border-dashed border-white/20 text-white/60 hover:text-white hover:border-[#FFD100]/50 hover:bg-[#FFD100]/5 rounded flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar Membro
          </button>
        </form>

        <div className="p-4 border-t border-white/10 bg-black/40 flex justify-end gap-3">
          <button
            type="button"
            onClick={aoFechar}
            className="px-4 py-2 bg-transparent text-white/60 hover:text-white text-xs font-bold uppercase tracking-wider"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-[#FFD100] hover:bg-[#FFE04D] text-black rounded font-black text-xs uppercase tracking-wider flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Salvar Equipe
          </button>
        </div>
      </div>
    </div>
  );
};
