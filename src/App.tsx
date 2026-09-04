import React, { useState } from 'react';
import { ProductionProvider } from './context/ProductionContext';
import { Navbar } from './components/Navbar';
import { DashboardTab } from './components/DashboardTab';
import { ProductsTab } from './components/ProductsTab';
import { HistoryTab } from './components/HistoryTab';
import { MobileBottomNav } from './components/MobileBottomNav';

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState<'dashboard' | 'produtos' | 'historico'>('dashboard');

  return (
    <ProductionProvider>
      <div className="min-h-screen bg-[#111111] text-white flex flex-col font-sans selection:bg-[#FFD100] selection:text-black">
        {/* Barra de Navegação Superior e Status */}
        <Navbar abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />

        {/* Conteúdo Principal */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24 md:pb-8">
          {abaAtiva === 'dashboard' && <DashboardTab />}
          {abaAtiva === 'produtos' && <ProductsTab />}
          {abaAtiva === 'historico' && <HistoryTab />}
        </main>

        {/* Rodapé Desktop - Estilo Technical Dashboard */}
        <footer className="hidden md:flex bg-[#FFD100] text-black px-6 py-2.5 items-center justify-between mt-auto shadow-md">
          <div className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-tight">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-black rounded-full"></span>
              <span>CIMED • Unidade Pouso Alegre</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-black rounded-full"></span>
              <span>Controle em Processo • Farmacêutica</span>
            </div>
          </div>
          <div className="flex items-center gap-5 text-[10px] font-bold uppercase tracking-wider">
            <span>
              Server Sync Status: <span className="text-emerald-900 font-black">Connected</span>
            </span>
            <span className="opacity-80">v2.4.0</span>
          </div>
        </footer>

        {/* Barra de Navegação Inferior Fixa no Mobile */}
        <MobileBottomNav abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
      </div>
    </ProductionProvider>
  );
}
