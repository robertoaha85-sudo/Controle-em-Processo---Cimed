import { Maquina, Produto, MembroEquipe } from './types';

export const PRODUTOS_INICIAIS: Produto[] = [
  // Semissólidos — Linha NORDEN I
  { id: 'p-nord1-01', nome: 'CETO + NEOMICINA + BETA CREM BG 30G', setor: 'semissolidos', linha: 'NORDEN I', tempoEnvaseMinutos: 375 },
  { id: 'p-nord1-02', nome: 'CETOCONAZOL 20MG/G CREM BG 30', setor: 'semissolidos', linha: 'NORDEN I', tempoEnvaseMinutos: 391 },
  { id: 'p-nord1-03', nome: 'ACICLOVIR 50MG/G CREM BG 10G', setor: 'semissolidos', linha: 'NORDEN I', tempoEnvaseMinutos: 1172 },
  { id: 'p-nord1-04', nome: 'NEBACIMED POM BG 15G', setor: 'semissolidos', linha: 'NORDEN I', tempoEnvaseMinutos: 765 },
  { id: 'p-nord1-05', nome: 'NEOMICINA + BACITRACINA POM BG 15G', setor: 'semissolidos', linha: 'NORDEN I', tempoEnvaseMinutos: 765 },
  { id: 'p-nord1-06', nome: 'NITRATO DE MICONAZOL CREM BG 28G', setor: 'semissolidos', linha: 'NORDEN I', tempoEnvaseMinutos: 422 },
  { id: 'p-nord1-07', nome: 'HEMOFISS POM 30G BG X 10 APLIC', setor: 'semissolidos', linha: 'NORDEN I', tempoEnvaseMinutos: 387 },
  { id: 'p-nord1-08', nome: 'HEMOFISS POM BG 30G C/1 APLIC', setor: 'semissolidos', linha: 'NORDEN I', tempoEnvaseMinutos: 387 },
  { id: 'p-nord1-09', nome: 'CIMECORT CREM BG 30G', setor: 'semissolidos', linha: 'NORDEN I', tempoEnvaseMinutos: 375 },
  { id: 'p-nord1-10', nome: 'CIMECORT CREM BG 15G', setor: 'semissolidos', linha: 'NORDEN I', tempoEnvaseMinutos: 750 },
  { id: 'p-nord1-11', nome: 'ACNEZIL 50MG/G GEL BG 20G', setor: 'semissolidos', linha: 'NORDEN I', tempoEnvaseMinutos: 578 },
  { id: 'p-nord1-12', nome: 'ALERGOMINE 10MG/G CREME BG 30G', setor: 'semissolidos', linha: 'NORDEN I', tempoEnvaseMinutos: 391 },
  { id: 'p-nord1-13', nome: 'MALEATO DE DEXCLOR 10MG CREME BG 30G', setor: 'semissolidos', linha: 'NORDEN I', tempoEnvaseMinutos: 391 },
  { id: 'p-nord1-14', nome: 'COLUJET 1MG/G PASTA BG 10G', setor: 'semissolidos', linha: 'NORDEN I', tempoEnvaseMinutos: 625 },
  { id: 'p-nord1-15', nome: 'LIDOPASS 50MG/G POM BG 25G', setor: 'semissolidos', linha: 'NORDEN I', tempoEnvaseMinutos: 469 },
  { id: 'p-nord1-16', nome: 'MEME CREM BG 50G', setor: 'semissolidos', linha: 'NORDEN I', tempoEnvaseMinutos: 235 },
  { id: 'p-nord1-17', nome: 'CETOCONAZOL 20MG/G CREM BG 30G OF', setor: 'semissolidos', linha: 'NORDEN I', tempoEnvaseMinutos: 391 },

  // Semissólidos — Linha NORDEN II
  { id: 'p-nord2-01', nome: 'BEPANTRIZ 50MG/G POM BG 30G', setor: 'semissolidos', linha: 'NORDEN II', tempoEnvaseMinutos: 436 },
  { id: 'p-nord2-02', nome: 'DICLOF DIETILAMONIO 11,6 MG/G GEL', setor: 'semissolidos', linha: 'NORDEN II', tempoEnvaseMinutos: 375 },
  { id: 'p-nord2-03', nome: 'DICLOF DIETILAMONIO 11,6 MG/G GEL (variação)', setor: 'semissolidos', linha: 'NORDEN II', tempoEnvaseMinutos: 225 },
  { id: 'p-nord2-04', nome: 'PROBENXIL 11,6 MG/G GEL BG 60G', setor: 'semissolidos', linha: 'NORDEN II', tempoEnvaseMinutos: 225 },
  { id: 'p-nord2-05', nome: 'K-MED GEL BG 25G', setor: 'semissolidos', linha: 'NORDEN II', tempoEnvaseMinutos: 390 },

  // Semissólidos — Linha NORDEN III
  { id: 'p-nord3-01', nome: 'BABYMED ROSA POM BG 45G', setor: 'semissolidos', linha: 'NORDEN III', tempoEnvaseMinutos: 436 },
  { id: 'p-nord3-02', nome: 'BABYMED AZUL POM BG 45G', setor: 'semissolidos', linha: 'NORDEN III', tempoEnvaseMinutos: 436 },

  // Semissólidos — Linha NORDEN IV
  { id: 'p-nord4-01', nome: 'BABYMED ROSA POM BG 45G', setor: 'semissolidos', linha: 'NORDEN IV', tempoEnvaseMinutos: 436 },
  { id: 'p-nord4-02', nome: 'BABYMED AZUL POM BG 45G', setor: 'semissolidos', linha: 'NORDEN IV', tempoEnvaseMinutos: 436 },

  // Líquidos — Linhas CAM, Gotas, Xarope, Externo, Epativan
  { id: 'p-liq-cam-01', nome: 'LAVITAN VITAMINA C SOL ORAL 100ML', setor: 'liquidos', linha: 'CAM', tempoEnvaseMinutos: 350 },
  { id: 'p-liq-cam-02', nome: 'SORIMAX SOLUCAO NASAL 30ML', setor: 'liquidos', linha: 'CAM', tempoEnvaseMinutos: 290 },
  { id: 'p-liq-got-01', nome: 'DIPIRONA SODICA 500MG/ML GTS 20ML', setor: 'liquidos', linha: 'Gotas', tempoEnvaseMinutos: 240 },
  { id: 'p-liq-got-02', nome: 'PARACETAMOL 200MG/ML GTS 15ML', setor: 'liquidos', linha: 'Gotas', tempoEnvaseMinutos: 280 },
  { id: 'p-liq-xpe-01', nome: 'CIMELGIV XAROPE ADULTO 120ML', setor: 'liquidos', linha: 'Xarope', tempoEnvaseMinutos: 360 },
  { id: 'p-liq-xpe-02', nome: 'AMBROXOL 30MG/5ML XPE 120ML', setor: 'liquidos', linha: 'Xarope', tempoEnvaseMinutos: 320 },
  { id: 'p-liq-ext-01', nome: 'POVIDINE TINTURA TOPICA 100ML', setor: 'liquidos', linha: 'Externo', tempoEnvaseMinutos: 300 },
  { id: 'p-liq-ext-02', nome: 'ALCOOL ETILICO 70% FR 100ML', setor: 'liquidos', linha: 'Externo', tempoEnvaseMinutos: 250 },
  { id: 'p-liq-epa-01', nome: 'EPATIVAN FLACONETE 10ML C/60', setor: 'liquidos', linha: 'Epativan', tempoEnvaseMinutos: 420 },
  { id: 'p-liq-epa-02', nome: 'EPATIVAN ABACAXI DISPLAY 10ML', setor: 'liquidos', linha: 'Epativan', tempoEnvaseMinutos: 400 },
];

export const MAQUINAS_INICIAIS: Maquina[] = [
  // Setor Semissólidos — 4 máquinas (Norden I, Norden II, Norden III, Norden IV)
  {
    id: 'm-semi-norden-1',
    nome: 'Norden I',
    setor: 'semissolidos',
    linhaPadrao: 'NORDEN I',
    status: 'livre',
  },
  {
    id: 'm-semi-norden-2',
    nome: 'Norden II',
    setor: 'semissolidos',
    linhaPadrao: 'NORDEN II',
    status: 'livre',
  },
  {
    id: 'm-semi-norden-3',
    nome: 'Norden III',
    setor: 'semissolidos',
    linhaPadrao: 'NORDEN III',
    status: 'livre',
  },
  {
    id: 'm-semi-norden-4',
    nome: 'Norden IV',
    setor: 'semissolidos',
    linhaPadrao: 'NORDEN IV',
    status: 'livre',
  },

  // Setor Líquidos — 5 máquinas (CAM, Gotas, Xarope, Externo, Epativan)
  {
    id: 'm-liq-cam',
    nome: 'CAM',
    setor: 'liquidos',
    linhaPadrao: 'CAM',
    status: 'livre',
  },
  {
    id: 'm-liq-gotas',
    nome: 'Gotas',
    setor: 'liquidos',
    linhaPadrao: 'Gotas',
    status: 'livre',
  },
  {
    id: 'm-liq-xarope',
    nome: 'Xarope',
    setor: 'liquidos',
    linhaPadrao: 'Xarope',
    status: 'livre',
  },
  {
    id: 'm-liq-externo',
    nome: 'Externo',
    setor: 'liquidos',
    linhaPadrao: 'Externo',
    status: 'livre',
  },
  {
    id: 'm-liq-epativan',
    nome: 'Epativan',
    setor: 'liquidos',
    linhaPadrao: 'Epativan',
    status: 'livre',
  },
];

export const EQUIPES_INICIAIS: MembroEquipe[] = [
  // Semissólidos
  { id: 'eq-sem-1-1', setor: 'semissolidos', turno: '1º turno', cargo: 'Coordenador da área', nome: '(a definir)', email: '(a definir)' },
  { id: 'eq-sem-1-2', setor: 'semissolidos', turno: '1º turno', cargo: 'Supervisor', nome: 'Anisio Vitor Barbosa Santos', email: 'anisio.silva@grupocimed.com.br' },
  { id: 'eq-sem-2-1', setor: 'semissolidos', turno: '2º turno', cargo: 'Supervisora', nome: 'Vitória Renata da Silva', email: 'vitória.renata@grupocimed.com.br' },
  { id: 'eq-sem-3-1', setor: 'semissolidos', turno: '3º turno', cargo: 'Supervisor', nome: 'Lucas da Silva Mariano', email: 'lucas.mariano@grupocimed.com.br' },

  // Líquidos
  { id: 'eq-liq-geral', setor: 'liquidos', turno: 'Geral', cargo: 'Coordenador da área', nome: 'Thales do Vale Silva', email: 'thales.silva@grupocimed.com.br' },
  { id: 'eq-liq-1-1', setor: 'liquidos', turno: '1º turno', cargo: 'Supervisor', nome: 'Emerson Beletato Pereira', email: 'emerson.pereira@grupocimed.com.br' },
  { id: 'eq-liq-2-1', setor: 'liquidos', turno: '2º turno', cargo: 'Supervisora', nome: 'Greice Mara Pereira de Pádua', email: 'greice.padua@grupocimed.com.br' },
  { id: 'eq-liq-3-1', setor: 'liquidos', turno: '3º turno', cargo: 'Supervisor', nome: '(a definir)', email: '(a definir)' },
];

// Utilitários de tempo
export function formatarMinutosParaTexto(minutos: number): string {
  if (isNaN(minutos) || minutos <= 0) return '0min';
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  if (horas === 0) return `${mins}min`;
  if (mins === 0) return `${horas}h`;
  return `${horas}h${mins < 10 ? '0' : ''}${mins}min`;
}

export function converterTextoParaMinutos(texto: string): number {
  if (!texto) return 0;
  const limpo = texto.toLowerCase().trim();

  // Caso seja formato HH:mm (ex: "06:15")
  if (limpo.includes(':')) {
    const [h, m] = limpo.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  // Caso seja formato 6h15min ou 6h 15min
  const matchHoras = limpo.match(/(\d+)\s*h/);
  const matchMins = limpo.match(/(\d+)\s*m/);

  let total = 0;
  if (matchHoras) total += parseInt(matchHoras[1], 10) * 60;
  if (matchMins) total += parseInt(matchMins[1], 10);

  if (!matchHoras && !matchMins) {
    const num = parseInt(limpo, 10);
    if (!isNaN(num)) return num; // Assume minutos
  }

  return total;
}

// Calcula previsão de término a partir de horaInicio (HH:mm) e minutos
export function calcularPrevisaoTermino(horaInicio: string, minutosAdicionar: number): string {
  if (!horaInicio) return '';
  const [h, m] = horaInicio.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return '';

  const totalInicio = h * 60 + m;
  const totalFim = (totalInicio + minutosAdicionar) % (24 * 60);
  const horasFim = Math.floor(totalFim / 60);
  const minsFim = totalFim % 60;

  return `${String(horasFim).padStart(2, '0')}:${String(minsFim).padStart(2, '0')}`;
}
