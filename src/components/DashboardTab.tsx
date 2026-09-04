import React, { useState, useMemo } from 'react';
import { HelpCircle } from 'lucide-react';
import { Maquina, Setor } from '../types';
import { useProduction } from '../context/ProductionContext';
import { MachineCard } from './MachineCard';
import { StartBatchModal } from './StartBatchModal';
import { TeamSection } from './TeamSection';
import { TeamEditModal } from './TeamEditModal';

const ORDEM_SEMISSOLIDOS = ['norden i', 'norden ii', 'norden iii', 'norden iv'];
const ORDEM_LIQUIDOS = ['cam', 'gotas', 'xarope', 'externo', 'epativan'];

export const DashboardTab: React.FC = () => {
  const { maquinas, equipes } = useProduction();
  const [maquinaModal, setMaquinaModal] = useState<Maquina | null>(null);
  const [editSetorEquipe, setEditSetorEquipe] = useState<Setor | null>(null);

  // Ordena rigorosamente conforme especificação do chão de fábrica
  const maquinasSemissolidos = useMemo(() => {
    return maquinas
      .filter((m) => m.setor === 'semissolidos')
      .sort((a, b) => {
        const idxA = ORDEM_SEMISSOLIDOS.indexOf(a.nome.toLowerCase().trim());
        const idxB = ORDEM_SEMISSOLIDOS.indexOf(b.nome.toLowerCase().trim());
        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
      });
  }, [maquinas]);

  const maquinasLiquidos = useMemo(() => {
    return maquinas
      .filter((m) => m.setor === 'liquidos')
      .sort((a, b) => {
        const idxA = ORDEM_LIQUIDOS.indexOf(a.nome.toLowerCase().trim());
        const idxB = ORDEM_LIQUIDOS.indexOf(b.nome.toLowerCase().trim());
        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
      });
  }, [maquinas]);

  return (
    <div id="dashboard-tab-content" className="flex flex-col space-y-8 w-full">
      {/* 1. SEÇÃO SETOR SEMISSÓLIDOS (PRIMEIRO BLOCO, LARGURA TOTAL) */}
      <section id="setor-semissolidos-section" className="w-full flex flex-col gap-3">
        <div className="flex items-center justify-between border-l-4 border-red-600 pl-3 py-1.5 bg-[#161616] rounded-r border-y border-r border-white/5 w-full">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-widest text-red-500 flex items-center">
              <span>SEMISSÓLIDOS</span>
              <span className="text-white/40 ml-2 font-normal text-xs">({maquinasSemissolidos.length} Máquinas)</span>
            </h2>
          </div>
          <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider hidden sm:inline pr-2">
            Norden I a IV
          </span>
        </div>

        <TeamSection setor="semissolidos" equipes={equipes} onEditClick={setEditSetorEquipe} />

        {/* Grid das 4 máquinas (2–4 colunas no desktop, 1 coluna no mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {maquinasSemissolidos.map((maquina) => (
            <MachineCard
              key={maquina.id}
              maquina={maquina}
              aoIniciarLote={(m) => setMaquinaModal(m)}
            />
          ))}
        </div>
      </section>

      {/* 2. SEÇÃO SETOR LÍQUIDOS (SEGUNDO BLOCO ABAIXO, LARGURA TOTAL) */}
      <section id="setor-liquidos-section" className="w-full flex flex-col gap-3">
        <div className="flex items-center justify-between border-l-4 border-[#FFD100] pl-3 py-1.5 bg-[#161616] rounded-r border-y border-r border-white/5 w-full">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#FFD100] flex items-center">
              <span>LÍQUIDOS</span>
              <span className="text-white/40 ml-2 font-normal text-xs">({maquinasLiquidos.length} Máquinas)</span>
            </h2>
          </div>
          <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider hidden sm:inline pr-2">
            CAM, Gotas, Xarope, Externo, Epativan
          </span>
        </div>

        <TeamSection setor="liquidos" equipes={equipes} onEditClick={setEditSetorEquipe} />

        {/* Grid das 5 máquinas (2–3 colunas no desktop, 1 coluna no mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {maquinasLiquidos.map((maquina) => (
            <MachineCard
              key={maquina.id}
              maquina={maquina}
              aoIniciarLote={(m) => setMaquinaModal(m)}
            />
          ))}
        </div>
      </section>

      {/* Dica operacional de chão de fábrica com estilo Technical Dashboard */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded p-3 sm:p-4 text-white/60 text-xs flex items-start gap-3 shadow-lg">
        <HelpCircle className="w-4 h-4 text-[#FFD100] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold uppercase tracking-wider text-white/90">Instruções de Operação • Painel Técnico:</span>
          <p className="leading-relaxed">
            Selecione o status de cada máquina diretamente nos botões do card (Iniciar lote, Problema mecânico, Finalizar lote, Limpeza total, Limpeza parcial ou Aguardando manipulação). O cálculo de previsão e progresso é atualizado em tempo real.
          </p>
        </div>
      </div>

      {/* Modal para Iniciar / Trocar Lote */}
      {maquinaModal && (
        <StartBatchModal
          maquina={maquinaModal}
          aoFechar={() => setMaquinaModal(null)}
        />
      )}

      {/* Modal de Edição de Equipe */}
      {editSetorEquipe && (
        <TeamEditModal
          setor={editSetorEquipe}
          aoFechar={() => setEditSetorEquipe(null)}
        />
      )}
    </div>
  );
};
