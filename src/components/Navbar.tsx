import React from 'react';
import { Activity, AlertTriangle, CheckCircle2, Clock, Volume2, VolumeX, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useProduction } from '../context/ProductionContext';

interface NavbarProps {
  abaAtiva: 'dashboard' | 'produtos' | 'historico';
  setAbaAtiva: (aba: 'dashboard' | 'produtos' | 'historico') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ abaAtiva, setAbaAtiva }) => {
  const { horaAtual, conectado, somAtivo, alternarSom, resumo } = useProduction();

  // Formata hora digital HH:mm:ss
  const horaStr = horaAtual.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Formata data por extenso
  const dataStr = horaAtual.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header id="cimed-header" className="bg-[#0a0a0a] border-b border-white/10 text-white sticky top-0 z-40 shadow-xl">
      {/* Barra superior de status & marca */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo CIMED e Título */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-[#FFD100] text-black font-black px-3 py-1 text-2xl tracking-tighter shadow select-none">
                CIMED
              </div>
              <div className="h-8 w-px bg-white/20 hidden sm:block"></div>
              <div>
                <h1 className="text-base sm:text-lg font-medium tracking-wide uppercase text-white/90 flex items-center gap-2">
                  <span>Controle em Processo</span>
                </h1>
                <p className="text-[11px] text-white/40 hidden sm:block tracking-wide">
                  Acompanhamento em tempo real das máquinas de envase
                </p>
              </div>
            </div>

            {/* Relógio em telas menores */}
            <div className="md:hidden flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded border border-white/5">
              <div className="flex flex-col items-end">
                <span className="text-[9px] uppercase text-white/40 leading-none">Hora Atual</span>
                <span className="text-base font-mono font-bold text-[#FFD100] tracking-wider mt-0.5">
                  {horaStr}
                </span>
              </div>
            </div>
          </div>

          {/* Seção Central/Direita: Relógio grande e Conexão */}
          <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-4">
            {/* Relógio Digital Desktop estilo Technical Dashboard */}
            <div className="hidden md:flex items-center gap-3 bg-black/40 px-4 py-2 rounded border border-white/10">
              <Clock className="w-4 h-4 text-[#FFD100]" />
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-wider text-white/40 leading-none">Hora Atual</span>
                <span className="text-xl font-mono font-bold text-[#FFD100] tracking-wider">
                  {horaStr}
                </span>
              </div>
            </div>

            {/* Indicador de Status SSE e Som */}
            <div className="flex items-center gap-2">
              {/* Badge SSE */}
              <div
                id="badge-conexao"
                title={conectado ? 'Sincronizado em tempo real entre todos os dispositivos' : 'Tentando reconectar ao servidor...'}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider border ${
                  conectado
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/40 text-red-400 animate-pulse'
                }`}
              >
                {conectado ? (
                  <>
                    <Wifi className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>Reconectando</span>
                  </>
                )}
              </div>

              {/* Botão de Som para Alarmes */}
              <button
                id="btn-toggle-som"
                onClick={alternarSom}
                title={somAtivo ? 'Desativar sirene de problema mecânico' : 'Ativar sirene sonora de alerta'}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                  somAtivo
                    ? 'bg-white/10 hover:bg-white/15 text-[#FFD100] border-white/20'
                    : 'bg-black/30 hover:bg-white/5 text-white/40 border-white/10'
                }`}
              >
                {somAtivo ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[#FFD100]" />
                    <span className="hidden lg:inline">Alarme ON</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Alarme OFF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Resumo do Status do Chão de Fábrica - Estilo Badges do Technical Dashboard */}
        <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Rodando / Em andamento */}
            <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-2.5 py-1 rounded flex items-center gap-1.5 font-bold uppercase text-[11px] tracking-wider">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>{resumo.emAndamento} Rodando</span>
            </div>

            {/* Crítico / Problema mecânico */}
            <div
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 font-bold uppercase text-[11px] tracking-wider border transition-all ${
                resumo.problemaMecanico > 0
                  ? 'bg-red-500/20 border-red-500/60 text-red-400 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                  : 'bg-white/5 border-white/10 text-white/40'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${resumo.problemaMecanico > 0 ? 'bg-red-500' : 'bg-neutral-600'}`}></span>
              <span>{resumo.problemaMecanico} Crítico</span>
            </div>

            {/* Atrasado */}
            <div
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 font-bold uppercase text-[11px] tracking-wider border ${
                resumo.atrasadas > 0
                  ? 'bg-orange-500/20 border-orange-500/60 text-orange-400'
                  : 'bg-white/5 border-white/10 text-white/40'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${resumo.atrasadas > 0 ? 'bg-orange-500' : 'bg-neutral-600'}`}></span>
              <span>{resumo.atrasadas} Atrasado</span>
            </div>

            {/* Limpeza Total (Azul) */}
            {resumo.emLimpezaTotal > 0 && (
              <div className="bg-blue-500/20 border border-blue-500/60 text-blue-400 px-2.5 py-1 rounded flex items-center gap-1.5 font-bold uppercase text-[11px] tracking-wider">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>{resumo.emLimpezaTotal} Limpeza Total</span>
              </div>
            )}

            {/* Limpeza Parcial (Roxa/Lilás) */}
            {resumo.emLimpezaParcial > 0 && (
              <div className="bg-purple-500/20 border border-purple-500/60 text-purple-300 px-2.5 py-1 rounded flex items-center gap-1.5 font-bold uppercase text-[11px] tracking-wider">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span>{resumo.emLimpezaParcial} Limpeza Parcial</span>
              </div>
            )}

            {/* Aguardando Manipulação (Âmbar) */}
            {resumo.aguardandoManipulacao > 0 && (
              <div className="bg-amber-400/20 border border-amber-400/60 text-amber-300 px-2.5 py-1 rounded flex items-center gap-1.5 font-bold uppercase text-[11px] tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>{resumo.aguardandoManipulacao} Aguard. Manipulação</span>
              </div>
            )}

            {/* Livre */}
            <div className="bg-white/5 border border-white/10 text-white/60 px-2.5 py-1 rounded flex items-center gap-1.5 font-bold uppercase text-[11px] tracking-wider">
              <span className="w-2 h-2 rounded-full bg-white/40"></span>
              <span>{resumo.livres} Livre / Finalizado</span>
            </div>
          </div>

          <div className="text-white/40 text-[11px] font-mono hidden lg:block tracking-wider uppercase">
            Capacidade: <span className="text-white font-bold">{resumo.total} Máquinas</span>
          </div>
        </div>
      </div>

      {/* Barra de Abas (Navegação Superior em Desktop) estilo Technical Dashboard */}
      <nav aria-label="Navegação principal" className="flex bg-[#0a0a0a] border-t border-white/10 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto w-full flex items-center">
          <button
            id="tab-btn-dashboard"
            onClick={() => setAbaAtiva('dashboard')}
            className={`px-6 sm:px-8 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors border-r border-white/5 whitespace-nowrap cursor-pointer ${
              abaAtiva === 'dashboard'
                ? 'bg-[#FFD100] text-black shadow'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>Dashboard</span>
              {resumo.problemaMecanico > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping ml-0.5" />
              )}
            </div>
          </button>

          <button
            id="tab-btn-produtos"
            onClick={() => setAbaAtiva('produtos')}
            className={`px-6 sm:px-8 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors border-r border-white/5 whitespace-nowrap cursor-pointer ${
              abaAtiva === 'produtos'
                ? 'bg-[#FFD100] text-black shadow'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Tempos Médios</span>
            </div>
          </button>

          <button
            id="tab-btn-historico"
            onClick={() => setAbaAtiva('historico')}
            className={`px-6 sm:px-8 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors border-r border-white/5 whitespace-nowrap cursor-pointer ${
              abaAtiva === 'historico'
                ? 'bg-[#FFD100] text-black shadow'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Histórico de Lotes</span>
            </div>
          </button>
        </div>
      </nav>
    </header>
  );
};
