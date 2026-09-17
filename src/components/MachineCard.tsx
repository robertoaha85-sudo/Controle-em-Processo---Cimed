import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Play,
  Check,
  RotateCcw,
  Edit3,
  Sparkles,
  Droplets,
  Hourglass,
  ShieldAlert,
} from 'lucide-react';
import { Maquina, StatusMaquina } from '../types';
import { useProduction } from '../context/ProductionContext';

interface MachineCardProps {
  maquina: Maquina;
  aoIniciarLote: (maquina: Maquina) => void;
}

export const MachineCard: React.FC<MachineCardProps> = ({ maquina, aoIniciarLote }) => {
  const {
    obterStatusEfetivo,
    obterProgresso,
    marcarProblemaMecanico,
    resolverProblemaMecanico,
    alterarStatusMaquina,
    finalizarLote,
    atualizarHoraInicio,
    lotesBloqueio,
  } = useProduction();

  const [editandoHora, setEditandoHora] = useState(false);
  const [novaHora, setNovaHora] = useState(maquina.horaInicio || '07:00');
  const [confirmandoFinalizar, setConfirmandoFinalizar] = useState(false);

  const statusEfetivo: StatusMaquina = obterStatusEfetivo(maquina);
  const progresso = obterProgresso(maquina);

  // Manipulação de hora de início editável
  const salvarHoraInicio = async () => {
    if (novaHora && novaHora !== maquina.horaInicio) {
      await atualizarHoraInicio(maquina.id, novaHora);
    }
    setEditandoHora(false);
  };

  // Configuração visual de acordo com o status
  const configStatus = {
    em_andamento: {
      seloBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
      label: 'EM ANDAMENTO',
      cardBorder: 'border border-white/10 hover:border-white/20',
      cardBg: 'bg-[#1a1a1a]',
      progressBg: 'bg-[#FFD100]',
    },
    problema_mecanico: {
      seloBg: 'bg-red-600 text-white animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.5)]',
      label: 'PROBLEMA MECÂNICO',
      cardBorder: 'border-2 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)]',
      cardBg: 'bg-[#1a1a1a]',
      progressBg: 'bg-red-600',
    },
    atrasado: {
      seloBg: 'bg-orange-500/20 text-orange-400 border border-orange-500/40',
      label: 'ATRASADO',
      cardBorder: 'border border-orange-500/50 shadow-lg',
      cardBg: 'bg-[#1a1a1a]',
      progressBg: 'bg-orange-500',
    },
    em_limpeza_total: {
      seloBg: 'bg-blue-500/20 text-blue-400 border border-blue-500/50',
      label: 'EM LIMPEZA TOTAL',
      cardBorder: 'border border-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.2)]',
      cardBg: 'bg-[#161d2b]',
      progressBg: 'bg-blue-500',
    },
    em_limpeza_parcial: {
      seloBg: 'bg-purple-500/20 text-purple-300 border border-purple-500/50',
      label: 'EM LIMPEZA PARCIAL',
      cardBorder: 'border border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.2)]',
      cardBg: 'bg-[#1e162b]',
      progressBg: 'bg-purple-500',
    },
    aguardando_manipulacao: {
      seloBg: 'bg-amber-400/20 text-amber-300 border border-amber-400/50',
      label: 'AGUARDANDO MANIPULAÇÃO',
      cardBorder: 'border border-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.2)]',
      cardBg: 'bg-[#211c14]',
      progressBg: 'bg-amber-400',
    },
    livre: {
      seloBg: 'bg-white/10 text-white/60 border border-white/20',
      label: 'LOTE FINALIZADO',
      cardBorder: 'border border-white/10',
      cardBg: 'bg-[#1a1a1a] opacity-80 hover:opacity-100',
      progressBg: 'bg-white/20',
    },
  }[statusEfetivo];

  const temProblema = statusEfetivo === 'problema_mecanico';
  const estaAtrasado = statusEfetivo === 'atrasado';
  const emLimpezaTotal = statusEfetivo === 'em_limpeza_total';
  const emLimpezaParcial = statusEfetivo === 'em_limpeza_parcial';
  const aguardandoManipulacao = statusEfetivo === 'aguardando_manipulacao';
  const temLoteAtivo = Boolean(maquina.produtoAtualNome && (statusEfetivo === 'em_andamento' || estaAtrasado || temProblema));

  // Identifica se esta máquina está processando um Lote de Bloqueio (prioridade máxima)
  const isBloqueioAtivo = Boolean(
    maquina.isBloqueio ||
      (temLoteAtivo &&
        lotesBloqueio.some(
          (b) =>
            b.status === 'em_andamento' &&
            (b.maquinaEmUsoId === maquina.id ||
              (b.numeroLote &&
                maquina.numeroLote &&
                b.numeroLote.toLowerCase().trim() === maquina.numeroLote.toLowerCase().trim()))
        ))
  );

  const cardBorderFinal = isBloqueioAtivo
    ? 'border-2 border-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.35)] ring-1 ring-fuchsia-400/50'
    : configStatus.cardBorder;

  const cardBgFinal = isBloqueioAtivo
    ? 'bg-gradient-to-b from-[#240e29] via-[#1a0c20] to-[#140817]'
    : configStatus.cardBg;

  return (
    <div
      id={`card-maquina-${maquina.id}`}
      className={`rounded p-3.5 flex flex-col justify-between relative shadow-lg transition-all ${cardBorderFinal} ${cardBgFinal}`}
    >
      {/* Corner Tag para atraso */}
      {estaAtrasado && !isBloqueioAtivo && (
        <div className="absolute top-0 right-0 px-2 py-0.5 bg-orange-500 text-black text-[8px] font-black uppercase tracking-widest z-10">
          DELAY
        </div>
      )}

      {/* Topo do Card: Nome da Máquina, Etiqueta Piscando de Bloqueio e Selo de Status */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-xs font-black uppercase tracking-wider ${
                isBloqueioAtivo ? 'text-fuchsia-200' : 'text-white'
              }`}
            >
              {maquina.nome}
            </span>
            {maquina.linhaPadrao && (
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-tight">
                • {maquina.linhaPadrao}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {/* Etiqueta Piscando de BLOQUEIO (prioridade máxima) */}
            {isBloqueioAtivo && (
              <span
                id={`etiqueta-bloqueio-${maquina.id}`}
                className="text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider bg-fuchsia-600 text-white animate-pulse border border-fuchsia-300 shadow-[0_0_12px_rgba(217,70,239,0.9)] flex items-center gap-1 shrink-0"
                title="LOTE DE BLOQUEIO: Já vendido, prioridade máxima de produção"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span>BLOQUEIO</span>
              </span>
            )}

            {/* Selo de Status Colorido Normal */}
            <span
              id={`selo-status-${maquina.id}`}
              className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider whitespace-nowrap shadow-sm ${configStatus.seloBg}`}
            >
              {configStatus.label}
            </span>
          </div>
        </div>

        {/* Alerta Visual de Lote de Bloqueio se ativo */}
        {isBloqueioAtivo && (
          <div
            id={`alerta-bloqueio-${maquina.id}`}
            className="text-[10px] bg-fuchsia-950/80 border border-fuchsia-500/60 text-fuchsia-200 font-bold uppercase tracking-wider px-2.5 py-1 rounded mb-2 flex items-center justify-between shadow-[0_0_12px_rgba(217,70,239,0.25)]"
          >
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-fuchsia-400 shrink-0 animate-pulse" />
              <span className="text-white font-black">LOTE JÁ VENDIDO</span>
            </div>
            <span className="text-[9px] font-mono text-fuchsia-300 font-bold bg-fuchsia-900/80 px-1.5 py-0.5 rounded border border-fuchsia-700/60">
              PRIORIDADE MÁXIMA
            </span>
          </div>
        )}

        {/* Informações centrais do Card baseadas no status */}
        {temProblema && (
          <div className="text-[10px] bg-red-950/60 border border-red-600/40 text-red-300 font-bold uppercase tracking-wider px-2 py-1 rounded mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
            <span>ALERTA: PARADA MECÂNICA DA LINHA</span>
          </div>
        )}

        {emLimpezaTotal && (
          <div className="bg-blue-950/40 border border-blue-500/30 rounded p-2.5 my-1.5 space-y-1">
            <div className="flex items-center gap-1.5 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Higienização Total</span>
            </div>
            <p className="text-[10px] text-blue-200/60 leading-tight">
              Procedimento CIP/COP completo de sanitização e desinfecção da envasadora.
            </p>
            {maquina.produtoAtualNome && (
              <p className="text-[10px] text-white/50 truncate pt-0.5 font-mono">
                Último produto: {maquina.produtoAtualNome}
              </p>
            )}
          </div>
        )}

        {emLimpezaParcial && (
          <div className="bg-purple-950/40 border border-purple-500/30 rounded p-2.5 my-1.5 space-y-1">
            <div className="flex items-center gap-1.5 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Droplets className="w-3.5 h-3.5 text-purple-400" />
              <span>Higienização Parcial</span>
            </div>
            <p className="text-[10px] text-purple-200/60 leading-tight">
              Limpeza intermediária e sanitização rápida dos dosadores para troca de lote.
            </p>
            {maquina.produtoAtualNome && (
              <p className="text-[10px] text-white/50 truncate pt-0.5 font-mono">
                Último produto: {maquina.produtoAtualNome}
              </p>
            )}
          </div>
        )}

        {aguardandoManipulacao && (
          <div className="bg-amber-950/40 border border-amber-400/30 rounded p-2.5 my-1.5 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Hourglass className="w-3.5 h-3.5 text-amber-400" />
              <span>Aguardando Manipulação</span>
            </div>
            <p className="text-[10px] text-amber-200/60 leading-tight">
              Aguardando liberação analítica e transferência de granel do setor de manipulação.
            </p>
            {maquina.produtoAtualNome && (
              <p className="text-[10px] text-white/50 truncate pt-0.5 font-mono">
                Produto previsto: {maquina.produtoAtualNome}
              </p>
            )}
          </div>
        )}

        {/* Informações do Lote em Andamento ou Alerta */}
        {(statusEfetivo === 'em_andamento' || estaAtrasado || (temProblema && maquina.produtoAtualNome)) && (
          <div>
            <div className="flex items-center justify-between mb-0.5 flex-wrap gap-1">
              <div className="text-[10px] text-white/40 uppercase font-semibold tracking-wider">
                PRODUTO:
              </div>
              <div className="flex items-center gap-1.5">
                {maquina.produtoAtualCodigo && (
                  <span className="text-[9px] text-white/60 bg-white/10 px-1 py-0.5 rounded font-mono font-bold">
                    CÓD {maquina.produtoAtualCodigo}
                  </span>
                )}
                {maquina.numeroLote && (
                  <div className="text-[9px] text-[#FFD100] border border-[#FFD100]/30 bg-[#FFD100]/10 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider font-bold">
                    LOTE {maquina.numeroLote}
                  </div>
                )}
              </div>
            </div>
            <div className="text-xs font-bold text-white mb-2 truncate" title={maquina.produtoAtualNome || ''}>
              {maquina.produtoAtualNome || '—'}
            </div>

            {/* Informações de Horário de Início e Previsão */}
            <div className="flex items-center justify-between text-[11px] text-white/50 mb-1.5 font-mono">
              <div className="flex items-center gap-1">
                <span>Início:</span>
                {editandoHora ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="time"
                      value={novaHora}
                      onChange={(e) => setNovaHora(e.target.value)}
                      onBlur={salvarHoraInicio}
                      autoFocus
                      className="bg-black border border-[#FFD100] text-white text-xs px-1 py-0 rounded focus:outline-none"
                    />
                    <button
                      onClick={salvarHoraInicio}
                      className="text-emerald-400 hover:text-emerald-300"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setNovaHora(maquina.horaInicio || '07:00');
                      setEditandoHora(true);
                    }}
                    title="Clique para editar horário de início"
                    className="text-white hover:text-[#FFD100] underline font-bold flex items-center gap-0.5"
                  >
                    <span>{maquina.horaInicio || '--:--'}</span>
                    <Edit3 className="w-2.5 h-2.5 opacity-60" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1">
                <span>Previsão:</span>
                <span className={estaAtrasado ? 'text-orange-400 font-bold' : 'text-white/80 font-bold'}>
                  {maquina.previsaoTermino || '--:--'}
                </span>
              </div>
            </div>

            {/* Barra de Progresso em Linha */}
            <div className="w-full bg-black h-1.5 rounded-full overflow-hidden mb-2 border border-white/5">
              <div
                className={`h-full transition-all duration-1000 ${
                  isBloqueioAtivo
                    ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 shadow-[0_0_10px_rgba(217,70,239,0.7)]'
                    : estaAtrasado
                    ? 'bg-orange-500 w-full'
                    : temProblema
                    ? 'bg-red-600'
                    : 'bg-[#FFD100]'
                }`}
                style={{ width: estaAtrasado && !isBloqueioAtivo ? '100%' : `${Math.min(100, progresso.porcentagem)}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-white/50 mb-1">
              <span>{progresso.tempoRestanteTexto}</span>
              <span className="font-bold text-white/80">{progresso.porcentagem}%</span>
            </div>
          </div>
        )}

        {/* Máquina Livre / Sem Lote */}
        {statusEfetivo === 'livre' && (
          <div className="h-16 flex flex-col items-center justify-center border border-dashed border-white/10 rounded my-1.5">
            <span className="text-[10px] uppercase text-white/40 font-mono tracking-wider">
              Pronta para Carga
            </span>
            <span className="text-[9px] text-white/30">Selecione uma ação abaixo</span>
          </div>
        )}
      </div>

      {/* Botões de Ação no Rodapé do Card */}
      <div className="pt-2 border-t border-white/10 mt-2 space-y-1.5">
        {confirmandoFinalizar ? (
          <div className="bg-emerald-950/80 p-2 rounded border border-emerald-500/50 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Finalizar lote atual?
              </span>
              {maquina.numeroLote && (
                <span className="text-white/70 font-mono text-[9px] bg-black/40 px-1 rounded">
                  Lt: {maquina.numeroLote}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                id={`btn-confirmar-finalizar-${maquina.id}`}
                onClick={async () => {
                  await finalizarLote(maquina.id);
                  setConfirmandoFinalizar(false);
                }}
                className="flex-1 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-black py-1.5 px-2 rounded uppercase tracking-wider cursor-pointer shadow flex items-center justify-center gap-1 transition-colors"
              >
                <span>Confirmar e Liberar</span>
              </button>
              <button
                onClick={() => setConfirmandoFinalizar(false)}
                className="text-[10px] bg-white/10 hover:bg-white/20 text-white/80 py-1.5 px-2.5 rounded uppercase tracking-wider cursor-pointer transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Linha 1 de Ações: Ações Principais (Iniciar lote, Marcar problema mecânico, Finalizar lote) */}
            <div className="grid grid-cols-3 gap-1.5">
              {/* 1. Iniciar lote */}
              <button
                id={`btn-iniciar-lote-${maquina.id}`}
                onClick={() => aoIniciarLote(maquina)}
                className="text-[10px] font-black bg-[#FFD100] hover:bg-[#ffe043] text-black py-1.5 px-1 rounded uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer shadow"
                title="Iniciar novo lote de produção"
              >
                <Play className="w-3 h-3 fill-black" />
                <span className="truncate">{temLoteAtivo ? 'Trocar' : 'Iniciar lote'}</span>
              </button>

              {/* 2. Marcar problema mecânico / Liberar */}
              {temProblema ? (
                <button
                  id={`btn-resolver-problema-${maquina.id}`}
                  onClick={() => resolverProblemaMecanico(maquina.id)}
                  className="text-[10px] font-black bg-red-600 hover:bg-red-500 text-white py-1.5 px-1 rounded uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer shadow"
                  title="Liberar máquina da manutenção mecânica"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="truncate">Liberar</span>
                </button>
              ) : (
                <button
                  id={`btn-marcar-problema-${maquina.id}`}
                  onClick={() => marcarProblemaMecanico(maquina.id)}
                  className="text-[10px] font-bold bg-white/5 border border-white/10 hover:bg-red-600 hover:border-red-600 hover:text-white text-white/80 py-1.5 px-1 rounded uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  title="Marcar problema mecânico na máquina"
                >
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  <span className="truncate">Problema</span>
                </button>
              )}

              {/* 3. Finalizar lote */}
              <button
                id={`btn-finalizar-lote-${maquina.id}`}
                onClick={() => {
                  if (temLoteAtivo || maquina.produtoAtualNome) {
                    setConfirmandoFinalizar(true);
                  }
                }}
                disabled={!temLoteAtivo && !maquina.produtoAtualNome}
                className={`text-[10px] font-bold py-1.5 px-1 rounded uppercase tracking-wider transition-colors flex items-center justify-center gap-1 ${
                  !temLoteAtivo && !maquina.produtoAtualNome
                    ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                    : estaAtrasado
                    ? 'bg-orange-500 hover:bg-orange-400 text-black font-black shadow cursor-pointer'
                    : 'bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600 hover:text-white text-emerald-300 cursor-pointer'
                }`}
                title={
                  !temLoteAtivo && !maquina.produtoAtualNome
                    ? 'Máquina livre — nenhum lote em andamento para finalizar'
                    : 'Finalizar lote atual e registrar no histórico'
                }
              >
                <CheckCircle2 className="w-3 h-3" />
                <span className="truncate">Finalizar lote</span>
              </button>
            </div>

            {/* Linha 2 de Ações: Os 3 novos status solicitados */}
            <div className="grid grid-cols-3 gap-1.5">
              {/* 4. Em limpeza total (cor azul) */}
              <button
                id={`btn-limpeza-total-${maquina.id}`}
                onClick={() => {
                  if (statusEfetivo === 'em_limpeza_total') {
                    alterarStatusMaquina(maquina.id, 'livre');
                  } else {
                    alterarStatusMaquina(maquina.id, 'em_limpeza_total');
                  }
                }}
                className={`text-[9px] font-bold py-1 px-1 rounded uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  statusEfetivo === 'em_limpeza_total'
                    ? 'bg-blue-600 text-white font-black border border-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.4)]'
                    : 'bg-blue-500/10 border border-blue-500/30 text-blue-300 hover:bg-blue-500/20 hover:border-blue-500/60'
                }`}
                title="Colocar em Limpeza Total (Azul)"
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span className="truncate">Limpeza Total</span>
              </button>

              {/* 5. Em limpeza parcial (cor roxa/lilás) */}
              <button
                id={`btn-limpeza-parcial-${maquina.id}`}
                onClick={() => {
                  if (statusEfetivo === 'em_limpeza_parcial') {
                    alterarStatusMaquina(maquina.id, 'livre');
                  } else {
                    alterarStatusMaquina(maquina.id, 'em_limpeza_parcial');
                  }
                }}
                className={`text-[9px] font-bold py-1 px-1 rounded uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  statusEfetivo === 'em_limpeza_parcial'
                    ? 'bg-purple-600 text-white font-black border border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                    : 'bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/60'
                }`}
                title="Colocar em Limpeza Parcial (Roxa/Lilás)"
              >
                <Droplets className="w-2.5 h-2.5" />
                <span className="truncate">Limpeza Parcial</span>
              </button>

              {/* 6. Aguardando manipulação (cor âmbar) */}
              <button
                id={`btn-aguardando-manipulacao-${maquina.id}`}
                onClick={() => {
                  if (statusEfetivo === 'aguardando_manipulacao') {
                    alterarStatusMaquina(maquina.id, 'livre');
                  } else {
                    alterarStatusMaquina(maquina.id, 'aguardando_manipulacao');
                  }
                }}
                className={`text-[9px] font-bold py-1 px-1 rounded uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  statusEfetivo === 'aguardando_manipulacao'
                    ? 'bg-amber-400 text-black font-black border border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                    : 'bg-amber-400/10 border border-amber-400/30 text-amber-300 hover:bg-amber-400/20 hover:border-amber-400/60'
                }`}
                title="Colocar em Aguardando Manipulação (Âmbar)"
              >
                <Clock className="w-2.5 h-2.5" />
                <span className="truncate">Aguard. Manip.</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
