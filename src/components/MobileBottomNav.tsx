import React from 'react';
import { Activity, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useProduction } from '../context/ProductionContext';

interface MobileBottomNavProps {
  abaAtiva: 'dashboard' | 'produtos' | 'historico' | 'bloqueio';
  setAbaAtiva: (aba: 'dashboard' | 'produtos' | 'historico' | 'bloqueio') => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ abaAtiva, setAbaAtiva }) => {
  const { resumo, lotesBloqueio } = useProduction();

  const totalBloqueios = lotesBloqueio.filter(
    (b) => b.status === 'pendente' || b.status === 'em_andamento'
  ).length;

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Navegação inferior mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#111111] border-t border-white/10 px-1 py-1 shadow-[0_-4px_20px_rgba(0,0,0,0.8)]"
    >
      <div className="grid grid-cols-4 gap-1">
        <button
          id="mobile-tab-btn-dashboard"
          onClick={() => setAbaAtiva('dashboard')}
          className={`flex flex-col items-center justify-center py-2 px-0.5 rounded transition-all ${
            abaAtiva === 'dashboard'
              ? 'bg-[#1a1a1a] text-[#FFD100] font-black border-b-2 border-[#FFD100]'
              : 'text-white/40 hover:text-white/70'
          }`}
        >
          <div className="relative">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
            {resumo.problemaMecanico > 0 && (
              <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            )}
          </div>
          <span className="text-[9px] mt-1 uppercase tracking-wider">Painel</span>
        </button>

        <button
          id="mobile-tab-btn-bloqueio"
          onClick={() => setAbaAtiva('bloqueio')}
          className={`flex flex-col items-center justify-center py-2 px-0.5 rounded transition-all ${
            abaAtiva === 'bloqueio'
              ? 'bg-fuchsia-950/80 text-fuchsia-300 font-black border-b-2 border-fuchsia-500'
              : 'text-fuchsia-400/60 hover:text-fuchsia-300'
          }`}
        >
          <div className="relative">
            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-fuchsia-400" />
            {totalBloqueios > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1 py-0.2 bg-fuchsia-500 text-white text-[8px] font-black rounded-full animate-pulse">
                {totalBloqueios}
              </span>
            )}
          </div>
          <span className="text-[9px] mt-1 uppercase tracking-wider">Bloqueio</span>
        </button>

        <button
          id="mobile-tab-btn-produtos"
          onClick={() => setAbaAtiva('produtos')}
          className={`flex flex-col items-center justify-center py-2 px-0.5 rounded transition-all ${
            abaAtiva === 'produtos'
              ? 'bg-[#1a1a1a] text-[#FFD100] font-black border-b-2 border-[#FFD100]'
              : 'text-white/40 hover:text-white/70'
          }`}
        >
          <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[9px] mt-1 uppercase tracking-wider">Tempos</span>
        </button>

        <button
          id="mobile-tab-btn-historico"
          onClick={() => setAbaAtiva('historico')}
          className={`flex flex-col items-center justify-center py-2 px-0.5 rounded transition-all ${
            abaAtiva === 'historico'
              ? 'bg-[#1a1a1a] text-[#FFD100] font-black border-b-2 border-[#FFD100]'
              : 'text-white/40 hover:text-white/70'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[9px] mt-1 uppercase tracking-wider">Histórico</span>
        </button>
      </div>
    </nav>
  );
};
