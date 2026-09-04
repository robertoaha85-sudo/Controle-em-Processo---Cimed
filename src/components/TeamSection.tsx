import React, { useState } from 'react';
import { Mail, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { MembroEquipe, Setor } from '../types';
import { useProduction } from '../context/ProductionContext';

interface TeamSectionProps {
  setor: Setor;
  equipes: MembroEquipe[];
  onEditClick: (setor: Setor) => void;
}

export const TeamSection: React.FC<TeamSectionProps> = ({ setor, equipes, onEditClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { horaAtual } = useProduction();
  
  const equipeDoSetor = equipes.filter((e) => e.setor === setor);

  // Group by turno
  const turnosMap = new Map<string, MembroEquipe[]>();
  equipeDoSetor.forEach((membro) => {
    if (!turnosMap.has(membro.turno)) {
      turnosMap.set(membro.turno, []);
    }
    turnosMap.get(membro.turno)!.push(membro);
  });

  const turnos = Array.from(turnosMap.entries());

  if (turnos.length === 0) return null;

  // Calcula o turno atual
  // 1º turno = 05:30 às 15:09
  // 2º turno = 15:10 às 21:49
  // 3º turno = 21:50 às 05:29
  const hour = horaAtual.getHours();
  const minute = horaAtual.getMinutes();
  const totalMinutes = hour * 60 + minute;

  let currentTurnoName = '';
  if (totalMinutes >= 330 && totalMinutes < 910) {
    currentTurnoName = '1º turno';
  } else if (totalMinutes >= 910 && totalMinutes < 1310) {
    currentTurnoName = '2º turno';
  } else {
    currentTurnoName = '3º turno';
  }

  // Get members of the current shift plus general/coordinators if applicable
  const currentTurnoMembers = turnosMap.get(currentTurnoName) || [];
  const geralMembers = turnosMap.get('Geral') || [];
  const summarizedMembers = [...currentTurnoMembers, ...geralMembers].filter(m => m.nome && m.nome !== '(a definir)');
  
  // Format summary text
  let summaryText = 'Equipe não definida';
  if (summarizedMembers.length > 0) {
    // Pegar apenas o primeiro nome para não ficar muito longo
    const nomes = summarizedMembers.map(m => m.nome.split(' ')[0]);
    if (nomes.length > 3) {
      summaryText = `${currentTurnoName}: ${nomes.slice(0, 3).join(', ')} e +${nomes.length - 3}`;
    } else {
      summaryText = `${currentTurnoName}: ${nomes.join(', ')}`;
    }
  } else {
    summaryText = `${currentTurnoName}: (a definir)`;
  }

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg text-xs overflow-hidden">
      <div className="flex items-center justify-between p-3 sm:p-4 hover:bg-white/5 transition-colors">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 flex-1 text-left"
        >
          <Users className="w-4 h-4 text-white/60" />
          <span className="font-bold text-white/80 uppercase tracking-widest text-[11px]">
            Equipe Responsável
          </span>
          <span className="text-white/40 ml-2 hidden sm:inline truncate max-w-[200px] md:max-w-[400px]">
            — {summaryText}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-white/40 ml-1" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white/40 ml-1" />
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditClick(setor);
          }}
          className="text-[#FFD100] hover:text-white uppercase tracking-wider text-[10px] font-bold underline ml-4 whitespace-nowrap"
        >
          Editar Equipe
        </button>
      </div>

      <div 
        className="grid transition-all duration-300 ease-in-out"
        style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="p-3 sm:p-4 pt-0 border-t border-white/5 mt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-3">
              {turnos.map(([turno, membros]) => (
                <div key={turno} className="space-y-2 border-l-2 border-white/10 pl-3">
                  <h4 className="font-mono text-[#FFD100]/80 uppercase tracking-wider text-[10px] mb-1.5">{turno}</h4>
                  <div className="space-y-2">
                    {membros.map((membro) => (
                      <div key={membro.id} className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-white/50 uppercase tracking-wider">{membro.cargo}</span>
                        <span className="font-semibold text-white/90 truncate">{membro.nome}</span>
                        {(membro.email && membro.email !== '(a definir)') ? (
                          <div className="flex items-center gap-2 mt-0.5">
                            <a
                              href={`mailto:${membro.email}`}
                              title="Enviar e-mail"
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={`https://teams.microsoft.com/l/chat/0/0?users=${membro.email}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Abrir no Teams"
                              className="text-[#5B5FC7] hover:text-[#7b83eb] transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.983 2.016H11v11h11v-1.983c0-4.98-4.037-9.017-9.017-9.017zM10.134 6.702l-1.914 1.913-1.913-1.913-1.414 1.414 1.913 1.914-1.913 1.914 1.414 1.414 1.913-1.914 1.914 1.914 1.414-1.414-1.914-1.914 1.914-1.914-1.414-1.414zM22.016 14.133H14.133v7.883h7.883v-7.883zM10.134 18.066H2.016v3.918h8.118v-3.918z" />
                                <path d="M2.016 11.233H10.134V2.016C5.642 2.016 2.016 5.642 2.016 10.134v1.099z" />
                                <path d="M13.2 22.016h-2.2v-7.883h2.2v7.883zM14.133 13.2h7.883v-2.2h-7.883v2.2z" />
                              </svg>
                            </a>
                          </div>
                        ) : (
                          <span className="text-[10px] text-white/30 italic">Sem contato</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
