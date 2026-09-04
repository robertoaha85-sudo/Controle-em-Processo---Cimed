// Utilitário de áudio sintetizado para alarmes industriais usando Web Audio API
let audioCtx: AudioContext | null = null;
let soundEnabled = true;

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem('cimed_sound_enabled', enabled ? 'true' : 'false');
  }
}

export function isSoundEnabled(): boolean {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('cimed_sound_enabled');
    if (saved !== null) return saved === 'true';
  }
  return soundEnabled;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Alarme de máquina em problema mecânico (dois beeps de alerta industrial)
export function tocarAlarmeProblemaMecanico() {
  if (!isSoundEnabled()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const agora = ctx.currentTime;

    // Beep 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(880, agora); // Lá 5
    gain1.gain.setValueAtTime(0.15, agora);
    gain1.gain.exponentialRampToValueAtTime(0.01, agora + 0.18);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(agora);
    osc1.stop(agora + 0.2);

    // Beep 2 (tom mais alto e urgente)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(1174.66, agora + 0.22); // Ré 6
    gain2.gain.setValueAtTime(0.2, agora + 0.22);
    gain2.gain.exponentialRampToValueAtTime(0.01, agora + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(agora + 0.22);
    osc2.stop(agora + 0.48);
  } catch (err) {
    console.warn('Não foi possível reproduzir som de alerta:', err);
  }
}

// Som suave de confirmação (lote iniciado ou finalizado)
export function tocarSomSucesso() {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const agora = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, agora); // Dó 5
    osc.frequency.exponentialRampToValueAtTime(659.25, agora + 0.15); // Mi 5
    gain.gain.setValueAtTime(0.1, agora);
    gain.gain.exponentialRampToValueAtTime(0.001, agora + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(agora);
    osc.stop(agora + 0.26);
  } catch {}
}
