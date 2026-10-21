import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  AlertTriangle,
  Check,
  Trash2,
  Pause,
  Wrench,
  Sparkles,
  Hourglass,
  HelpCircle,
} from 'lucide-react';
import { Maquina, ParadaLote, MotivoParada } from '../types';
import { useProduction } from '../context/ProductionContext';
import { formatarMinutosParaTexto } from '../initialData';

interface ParadaModalProps {
  isOpen: boolean;
  maquina: Maquina;
  paradaParaEditar?: ParadaLote | null;
  aoFechar: () => void;
}

// Converte Date ou ISO string para o formato do input datetime-local: YYYY-MM-DDTHH:mm
function paraInputDateTimeLocal(dataInput?: string | Date | null): string {
  if (!dataInput) return '';
  const d = typeof dataInput === 'string' ? new Date(dataInput) : dataInput;
  if (isNaN(d.getTime())) return '';
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  const hora = String(d.getHours()).padStart(2, '0');
  const minuto = String(d.getMinutes()).padStart(2, '0');
  return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
}

export const ParadaModal: React.FC<ParadaModalProps> = ({
  isOpen,
  maquina,
  paradaParaEditar,
  aoFechar,
}) => {
  const { adicionarParada, editarParada, removerParada } = useProduction();

  const [motivo, setMotivo] = useState<MotivoParada>('Pausa');
  const [inicioStr, setInicioStr] = useState('');
  const [fimStr, setFimStr] = useState('');
  const [observacao, setObservacao] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  // Calcula a data/hora inicial do lote para validação
  const obterDataHoraInicioLote = (): Date => {
    const hojeStr = new Date().toISOString().split('T')[0];
    const dataLote = maquina.dataInicio || hojeStr;
    const horaLote = maquina.horaInicio || '00:00';
    const [h, m] = horaLote.split(':').map(Number);
    const d = new Date(dataLote);
    d.setHours(h || 0, m || 0, 0, 0);
    return d;
  };

  useEffect(() => {
    if (isOpen) {
      setErro(null);
      if (paradaParaEditar) {
        setMotivo(paradaParaEditar.motivo);
        setInicioStr(paraInputDateTimeLocal(paradaParaEditar.inicio));
        setFimStr(paraInputDateTimeLocal(paradaParaEditar.fim));
        setObservacao(paradaParaEditar.observacao || '');
      } else {
        // Nova parada: sugere início = agora (ou início do lote se recente)
        const agora = new Date();
        setMotivo('Pausa');
        setInicioStr(paraInputDateTimeLocal(agora));
        setFimStr('');
        setObservacao('');
      }
    }
  }, [isOpen, paradaParaEditar]);

  if (!isOpen) return null;

  const batchStart = obterDataHoraInicioLote();
  const agora = new Date();

  const handleDefinirInicioLote = () => {
    setInicioStr(paraInputDateTimeLocal(batchStart));
    setErro(null);
  };

  const handleDefinirInicioAgora = () => {
    setInicioStr(paraInputDateTimeLocal(new Date()));
    setErro(null);
  };

  const handleDefinirFimAgora = () => {
    setFimStr(paraInputDateTimeLocal(new Date()));
    setErro(null);
  };

  const handleLimparFim = () => {
    setFimStr('');
    setErro(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!inicioStr) {
      setErro('Informe o horário de início da parada.');
      return;
    }

    const inicioDate = new Date(inicioStr);
    if (isNaN(inicioDate.getTime())) {
      setErro('Horário de início inválido.');
      return;
    }

    let fimDate: Date | null = null;
    if (fimStr) {
      fimDate = new Date(fimStr);
      if (isNaN(fimDate.getTime())) {
        setErro('Horário de término inválido.');
        return;
      }
    }

    // Validação 1: O início da parada não pode ser anterior ao início do lote
    // Tolerância de 1 minuto para evitar pequenas variações de segundos
    if (inicioDate.getTime() < batchStart.getTime() - 60000) {
      const dataFormatada = batchStart.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
      setErro(`O início da parada não pode ser anterior ao início do lote (${dataFormatada}).`);
      return;
    }

    // Validação 2: Início não pode ser no futuro
    if (inicioDate.getTime() > agora.getTime() + 60000) {
      setErro('O horário de início da parada não pode ser no futuro.');
      return;
    }

    // Validação 3: Se houver fim, deve ser depois do início e não no futuro
    if (fimDate) {
      if (fimDate.getTime() <= inicioDate.getTime()) {
        setErro('O horário de término deve ser posterior ao horário de início.');
        return;
      }
      if (fimDate.getTime() > agora.getTime() + 60000) {
        setErro('O horário de término da parada não pode ser no futuro.');
        return;
      }
    }

    // Validação 4: Duas paradas do mesmo lote não podem se sobrepor
    const paradasExistentes = (maquina.paradas || []).filter(
      (p) => !paradaParaEditar || p.id !== paradaParaEditar.id
    );

    const novoInicioMs = inicioDate.getTime();
    const novoFimMs = fimDate ? fimDate.getTime() : agora.getTime();

    for (const p of paradasExistentes) {
      if (!p.inicio) continue;
      const pIniMs = new Date(p.inicio).getTime();
      const pFimMs = p.fim ? new Date(p.fim).getTime() : agora.getTime();

      // Interseção de intervalos: max(início1, início2) < min(fim1, fim2)
      if (Math.max(novoInicioMs, pIniMs) < Math.min(novoFimMs, pFimMs)) {
        const pIniTxt = new Date(p.inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const pFimTxt = p.fim
          ? new Date(p.fim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          : 'em andamento';
        setErro(
          `Conflito de horários: já existe a parada "${p.motivo}" registrada entre ${pIniTxt} e ${pFimTxt}. Duas paradas não podem se sobrepor.`
        );
        return;
      }
    }

    try {
      setSalvando(true);
      if (paradaParaEditar) {
        await editarParada(maquina.id, paradaParaEditar.id, {
          inicio: inicioDate.toISOString(),
          fim: fimDate ? fimDate.toISOString() : null,
          motivo,
          observacao: observacao.trim() || undefined,
        });
      } else {
        await adicionarParada(maquina.id, {
          inicio: inicioDate.toISOString(),
          fim: fimDate ? fimDate.toISOString() : null,
          motivo,
          observacao: observacao.trim() || undefined,
          automatica: false,
        });
      }
      aoFechar();
    } catch (err) {
      console.error('Erro ao salvar parada:', err);
      setErro('Erro ao salvar parada. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async () => {
    if (!paradaParaEditar) return;
    if (confirm('Deseja realmente remover este registro de parada do lote?')) {
      try {
        setSalvando(true);
        await removerParada(maquina.id, paradaParaEditar.id);
        aoFechar();
      } catch (err) {
        console.error('Erro ao excluir parada:', err);
        setErro('Erro ao excluir parada.');
      } finally {
        setSalvando(false);
      }
    }
  };

  // Cálculo da duração estimada em minutos da parada que está sendo digitada
  const duracaoEstimadaMinutos = (() => {
    if (!inicioStr) return 0;
    const ini = new Date(inicioStr).getTime();
    if (isNaN(ini)) return 0;
    const fim = fimStr ? new Date(fimStr).getTime() : agora.getTime();
    if (isNaN(fim) || fim <= ini) return 0;
    return Math.round((fim - ini) / 60000);
  })();

  const motivosDisponiveis: { valor: MotivoParada; rotulo: string; icone: React.FC<any>; cor: string }[] = [
    { valor: 'Pausa', rotulo: 'Pausa (Operacional / Falta Operador)', icone: Pause, cor: 'border-purple-500/50 text-purple-300 bg-purple-950/40' },
    { valor: 'Problema mecânico', rotulo: 'Problema Mecânico', icone: Wrench, cor: 'border-red-500/50 text-red-300 bg-red-950/40' },
    { valor: 'Limpeza total', rotulo: 'Limpeza Total', icone: Sparkles, cor: 'border-blue-500/50 text-blue-300 bg-blue-950/40' },
    { valor: 'Aguardando manipulação', rotulo: 'Aguardando Manipulação', icone: Hourglass, cor: 'border-amber-400/50 text-amber-300 bg-amber-950/40' },
    { valor: 'Outro', rotulo: 'Outro Motivo', icone: HelpCircle, cor: 'border-neutral-500/50 text-neutral-300 bg-neutral-900' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={aoFechar}
    >
      <div
        className="bg-[#181818] border border-white/15 rounded-lg max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#141414]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                {paradaParaEditar ? 'Editar Parada de Produção' : 'Registrar Parada do Lote'}
              </h3>
              <p className="text-[11px] text-white/50 font-mono">
                {maquina.nome} • {maquina.produtoAtualNome || 'Lote Ativo'}
              </p>
            </div>
          </div>
          <button
            onClick={aoFechar}
            className="text-white/40 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informações do Lote em Andamento */}
        <div className="bg-[#101010] px-5 py-2.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/40 uppercase font-bold">Lote:</span>
            <span className="font-mono text-[#FFD100] font-bold">
              {maquina.numeroLote || 'N/I'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/40 uppercase font-bold">Início do Lote:</span>
            <span className="font-mono text-white/80">
              {maquina.dataInicio || 'Hoje'} às {maquina.horaInicio || '00:00'}
            </span>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {erro && (
            <div className="p-3 rounded bg-red-950/70 border border-red-500/60 text-red-200 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-tight">{erro}</span>
            </div>
          )}

          {/* Motivo da Parada */}
          <div>
            <label className="block text-white/60 text-[10px] uppercase font-bold tracking-wider mb-2">
              Motivo da Parada <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {motivosDisponiveis.map((item) => {
                const Icone = item.icone;
                const selecionado = motivo === item.valor;
                return (
                  <button
                    key={item.valor}
                    type="button"
                    onClick={() => setMotivo(item.valor)}
                    className={`p-2.5 rounded border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      selecionado
                        ? `${item.cor} ring-1 ring-white/30 font-bold shadow-md`
                        : 'border-white/10 bg-black/40 text-white/60 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <Icone className="w-4 h-4 shrink-0" />
                    <span className="truncate text-xs">{item.rotulo}</span>
                    {selecionado && <Check className="w-3.5 h-3.5 ml-auto text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Horário de Início (com data selecionável para viradas de turno) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-white/60 text-[10px] uppercase font-bold tracking-wider">
                Início da Parada (Data e Hora) <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleDefinirInicioLote}
                  className="text-[10px] text-white/50 hover:text-[#FFD100] px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 font-mono transition-colors"
                  title="Definir início da parada igual ao horário de início do lote"
                >
                  Início Lote
                </button>
                <button
                  type="button"
                  onClick={handleDefinirInicioAgora}
                  className="text-[10px] text-white/50 hover:text-[#FFD100] px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 font-mono transition-colors"
                  title="Definir início da parada como agora"
                >
                  Agora
                </button>
              </div>
            </div>
            <input
              type="datetime-local"
              id="input-parada-inicio"
              value={inicioStr}
              onChange={(e) => setInicioStr(e.target.value)}
              className="w-full bg-black/60 border border-white/15 rounded px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#FFD100] transition-colors"
              required
            />
            <p className="text-[10px] text-white/40 mt-1">
              Pode ser qualquer momento retroativo a partir do início do lote ({maquina.dataInicio || 'Hoje'} às {maquina.horaInicio}).
            </p>
          </div>

          {/* Horário de Término (Opcional se em andamento) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-white/60 text-[10px] uppercase font-bold tracking-wider">
                Término da Parada (Data e Hora)
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleDefinirFimAgora}
                  className="text-[10px] text-white/50 hover:text-[#FFD100] px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 font-mono transition-colors"
                >
                  Agora
                </button>
                {fimStr && (
                  <button
                    type="button"
                    onClick={handleLimparFim}
                    className="text-[10px] text-purple-400 hover:text-purple-300 px-1.5 py-0.5 rounded bg-purple-950/40 hover:bg-purple-900/60 font-mono transition-colors"
                    title="Deixar em andamento (vazio)"
                  >
                    Em andamento
                  </button>
                )}
              </div>
            </div>
            <input
              type="datetime-local"
              id="input-parada-fim"
              value={fimStr}
              onChange={(e) => setFimStr(e.target.value)}
              placeholder="Deixar em branco se ainda em andamento"
              className="w-full bg-black/60 border border-white/15 rounded px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#FFD100] transition-colors"
            />
            <p className="text-[10px] text-white/40 mt-1">
              {fimStr
                ? 'Parada finalizada no horário especificado.'
                : 'Deixe vazio se a parada ainda estiver em andamento (contará até o momento atual).'}
            </p>
          </div>

          {/* Estimativa de Tempo Parado */}
          {duracaoEstimadaMinutos > 0 && (
            <div className="p-2.5 rounded bg-black/40 border border-white/10 flex items-center justify-between font-mono text-xs">
              <span className="text-white/50 text-[10px] uppercase font-bold">Duração calculada da parada:</span>
              <span className="text-[#FFD100] font-black">
                {formatarMinutosParaTexto(duracaoEstimadaMinutos)}
                {!fimStr && ' (em andamento...)'}
              </span>
            </div>
          )}

          {/* Observações / Detalhes */}
          <div>
            <label className="block text-white/60 text-[10px] uppercase font-bold tracking-wider mb-1">
              Observações adicionais (opcional)
            </label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex: Falta de colaborador no turno da noite, aguardando liberação do CQ..."
              rows={2}
              className="w-full bg-black/60 border border-white/15 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFD100] transition-colors resize-none"
            />
          </div>

          {/* Rodapé e Ações */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
            {paradaParaEditar ? (
              <button
                type="button"
                onClick={handleExcluir}
                disabled={salvando}
                className="bg-red-950/60 hover:bg-red-900 border border-red-500/50 text-red-300 font-bold uppercase tracking-wider px-3 py-2 rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={aoFechar}
                disabled={salvando}
                className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-3.5 py-2 rounded font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="btn-salvar-parada"
                disabled={salvando}
                className="bg-[#FFD100] hover:bg-[#e6bd00] text-black font-black uppercase tracking-wider px-4 py-2 rounded text-xs flex items-center gap-1.5 shadow-md shadow-[#FFD100]/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{salvando ? 'Salvando...' : 'Salvar Parada'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
