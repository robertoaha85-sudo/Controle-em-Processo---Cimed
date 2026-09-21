import React, { useState } from 'react';
import { ProductionProvider, useProduction } from './context/ProductionContext';
import { Navbar } from './components/Navbar';
import { DashboardTab } from './components/DashboardTab';
import { ProductsTab } from './components/ProductsTab';
import { HistoryTab } from './components/HistoryTab';
import { LotesBloqueioTab } from './components/LotesBloqueioTab';
import { MobileBottomNav } from './components/MobileBottomNav';

function FooterSyncStatus() {
  const { conectado, ultimaSincronizacao } = useProduction();

  return (
    <div className="flex items-center gap-3 sm:gap-5 text-[10px] font-bold uppercase tracking-wider">
      <div className="flex items-center gap-1.5">
        <span
          className={`w-2 h-2 rounded-full ${
            conectado ? 'bg-emerald-800 animate-pulse' : 'bg-red-700'
          }`}
        ></span>
        <span>
          Sincronização Nuvem:{' '}
          <span className={conectado ? 'text-emerald-950 font-black' : 'text-red-950 font-black'}>
            {conectado ? 'Ao Vivo (Tempo Real)' : 'Reconectando...'}
          </span>
        </span>
        {ultimaSincronizacao && (
          <span className="text-black/60 hidden md:inline">
            • {ultimaSincronizacao.toLocaleTimeString('pt-BR')}
          </span>
        )}
      </div>
      <span className="opacity-80 hidden sm:inline">v2.5.0</span>
    </div>
  );
}

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState<'dashboard' | 'produtos' | 'historico' | 'bloqueio'>('dashboard');

  return (
    <ProductionProvider>
      <div className="min-h-screen bg-[#111111] text-white flex flex-col font-sans selection:bg-[#FFD100] selection:text-black">
        {/* Barra de Navegação Superior e Status */}
        <Navbar abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />

        {/* Conteúdo Principal */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24 md:pb-8">
          {abaAtiva === 'dashboard' && <DashboardTab />}
          {abaAtiva === 'bloqueio' && (
            <LotesBloqueioTab aoIrParaDashboard={() => setAbaAtiva('dashboard')} />
          )}
          {abaAtiva === 'produtos' && <ProductsTab />}
          {abaAtiva === 'historico' && <HistoryTab />}
        </main>

        {/* Rodapé - Estilo Technical Dashboard */}
        <footer className="bg-[#FFD100] text-black px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between mt-auto shadow-md gap-2 pb-20 md:pb-2.5">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 text-[11px] font-bold uppercase tracking-tight">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-black rounded-full"></span>
              <span>CIMED UNIDADE 01</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-black rounded-full"></span>
              <span>Criador: Roberto Coelho Dos Santos Junior</span>
            </div>
          </div>
          <FooterSyncStatus />
        </footer>

        {/* Barra de Navegação Inferior Fixa no Mobile */}
        <MobileBottomNav abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
      </div>
    </ProductionProvider>
  );
}
