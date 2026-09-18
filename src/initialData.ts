import { Maquina, Produto, MembroEquipe, Setor } from './types';

export const PRODUTOS_INICIAIS: Produto[] = [
  // ==========================================
  // SEMISSÓLIDOS (Norden 1, Norden 2, Norden 3, Norden 4)
  // ==========================================
  // --- NORDENS 1 & NORDENS 2 ---
  {
    id: 'p-semi-100003',
    codigo: '100003',
    nome: 'ACICLOVIR 50MG/G CREM BG 10G',
    setor: 'semissolidos',
    linha: 'NORDEN I / NORDEN II',
    tempoEnvaseMinutos: 1020, // 17h em Norden 1
    vinculos: [
      { linhaOuMaquina: 'Norden 1', tempoEnvaseMinutos: 1020 },
      { linhaOuMaquina: 'Norden 2', tempoEnvaseMinutos: 571 },
    ],
    temposPorMaquina: {
      'Norden I': 1020,
      'Norden 1': 1020,
      'Nordens 1': 1020,
      'NORDEN I': 1020,
      'm-semi-norden-1': 1020,
      'Norden II': 571,
      'Norden 2': 571,
      'Nordens 2': 571,
      'NORDEN II': 571,
      'm-semi-norden-2': 571,
    },
  },
  {
    id: 'p-semi-100006',
    codigo: '100006',
    nome: 'ACNEZIL 50 MG/G GEL BG 20G',
    setor: 'semissolidos',
    linha: 'NORDEN I / NORDEN II',
    tempoEnvaseMinutos: 480, // 8h em Norden 1
    vinculos: [
      { linhaOuMaquina: 'Norden 1', tempoEnvaseMinutos: 480 },
      { linhaOuMaquina: 'Norden 2', tempoEnvaseMinutos: 282 },
    ],
    temposPorMaquina: {
      'Norden I': 480,
      'Norden 1': 480,
      'Nordens 1': 480,
      'NORDEN I': 480,
      'm-semi-norden-1': 480,
      'Norden II': 282,
      'Norden 2': 282,
      'Nordens 2': 282,
      'NORDEN II': 282,
      'm-semi-norden-2': 282,
    },
  },
  {
    id: 'p-semi-100008',
    codigo: '100008',
    nome: 'ALERGOMINE 10MG/G CREM BG 30G',
    setor: 'semissolidos',
    linha: 'NORDEN I / NORDEN II',
    tempoEnvaseMinutos: 360, // 6h em Norden 1
    vinculos: [
      { linhaOuMaquina: 'Norden 1', tempoEnvaseMinutos: 360 },
      { linhaOuMaquina: 'Norden 2', tempoEnvaseMinutos: 196 },
    ],
    temposPorMaquina: {
      'Norden I': 360,
      'Norden 1': 360,
      'Nordens 1': 360,
      'NORDEN I': 360,
      'm-semi-norden-1': 360,
      'Norden II': 196,
      'Norden 2': 196,
      'Nordens 2': 196,
      'NORDEN II': 196,
      'm-semi-norden-2': 196,
    },
  },
  {
    id: 'p-semi-100031',
    codigo: '100031',
    nome: 'BEPANTRIZ 50 MG/G POM BG 30 G',
    setor: 'semissolidos',
    linha: 'NORDEN I / NORDEN II',
    tempoEnvaseMinutos: 678, // 11,30h em Norden 1 (11h18m)
    vinculos: [
      { linhaOuMaquina: 'Norden 1', tempoEnvaseMinutos: 678 },
      { linhaOuMaquina: 'Norden 2', tempoEnvaseMinutos: 196 },
    ],
    temposPorMaquina: {
      'Norden I': 678,
      'Norden 1': 678,
      'Nordens 1': 678,
      'NORDEN I': 678,
      'm-semi-norden-1': 678,
      'Norden II': 196,
      'Norden 2': 196,
      'Nordens 2': 196,
      'NORDEN II': 196,
      'm-semi-norden-2': 196,
    },
  },
  {
    id: 'p-semi-100086',
    codigo: '100086',
    nome: 'COLUJET 1MG/G PASTA BG 10G',
    setor: 'semissolidos',
    linha: 'NORDEN I',
    tempoEnvaseMinutos: 900, // 15h em Norden 1
    vinculos: [{ linhaOuMaquina: 'Norden 1', tempoEnvaseMinutos: 900 }],
    temposPorMaquina: {
      'Norden I': 900,
      'Norden 1': 900,
      'Nordens 1': 900,
      'NORDEN I': 900,
      'm-semi-norden-1': 900,
    },
  },
  {
    id: 'p-semi-100176',
    codigo: '100176',
    nome: 'NEBACIMED POM BG 15 G',
    setor: 'semissolidos',
    linha: 'NORDEN I / NORDEN II',
    tempoEnvaseMinutos: 780, // 13h em Norden 1
    vinculos: [
      { linhaOuMaquina: 'Norden 1', tempoEnvaseMinutos: 780 },
      { linhaOuMaquina: 'Norden 2', tempoEnvaseMinutos: 395 },
    ],
    temposPorMaquina: {
      'Norden I': 780,
      'Norden 1': 780,
      'Nordens 1': 780,
      'NORDEN I': 780,
      'm-semi-norden-1': 780,
      'Norden II': 395,
      'Norden 2': 395,
      'Nordens 2': 395,
      'NORDEN II': 395,
      'm-semi-norden-2': 395,
    },
  },
  {
    id: 'p-semi-100179',
    codigo: '100179',
    nome: 'NEOMICINA+BACITRACINA POM BG 15 G',
    setor: 'semissolidos',
    linha: 'NORDEN I / NORDEN II',
    tempoEnvaseMinutos: 780, // 13h em Norden 1
    vinculos: [
      { linhaOuMaquina: 'Norden 1', tempoEnvaseMinutos: 780 },
      { linhaOuMaquina: 'Norden 2', tempoEnvaseMinutos: 395 },
    ],
    temposPorMaquina: {
      'Norden I': 780,
      'Norden 1': 780,
      'Nordens 1': 780,
      'NORDEN I': 780,
      'm-semi-norden-1': 780,
      'Norden II': 395,
      'Norden 2': 395,
      'Nordens 2': 395,
      'NORDEN II': 395,
      'm-semi-norden-2': 395,
    },
  },
  {
    id: 'p-semi-100367',
    codigo: '100367',
    nome: 'HEMOFISS POM BG 30 G C/ 1 APLIC',
    setor: 'semissolidos',
    linha: 'NORDEN I / NORDEN II',
    tempoEnvaseMinutos: 360, // 6h em Norden 1 e Norden 2
    vinculos: [
      { linhaOuMaquina: 'Norden 1', tempoEnvaseMinutos: 360 },
      { linhaOuMaquina: 'Norden 2', tempoEnvaseMinutos: 360 },
    ],
    temposPorMaquina: {
      'Norden I': 360,
      'Norden 1': 360,
      'Nordens 1': 360,
      'NORDEN I': 360,
      'm-semi-norden-1': 360,
      'Norden II': 360,
      'Norden 2': 360,
      'Nordens 2': 360,
      'NORDEN II': 360,
      'm-semi-norden-2': 360,
    },
  },
  {
    id: 'p-semi-103304',
    codigo: '103304',
    nome: 'HEMOFISS POM 30 G BG X 10 APLIC',
    setor: 'semissolidos',
    linha: 'NORDEN I / NORDEN II',
    tempoEnvaseMinutos: 360, // 6h em Norden 1 e Norden 2
    vinculos: [
      { linhaOuMaquina: 'Norden 1', tempoEnvaseMinutos: 360 },
      { linhaOuMaquina: 'Norden 2', tempoEnvaseMinutos: 360 },
    ],
    temposPorMaquina: {
      'Norden I': 360,
      'Norden 1': 360,
      'Nordens 1': 360,
      'NORDEN I': 360,
      'm-semi-norden-1': 360,
      'Norden II': 360,
      'Norden 2': 360,
      'Nordens 2': 360,
      'NORDEN II': 360,
      'm-semi-norden-2': 360,
    },
  },
  {
    id: 'p-semi-103715',
    codigo: '103715',
    nome: 'NITRATO DE MICONAZOL 20MG/G CREME BG 28G',
    setor: 'semissolidos',
    linha: 'NORDEN I / NORDEN II',
    tempoEnvaseMinutos: 360, // 6h em Norden 1, 3,5h (210 min) em Norden 2
    vinculos: [
      { linhaOuMaquina: 'Norden 1', tempoEnvaseMinutos: 360 },
      { linhaOuMaquina: 'Norden 2', tempoEnvaseMinutos: 210 },
    ],
    temposPorMaquina: {
      'Norden I': 360,
      'Norden 1': 360,
      'Nordens 1': 360,
      'NORDEN I': 360,
      'm-semi-norden-1': 360,
      'Norden II': 210,
      'Norden 2': 210,
      'Nordens 2': 210,
      'NORDEN II': 210,
      'm-semi-norden-2': 210,
    },
  },
  {
    id: 'p-semi-103731',
    codigo: '103731',
    nome: 'CETOCONAZOL 20MG/G CREM BG 30',
    setor: 'semissolidos',
    linha: 'NORDEN I / NORDEN II',
    tempoEnvaseMinutos: 420, // 7h em Norden 1, 3,26h (196 min) em Norden 2
    vinculos: [
      { linhaOuMaquina: 'Norden 1', tempoEnvaseMinutos: 420 },
      { linhaOuMaquina: 'Norden 2', tempoEnvaseMinutos: 196 },
    ],
    temposPorMaquina: {
      'Norden I': 420,
      'Norden 1': 420,
      'Nordens 1': 420,
      'NORDEN I': 420,
      'm-semi-norden-1': 420,
      'Norden II': 196,
      'Norden 2': 196,
      'Nordens 2': 196,
      'NORDEN II': 196,
      'm-semi-norden-2': 196,
    },
  },
  {
    id: 'p-semi-105174',
    codigo: '105174',
    nome: 'KIT BEPANTRIZ 50 MG/G POM 3 BG X 30 G',
    setor: 'semissolidos',
    linha: 'NORDEN I',
    tempoEnvaseMinutos: 350, // 5,83h em Norden 1 (350 min)
    vinculos: [{ linhaOuMaquina: 'Norden 1', tempoEnvaseMinutos: 350 }],
    temposPorMaquina: {
      'Norden I': 350,
      'Norden 1': 350,
      'Nordens 1': 350,
      'NORDEN I': 350,
      'm-semi-norden-1': 350,
    },
  },

  // --- NORDENS 3 & NORDENS 4 ---
  {
    id: 'p-semi-100027',
    codigo: '100027',
    nome: 'BABYMED ROSA POM BG 45 G',
    setor: 'semissolidos',
    linha: 'NORDEN III / NORDEN IV',
    tempoEnvaseMinutos: 360, // 6h em Norden 3 e Norden 4
    vinculos: [
      { linhaOuMaquina: 'Norden 3', tempoEnvaseMinutos: 360 },
      { linhaOuMaquina: 'Norden 4', tempoEnvaseMinutos: 360 },
    ],
    temposPorMaquina: {
      'Norden III': 360,
      'Norden 3': 360,
      'Nordens 3': 360,
      'NORDEN III': 360,
      'm-semi-norden-3': 360,
      'Norden IV': 360,
      'Norden 4': 360,
      'Nordens 4': 360,
      'NORDEN IV': 360,
      'm-semi-norden-4': 360,
    },
  },
  {
    id: 'p-semi-101700',
    codigo: '101700',
    nome: 'BABYMED AZUL POM BG 45 G',
    setor: 'semissolidos',
    linha: 'NORDEN III / NORDEN IV',
    tempoEnvaseMinutos: 360, // 6h em Norden 3 e Norden 4
    vinculos: [
      { linhaOuMaquina: 'Norden 3', tempoEnvaseMinutos: 360 },
      { linhaOuMaquina: 'Norden 4', tempoEnvaseMinutos: 360 },
    ],
    temposPorMaquina: {
      'Norden III': 360,
      'Norden 3': 360,
      'Nordens 3': 360,
      'NORDEN III': 360,
      'm-semi-norden-3': 360,
      'Norden IV': 360,
      'Norden 4': 360,
      'Nordens 4': 360,
      'NORDEN IV': 360,
      'm-semi-norden-4': 360,
    },
  },
  {
    id: 'p-semi-103156',
    codigo: '103156',
    nome: 'BABYMED ROSA POM BG 45G HOSP',
    setor: 'semissolidos',
    linha: 'NORDEN III / NORDEN IV',
    tempoEnvaseMinutos: 360, // 6h em Norden 3 e Norden 4
    vinculos: [
      { linhaOuMaquina: 'Norden 3', tempoEnvaseMinutos: 360 },
      { linhaOuMaquina: 'Norden 4', tempoEnvaseMinutos: 360 },
    ],
    temposPorMaquina: {
      'Norden III': 360,
      'Norden 3': 360,
      'Nordens 3': 360,
      'NORDEN III': 360,
      'm-semi-norden-3': 360,
      'Norden IV': 360,
      'Norden 4': 360,
      'Nordens 4': 360,
      'NORDEN IV': 360,
      'm-semi-norden-4': 360,
    },
  },
  {
    id: 'p-semi-103784',
    codigo: '103784',
    nome: 'BABYMED POM BG 45 G LICITACAO',
    setor: 'semissolidos',
    linha: 'NORDEN III / NORDEN IV',
    tempoEnvaseMinutos: 360, // 6h em Norden 3 e Norden 4
    vinculos: [
      { linhaOuMaquina: 'Norden 3', tempoEnvaseMinutos: 360 },
      { linhaOuMaquina: 'Norden 4', tempoEnvaseMinutos: 360 },
    ],
    temposPorMaquina: {
      'Norden III': 360,
      'Norden 3': 360,
      'Nordens 3': 360,
      'NORDEN III': 360,
      'm-semi-norden-3': 360,
      'Norden IV': 360,
      'Norden 4': 360,
      'Nordens 4': 360,
      'NORDEN IV': 360,
      'm-semi-norden-4': 360,
    },
  },
  {
    id: 'p-semi-100065',
    codigo: '100065',
    nome: 'CIMECORT CREM BG 15G',
    setor: 'semissolidos',
    linha: 'NORDEN III / NORDEN IV',
    tempoEnvaseMinutos: 1200, // 20h em Norden 3 e Norden 4
    vinculos: [
      { linhaOuMaquina: 'Norden 3', tempoEnvaseMinutos: 1200 },
      { linhaOuMaquina: 'Norden 4', tempoEnvaseMinutos: 1200 },
    ],
    temposPorMaquina: {
      'Norden III': 1200,
      'Norden 3': 1200,
      'Nordens 3': 1200,
      'NORDEN III': 1200,
      'm-semi-norden-3': 1200,
      'Norden IV': 1200,
      'Norden 4': 1200,
      'Nordens 4': 1200,
      'NORDEN IV': 1200,
      'm-semi-norden-4': 1200,
    },
  },
  {
    id: 'p-semi-100066',
    codigo: '100066',
    nome: 'CIMECORT CREM BG 30G',
    setor: 'semissolidos',
    linha: 'NORDEN III / NORDEN IV',
    tempoEnvaseMinutos: 600, // 10h em Norden 3 e Norden 4
    vinculos: [
      { linhaOuMaquina: 'Norden 3', tempoEnvaseMinutos: 600 },
      { linhaOuMaquina: 'Norden 4', tempoEnvaseMinutos: 600 },
    ],
    temposPorMaquina: {
      'Norden III': 600,
      'Norden 3': 600,
      'Nordens 3': 600,
      'NORDEN III': 600,
      'm-semi-norden-3': 600,
      'Norden IV': 600,
      'Norden 4': 600,
      'Nordens 4': 600,
      'NORDEN IV': 600,
      'm-semi-norden-4': 600,
    },
  },
  {
    id: 'p-semi-100093',
    codigo: '100093',
    nome: 'DICLOF DIETILAMONIO 11,6 MG/G GEL BG 60G',
    setor: 'semissolidos',
    linha: 'NORDEN III / NORDEN IV',
    tempoEnvaseMinutos: 258, // 4,3h em Norden 3 e Norden 4 (258 min)
    vinculos: [
      { linhaOuMaquina: 'Norden 3', tempoEnvaseMinutos: 258 },
      { linhaOuMaquina: 'Norden 4', tempoEnvaseMinutos: 258 },
    ],
    temposPorMaquina: {
      'Norden III': 258,
      'Norden 3': 258,
      'Nordens 3': 258,
      'NORDEN III': 258,
      'm-semi-norden-3': 258,
      'Norden IV': 258,
      'Norden 4': 258,
      'Nordens 4': 258,
      'NORDEN IV': 258,
      'm-semi-norden-4': 258,
    },
  },
  {
    id: 'p-semi-100146',
    codigo: '100146',
    nome: 'K-MED GEL BG 25 G',
    setor: 'semissolidos',
    linha: 'NORDEN III / NORDEN IV',
    tempoEnvaseMinutos: 300, // 5h em Norden 3 e Norden 4
    vinculos: [
      { linhaOuMaquina: 'Norden 3', tempoEnvaseMinutos: 300 },
      { linhaOuMaquina: 'Norden 4', tempoEnvaseMinutos: 300 },
    ],
    temposPorMaquina: {
      'Norden III': 300,
      'Norden 3': 300,
      'Nordens 3': 300,
      'NORDEN III': 300,
      'm-semi-norden-3': 300,
      'Norden IV': 300,
      'Norden 4': 300,
      'Nordens 4': 300,
      'NORDEN IV': 300,
      'm-semi-norden-4': 300,
    },
  },
  {
    id: 'p-semi-100147',
    codigo: '100147',
    nome: 'K-MED GEL BG 50 G',
    setor: 'semissolidos',
    linha: 'NORDEN III / NORDEN IV',
    tempoEnvaseMinutos: 360, // 6h em Norden 3 e Norden 4
    vinculos: [
      { linhaOuMaquina: 'Norden 3', tempoEnvaseMinutos: 360 },
      { linhaOuMaquina: 'Norden 4', tempoEnvaseMinutos: 360 },
    ],
    temposPorMaquina: {
      'Norden III': 360,
      'Norden 3': 360,
      'Nordens 3': 360,
      'NORDEN III': 360,
      'm-semi-norden-3': 360,
      'Norden IV': 360,
      'Norden 4': 360,
      'Nordens 4': 360,
      'NORDEN IV': 360,
      'm-semi-norden-4': 360,
    },
  },
  {
    id: 'p-semi-101575',
    codigo: '101575',
    nome: 'K-MED GEL BG 100 G',
    setor: 'semissolidos',
    linha: 'NORDEN III / NORDEN IV',
    tempoEnvaseMinutos: 198, // 3,3h em Norden 3 e Norden 4 (198 min)
    vinculos: [
      { linhaOuMaquina: 'Norden 3', tempoEnvaseMinutos: 198 },
      { linhaOuMaquina: 'Norden 4', tempoEnvaseMinutos: 198 },
    ],
    temposPorMaquina: {
      'Norden III': 198,
      'Norden 3': 198,
      'Nordens 3': 198,
      'NORDEN III': 198,
      'm-semi-norden-3': 198,
      'Norden IV': 198,
      'Norden 4': 198,
      'Nordens 4': 198,
      'NORDEN IV': 198,
      'm-semi-norden-4': 198,
    },
  },
  {
    id: 'p-semi-103157',
    codigo: '103157',
    nome: 'LUBRIFIK LUBRIFICANTE INTIMO GEL BG 50G',
    setor: 'semissolidos',
    linha: 'NORDEN III / NORDEN IV',
    tempoEnvaseMinutos: 360, // 6h em Norden 3 e Norden 4
    vinculos: [
      { linhaOuMaquina: 'Norden 3', tempoEnvaseMinutos: 360 },
      { linhaOuMaquina: 'Norden 4', tempoEnvaseMinutos: 360 },
    ],
    temposPorMaquina: {
      'Norden III': 360,
      'Norden 3': 360,
      'Nordens 3': 360,
      'NORDEN III': 360,
      'm-semi-norden-3': 360,
      'Norden IV': 360,
      'Norden 4': 360,
      'Nordens 4': 360,
      'NORDEN IV': 360,
      'm-semi-norden-4': 360,
    },
  },
  {
    id: 'p-semi-100784',
    codigo: '100784',
    nome: 'CETO + NEOMICINA + BETA CREM BG 30G',
    setor: 'semissolidos',
    linha: 'NORDEN III / NORDEN IV',
    tempoEnvaseMinutos: 480, // 8,0h em Norden 3 e Norden 4
    vinculos: [
      { linhaOuMaquina: 'Norden 3', tempoEnvaseMinutos: 480 },
      { linhaOuMaquina: 'Norden 4', tempoEnvaseMinutos: 480 },
    ],
    temposPorMaquina: {
      'Norden III': 480,
      'Norden 3': 480,
      'Nordens 3': 480,
      'NORDEN III': 480,
      'm-semi-norden-3': 480,
      'Norden IV': 480,
      'Norden 4': 480,
      'Nordens 4': 480,
      'NORDEN IV': 480,
      'm-semi-norden-4': 480,
    },
  },
  {
    id: 'p-semi-102935',
    codigo: '102935',
    nome: 'NISTATINA + OXIDO DE ZINCO POM BG 60 G',
    setor: 'semissolidos',
    linha: 'NORDEN III / NORDEN IV',
    tempoEnvaseMinutos: 258, // 4,3h em Norden 3 e Norden 4 (258 min)
    vinculos: [
      { linhaOuMaquina: 'Norden 3', tempoEnvaseMinutos: 258 },
      { linhaOuMaquina: 'Norden 4', tempoEnvaseMinutos: 258 },
    ],
    temposPorMaquina: {
      'Norden III': 258,
      'Norden 3': 258,
      'Nordens 3': 258,
      'NORDEN III': 258,
      'm-semi-norden-3': 258,
      'Norden IV': 258,
      'Norden 4': 258,
      'Nordens 4': 258,
      'NORDEN IV': 258,
      'm-semi-norden-4': 258,
    },
  },
  {
    id: 'p-semi-104364',
    codigo: '104364',
    nome: 'NEVRALPRO 11,6 MG/G GEL BG 60 G',
    setor: 'semissolidos',
    linha: 'NORDEN III / NORDEN IV',
    tempoEnvaseMinutos: 420, // 7h em Norden 3 e Norden 4
    vinculos: [
      { linhaOuMaquina: 'Norden 3', tempoEnvaseMinutos: 420 },
      { linhaOuMaquina: 'Norden 4', tempoEnvaseMinutos: 420 },
    ],
    temposPorMaquina: {
      'Norden III': 420,
      'Norden 3': 420,
      'Nordens 3': 420,
      'NORDEN III': 420,
      'm-semi-norden-3': 420,
      'Norden IV': 420,
      'Norden 4': 420,
      'Nordens 4': 420,
      'NORDEN IV': 420,
      'm-semi-norden-4': 420,
    },
  },
  {
    id: 'p-semi-101236',
    codigo: '101236',
    nome: 'BABYMED AMENDOAS CREM BG X 40 G',
    setor: 'semissolidos',
    linha: 'NORDEN III / NORDEN IV',
    tempoEnvaseMinutos: 480, // 8h em Norden 3 e Norden 4
    vinculos: [
      { linhaOuMaquina: 'Norden 3', tempoEnvaseMinutos: 480 },
      { linhaOuMaquina: 'Norden 4', tempoEnvaseMinutos: 480 },
    ],
    temposPorMaquina: {
      'Norden III': 480,
      'Norden 3': 480,
      'Nordens 3': 480,
      'NORDEN III': 480,
      'm-semi-norden-3': 480,
      'Norden IV': 480,
      'Norden 4': 480,
      'Nordens 4': 480,
      'NORDEN IV': 480,
      'm-semi-norden-4': 480,
    },
  },

  // ==========================================
  // LÍQUIDOS (Xarope, Gotas, CAM, Externo, Epativan)
  // ==========================================
  {
    id: 'p-liq-100000',
    codigo: '100000',
    nome: 'ACEBROFILINA 50MG/5ML XPE FR 120ML',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 480,
    vinculos: [
      { linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 480 },
      { linhaOuMaquina: 'CAM', tempoEnvaseMinutos: 600 },
    ],
    temposPorMaquina: {
      'Xarope': 480,
      'm-liq-xarope': 480,
      'CAM': 600,
      'm-liq-cam': 600,
    },
  },
  {
    id: 'p-liq-100001',
    codigo: '100001',
    nome: 'ACEBROFILINA 25MG/5ML XPE FR 120ML',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 480,
    vinculos: [{ linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 480 }],
    temposPorMaquina: { 'Xarope': 480, 'm-liq-xarope': 480 },
  },
  {
    id: 'p-liq-100009',
    codigo: '100009',
    nome: 'ALERGOMINE 2 MG/5ML SOL OR FR 120 ML',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 494,
    vinculos: [{ linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 494 }],
    temposPorMaquina: { 'Xarope': 494, 'm-liq-xarope': 494 },
  },
  {
    id: 'p-liq-100012',
    codigo: '100012',
    nome: 'AMBROXMEL 6MG/ML XPE FR 120ML',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 400,
    vinculos: [
      { linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 400 },
      { linhaOuMaquina: 'CAM', tempoEnvaseMinutos: 533 },
    ],
    temposPorMaquina: {
      'Xarope': 400,
      'm-liq-xarope': 400,
      'CAM': 533,
      'm-liq-cam': 533,
    },
  },
  {
    id: 'p-liq-100013',
    codigo: '100013',
    nome: 'AMBROXMEL 3MG/ML XPE FR 120ML',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 397,
    vinculos: [
      { linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 397 },
      { linhaOuMaquina: 'CAM', tempoEnvaseMinutos: 529 },
    ],
    temposPorMaquina: {
      'Xarope': 397,
      'm-liq-xarope': 397,
      'CAM': 529,
      'm-liq-cam': 529,
    },
  },
  {
    id: 'p-liq-100060',
    codigo: '100060',
    nome: 'CIFLOGEX 1,5MG/ML COLUT SPR FR 30ML MEL',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 1426,
    vinculos: [
      { linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 1426 },
      { linhaOuMaquina: 'Externo', tempoEnvaseMinutos: 1901 },
    ],
    temposPorMaquina: {
      'Xarope': 1426,
      'm-liq-xarope': 1426,
      'Externo': 1901,
      'm-liq-externo': 1901,
    },
  },
  {
    id: 'p-liq-100062',
    codigo: '100062',
    nome: 'CIFLOGEX 1,5MG/ML COLUT SPR FR30ML MENTA',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 2376,
    vinculos: [
      { linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 2376 },
      { linhaOuMaquina: 'Externo', tempoEnvaseMinutos: 3169 },
    ],
    temposPorMaquina: {
      'Xarope': 2376,
      'm-liq-xarope': 2376,
      'Externo': 3169,
      'm-liq-externo': 3169,
    },
  },
  {
    id: 'p-liq-100072',
    codigo: '100072',
    nome: 'CIMEGRIPE SOL OR FR 20 ML',
    setor: 'liquidos',
    linha: 'Gotas',
    tempoEnvaseMinutos: 395,
    vinculos: [{ linhaOuMaquina: 'Gotas', tempoEnvaseMinutos: 395 }],
    temposPorMaquina: { 'Gotas': 395, 'm-liq-gotas': 395 },
  },
  {
    id: 'p-liq-100076',
    codigo: '100076',
    nome: 'CIMELIDE 50 MG/ML SUS OR FR 15 ML',
    setor: 'liquidos',
    linha: 'Gotas',
    tempoEnvaseMinutos: 1336,
    vinculos: [{ linhaOuMaquina: 'Gotas', tempoEnvaseMinutos: 1336 }],
    temposPorMaquina: { 'Gotas': 1336, 'm-liq-gotas': 1336 },
  },
  {
    id: 'p-liq-100077',
    codigo: '100077',
    nome: 'CL DE AMBROXOL 6MG/ML XPE FR 120ML',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 428,
    vinculos: [{ linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 428 }],
    temposPorMaquina: { 'Xarope': 428, 'm-liq-xarope': 428 },
  },
  {
    id: 'p-liq-100078',
    codigo: '100078',
    nome: 'CL DE AMBROXOL 3MG/ML XPE FR 120ML',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 428,
    vinculos: [{ linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 428 }],
    temposPorMaquina: { 'Xarope': 428, 'm-liq-xarope': 428 },
  },
  {
    id: 'p-liq-100089',
    codigo: '100089',
    nome: 'DEXCLOR + BETAMETASONA XPE FR 120 ML',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 428,
    vinculos: [
      { linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 428 },
      { linhaOuMaquina: 'CAM', tempoEnvaseMinutos: 480 },
    ],
    temposPorMaquina: {
      'Xarope': 428,
      'm-liq-xarope': 428,
      'CAM': 480,
      'm-liq-cam': 480,
    },
  },
  {
    id: 'p-liq-100091',
    codigo: '100091',
    nome: 'DEXMINE XPE FR 120 ML',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 428,
    vinculos: [
      { linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 428 },
      { linhaOuMaquina: 'CAM', tempoEnvaseMinutos: 533 },
    ],
    temposPorMaquina: {
      'Xarope': 428,
      'm-liq-xarope': 428,
      'CAM': 533,
      'm-liq-cam': 533,
    },
  },
  {
    id: 'p-liq-100118',
    codigo: '100118',
    nome: 'FRENOTOSSE 13,33 MG/ML XPE FR 120ML MEL',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 480,
    vinculos: [
      { linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 480 },
      { linhaOuMaquina: 'CAM', tempoEnvaseMinutos: 534 },
    ],
    temposPorMaquina: {
      'Xarope': 480,
      'm-liq-xarope': 480,
      'CAM': 534,
      'm-liq-cam': 534,
    },
  },
  {
    id: 'p-liq-100149',
    codigo: '100149',
    nome: 'KURAMED SOL TOP FR SPR 50 ML',
    setor: 'liquidos',
    linha: 'Externo',
    tempoEnvaseMinutos: 994,
    vinculos: [{ linhaOuMaquina: 'Externo', tempoEnvaseMinutos: 994 }],
    temposPorMaquina: { 'Externo': 994, 'm-liq-externo': 994 },
  },
  {
    id: 'p-liq-100155',
    codigo: '100155',
    nome: 'LORATADINA 1MG/ML XPE FR 100 ML',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 462,
    vinculos: [
      { linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 462 },
      { linhaOuMaquina: 'CAM', tempoEnvaseMinutos: 613 },
    ],
    temposPorMaquina: {
      'Xarope': 462,
      'm-liq-xarope': 462,
      'CAM': 613,
      'm-liq-cam': 613,
    },
  },
  {
    id: 'p-liq-100156',
    codigo: '100156',
    nome: 'LORATAMED 1MG/ML XPE 50FR X 100ML HOSP',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 460,
    vinculos: [
      { linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 460 },
      { linhaOuMaquina: 'CAM', tempoEnvaseMinutos: 613 },
    ],
    temposPorMaquina: {
      'Xarope': 460,
      'm-liq-xarope': 460,
      'CAM': 613,
      'm-liq-cam': 613,
    },
  },
  {
    id: 'p-liq-100158',
    codigo: '100158',
    nome: 'LORATAMED 1MG/ML XPE FR 100 ML',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 460,
    vinculos: [
      { linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 460 },
      { linhaOuMaquina: 'CAM', tempoEnvaseMinutos: 613 },
    ],
    temposPorMaquina: {
      'Xarope': 460,
      'm-liq-xarope': 460,
      'CAM': 613,
      'm-liq-cam': 613,
    },
  },
  {
    id: 'p-liq-100162',
    codigo: '100162',
    nome: 'MAGNAZIA SUS OR FR 240 ML',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 300,
    vinculos: [{ linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 300 }],
    temposPorMaquina: { 'Xarope': 300, 'm-liq-xarope': 300 },
  },
  {
    id: 'p-liq-100163',
    codigo: '100163',
    nome: 'MAL DEXCLORFENIRAMINA 2MG/5ML SOL OR FR',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 445,
    vinculos: [{ linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 445 }],
    temposPorMaquina: { 'Xarope': 445, 'm-liq-xarope': 445 },
  },
  {
    id: 'p-liq-100175',
    codigo: '100175',
    nome: 'NARIX 0,5MG/ML FR 30ML',
    setor: 'liquidos',
    linha: 'Gotas',
    tempoEnvaseMinutos: 657,
    vinculos: [{ linhaOuMaquina: 'Gotas', tempoEnvaseMinutos: 657 }],
    temposPorMaquina: { 'Gotas': 657, 'm-liq-gotas': 657 },
  },
  {
    id: 'p-liq-100185',
    codigo: '100185',
    nome: 'NIMESULIDA 50 MG/ML SUS OR FR 15 ML',
    setor: 'liquidos',
    linha: 'Gotas',
    tempoEnvaseMinutos: 1142,
    vinculos: [{ linhaOuMaquina: 'Gotas', tempoEnvaseMinutos: 1142 }],
    temposPorMaquina: { 'Gotas': 1142, 'm-liq-gotas': 1142 },
  },
  {
    id: 'p-liq-100199',
    codigo: '100199',
    nome: 'PEDILETAN 10MG/ML LOC FR 60ML',
    setor: 'liquidos',
    linha: 'Externo',
    tempoEnvaseMinutos: 800,
    vinculos: [{ linhaOuMaquina: 'Externo', tempoEnvaseMinutos: 800 }],
    temposPorMaquina: { 'Externo': 800, 'm-liq-externo': 800 },
  },
  {
    id: 'p-liq-100361',
    codigo: '100361',
    nome: 'DIMETIGASS 75 MG/ML EMU OR FR 15 ML',
    setor: 'liquidos',
    linha: 'Gotas',
    tempoEnvaseMinutos: 1247,
    vinculos: [{ linhaOuMaquina: 'Gotas', tempoEnvaseMinutos: 1247 }],
    temposPorMaquina: { 'Gotas': 1247, 'm-liq-gotas': 1247 },
  },
  {
    id: 'p-liq-100376',
    codigo: '100376',
    nome: 'SIMETICONA 75MG/ML EMU OR FR 15ML',
    setor: 'liquidos',
    linha: 'Gotas',
    tempoEnvaseMinutos: 1247,
    vinculos: [{ linhaOuMaquina: 'Gotas', tempoEnvaseMinutos: 1247 }],
    temposPorMaquina: { 'Gotas': 1247, 'm-liq-gotas': 1247 },
  },
  {
    id: 'p-liq-100427',
    codigo: '100427',
    nome: 'KURAMED SEPT SOL TOP FR 30 ML',
    setor: 'liquidos',
    linha: 'Externo',
    tempoEnvaseMinutos: 1600,
    vinculos: [{ linhaOuMaquina: 'Externo', tempoEnvaseMinutos: 1600 }],
    temposPorMaquina: { 'Externo': 1600, 'm-liq-externo': 1600 },
  },
  {
    id: 'p-liq-100584',
    codigo: '100584',
    nome: 'POWER VITA CRIANCA XPE FR 240ML PAG MEN',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 180,
    vinculos: [{ linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 180 }],
    temposPorMaquina: { 'Xarope': 180, 'm-liq-xarope': 180 },
  },
  {
    id: 'p-liq-101015',
    codigo: '101015',
    nome: 'ACEBROFILINA 50MG/5ML XPE 120ML HOSP',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 480,
    vinculos: [
      { linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 480 },
      { linhaOuMaquina: 'Externo', tempoEnvaseMinutos: 800 },
    ],
    temposPorMaquina: {
      'Xarope': 480,
      'm-liq-xarope': 480,
      'Externo': 800,
      'm-liq-externo': 800,
    },
  },
  {
    id: 'p-liq-101016',
    codigo: '101016',
    nome: 'ACEBROFILINA 25MG/5ML XPE 120ML HOSP',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 480,
    vinculos: [{ linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 480 }],
    temposPorMaquina: { 'Xarope': 480, 'm-liq-xarope': 480 },
  },
  {
    id: 'p-liq-101110',
    codigo: '101110',
    nome: 'MEGA DAY JUNIOR XPE FR 240ML GLOBO',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 180,
    vinculos: [{ linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 180 }],
    temposPorMaquina: { 'Xarope': 180, 'm-liq-xarope': 180 },
  },
  {
    id: 'p-liq-101430',
    codigo: '101430',
    nome: 'LAVITAN VIT INF SOL OR FR 240ML LAR',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 180,
    vinculos: [{ linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 180 }],
    temposPorMaquina: { 'Xarope': 180, 'm-liq-xarope': 180 },
  },
  {
    id: 'p-liq-102121',
    codigo: '102121',
    nome: 'OLEO MINERAL FR 100 ML',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 422,
    vinculos: [
      { linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 422 },
      { linhaOuMaquina: 'CAM', tempoEnvaseMinutos: 652 },
    ],
    temposPorMaquina: {
      'Xarope': 422,
      'm-liq-xarope': 422,
      'CAM': 652,
      'm-liq-cam': 652,
    },
  },
  {
    id: 'p-liq-102397',
    codigo: '102397',
    nome: 'VANTIL 50MG/ML SUS OR FR 30ML(LICITACAO)',
    setor: 'liquidos',
    linha: 'Gotas',
    tempoEnvaseMinutos: 762,
    vinculos: [{ linhaOuMaquina: 'Gotas', tempoEnvaseMinutos: 762 }],
    temposPorMaquina: { 'Gotas': 762, 'm-liq-gotas': 762 },
  },
  {
    id: 'p-liq-102410',
    codigo: '102410',
    nome: 'LAVITAN VIT INF SOL OR FR 240ML TUT FRUT',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 180,
    vinculos: [{ linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 180 }],
    temposPorMaquina: { 'Xarope': 180, 'm-liq-xarope': 180 },
  },
  {
    id: 'p-liq-102535',
    codigo: '102535',
    nome: 'HEDERA CIMED 7,0 MG/ML SOL OR FR 100 ML',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 536,
    vinculos: [{ linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 536 }],
    temposPorMaquina: { 'Xarope': 536, 'm-liq-xarope': 536 },
  },
  {
    id: 'p-liq-103085',
    codigo: '103085',
    nome: 'IBUPROFENO 100 MG/ML SUSP ORAL 20ML',
    setor: 'liquidos',
    linha: 'Gotas',
    tempoEnvaseMinutos: 971,
    vinculos: [{ linhaOuMaquina: 'Gotas', tempoEnvaseMinutos: 971 }],
    temposPorMaquina: { 'Gotas': 971, 'm-liq-gotas': 971 },
  },
  {
    id: 'p-liq-103177',
    codigo: '103177',
    nome: 'DEXCLOR + BETAMETASONA XPE FR 120ML HOSP',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 425,
    vinculos: [
      { linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 425 },
      { linhaOuMaquina: 'CAM', tempoEnvaseMinutos: 529 },
    ],
    temposPorMaquina: {
      'Xarope': 425,
      'm-liq-xarope': 425,
      'CAM': 529,
      'm-liq-cam': 529,
    },
  },
  {
    id: 'p-liq-103184',
    codigo: '103184',
    nome: 'HEDERA 7MG/ML SOL OR FR 100ML CEREJA',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 319,
    vinculos: [{ linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 319 }],
    temposPorMaquina: { 'Xarope': 319, 'm-liq-xarope': 319 },
  },
  {
    id: 'p-liq-103255',
    codigo: '103255',
    nome: 'LORATAMED D XPE FR 60 ML',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 625,
    vinculos: [
      { linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 625 },
      { linhaOuMaquina: 'CAM', tempoEnvaseMinutos: 371 },
    ],
    temposPorMaquina: {
      'Xarope': 625,
      'm-liq-xarope': 625,
      'CAM': 371,
      'm-liq-cam': 371,
    },
  },
  {
    id: 'p-liq-103445',
    codigo: '103445',
    nome: 'KURAMED SEPT SOL TOP FR SPRAY 50 ML',
    setor: 'liquidos',
    linha: 'Externo',
    tempoEnvaseMinutos: 465,
    vinculos: [{ linhaOuMaquina: 'Externo', tempoEnvaseMinutos: 465 }],
    temposPorMaquina: { 'Externo': 465, 'm-liq-externo': 465 },
  },
  {
    id: 'p-liq-103655',
    codigo: '103655',
    nome: 'GERAVITAN KIDS SOL OR FR 240ML TUTTI',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 180,
    vinculos: [{ linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 180 }],
    temposPorMaquina: { 'Xarope': 180, 'm-liq-xarope': 180 },
  },
  {
    id: 'p-liq-103785',
    codigo: '103785',
    nome: 'NITRATO DE MICONAZOL EMU FR 30ML',
    setor: 'liquidos',
    linha: 'Gotas',
    tempoEnvaseMinutos: 475,
    vinculos: [{ linhaOuMaquina: 'Gotas', tempoEnvaseMinutos: 475 }],
    temposPorMaquina: { 'Gotas': 475, 'm-liq-gotas': 475 },
  },
  {
    id: 'p-liq-103786',
    codigo: '103786',
    nome: 'NITRATO MICONAZOL EMU FR 30ML HOSP',
    setor: 'liquidos',
    linha: 'Gotas',
    tempoEnvaseMinutos: 512,
    vinculos: [{ linhaOuMaquina: 'Gotas', tempoEnvaseMinutos: 512 }],
    temposPorMaquina: { 'Gotas': 512, 'm-liq-gotas': 512 },
  },
  {
    id: 'p-liq-103893',
    codigo: '103893',
    nome: 'PRALIVIO 100 MG/ML SUSP ORAL 20ML',
    setor: 'liquidos',
    linha: 'Gotas',
    tempoEnvaseMinutos: 971,
    vinculos: [{ linhaOuMaquina: 'Gotas', tempoEnvaseMinutos: 971 }],
    temposPorMaquina: { 'Gotas': 971, 'm-liq-gotas': 971 },
  },
  {
    id: 'p-liq-103929',
    codigo: '103929',
    nome: 'CIMETOSSE 13,33MG/ML XPE FR 120ML',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 480,
    vinculos: [
      { linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 480 },
      { linhaOuMaquina: 'CAM', tempoEnvaseMinutos: 477 },
    ],
    temposPorMaquina: {
      'Xarope': 480,
      'm-liq-xarope': 480,
      'CAM': 477,
      'm-liq-cam': 477,
    },
  },
  {
    id: 'p-liq-103945',
    codigo: '103945',
    nome: 'CETOCONAZOL 20 MG/G XAMP FR 100 ML',
    setor: 'liquidos',
    linha: 'Externo',
    tempoEnvaseMinutos: 480,
    vinculos: [{ linhaOuMaquina: 'Externo', tempoEnvaseMinutos: 480 }],
    temposPorMaquina: { 'Externo': 480, 'm-liq-externo': 480 },
  },
  {
    id: 'p-liq-104070',
    codigo: '104070',
    nome: 'MALEATO DEXCLOR 2MG/5ML SOL OR 50FR HOSP',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 395,
    vinculos: [{ linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 395 }],
    temposPorMaquina: { 'Xarope': 395, 'm-liq-xarope': 395 },
  },
  {
    id: 'p-liq-104109',
    codigo: '104109',
    nome: 'CIMESPRAY 9MG/ML SOL FR 50 ML',
    setor: 'liquidos',
    linha: 'Externo',
    tempoEnvaseMinutos: 952,
    vinculos: [{ linhaOuMaquina: 'Externo', tempoEnvaseMinutos: 952 }],
    temposPorMaquina: { 'Externo': 952, 'm-liq-externo': 952 },
  },
  {
    id: 'p-liq-104167',
    codigo: '104167',
    nome: 'SIMETICONA 75MGML EMU OR 200FRX15ML',
    setor: 'liquidos',
    linha: 'Gotas',
    tempoEnvaseMinutos: 1185,
    vinculos: [{ linhaOuMaquina: 'Gotas', tempoEnvaseMinutos: 1185 }],
    temposPorMaquina: { 'Gotas': 1185, 'm-liq-gotas': 1185 },
  },
  {
    id: 'p-liq-104215',
    codigo: '104215',
    nome: 'BIOENERGIN INF SOL OR FR 240ML TUT FRUT',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 180,
    vinculos: [{ linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 180 }],
    temposPorMaquina: { 'Xarope': 180, 'm-liq-xarope': 180 },
  },
  {
    id: 'p-liq-104287',
    codigo: '104287',
    nome: 'RESSALIV SOL OR 48FLAC X 10ML ABACAXI',
    setor: 'liquidos',
    linha: 'Epativan',
    tempoEnvaseMinutos: 1198,
    vinculos: [{ linhaOuMaquina: 'Epativan', tempoEnvaseMinutos: 1198 }],
    temposPorMaquina: { 'Epativan': 1198, 'm-liq-epativan': 1198 },
  },
  {
    id: 'p-liq-104384',
    codigo: '104384',
    nome: 'SOSSEG 90MG/ML SOL OR FR X 100ML',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 95,
    vinculos: [{ linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 95 }],
    temposPorMaquina: { 'Xarope': 95, 'm-liq-xarope': 95 },
  },
  {
    id: 'p-liq-104524',
    codigo: '104524',
    nome: 'LEITE MAGN MAGNAZIA 8% SUS FR 120ML TRAD',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 944,
    vinculos: [{ linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 944 }],
    temposPorMaquina: { 'Xarope': 944, 'm-liq-xarope': 944 },
  },
  {
    id: 'p-liq-104525',
    codigo: '104525',
    nome: 'LEITE MAGN MAGNAZIA 8% SUS FR 120ML HORT',
    setor: 'liquidos',
    linha: 'Xarope',
    tempoEnvaseMinutos: 590,
    vinculos: [{ linhaOuMaquina: 'Xarope', tempoEnvaseMinutos: 590 }],
    temposPorMaquina: { 'Xarope': 590, 'm-liq-xarope': 590 },
  },
  {
    id: 'p-liq-105414',
    codigo: '105414',
    nome: 'RESSALIV SOL OR 48FLAC X 10ML MELANCIA',
    setor: 'liquidos',
    linha: 'Epativan',
    tempoEnvaseMinutos: 1198,
    vinculos: [{ linhaOuMaquina: 'Epativan', tempoEnvaseMinutos: 1198 }],
    temposPorMaquina: { 'Epativan': 1198, 'm-liq-epativan': 1198 },
  },
  {
    id: 'p-liq-105415',
    codigo: '105415',
    nome: 'RESSALIV SOL OR 48FLAC X 10ML CITRUS',
    setor: 'liquidos',
    linha: 'Epativan',
    tempoEnvaseMinutos: 1198,
    vinculos: [{ linhaOuMaquina: 'Epativan', tempoEnvaseMinutos: 1198 }],
    temposPorMaquina: { 'Epativan': 1198, 'm-liq-epativan': 1198 },
  },
  {
    id: 'p-liq-105735',
    codigo: '105735',
    nome: 'SUPER XAMPU ANTICASPA FR 200ML',
    setor: 'liquidos',
    linha: 'Externo',
    tempoEnvaseMinutos: 430,
    vinculos: [{ linhaOuMaquina: 'Externo', tempoEnvaseMinutos: 430 }],
    temposPorMaquina: { 'Externo': 430, 'm-liq-externo': 430 },
  },
  {
    id: 'p-liq-105756',
    codigo: '105756',
    nome: 'SUPER XAMPU 3 EM 1 FR 200ML',
    setor: 'liquidos',
    linha: 'Externo',
    tempoEnvaseMinutos: 430,
    vinculos: [{ linhaOuMaquina: 'Externo', tempoEnvaseMinutos: 430 }],
    temposPorMaquina: { 'Externo': 430, 'm-liq-externo': 430 },
  },
  {
    id: 'p-liq-105757',
    codigo: '105757',
    nome: 'SUPER XAMPU 3 EM 1 FR 400ML',
    setor: 'liquidos',
    linha: 'Externo',
    tempoEnvaseMinutos: 409,
    vinculos: [{ linhaOuMaquina: 'Externo', tempoEnvaseMinutos: 409 }],
    temposPorMaquina: { 'Externo': 409, 'm-liq-externo': 409 },
  },
  {
    id: 'p-liq-105758',
    codigo: '105758',
    nome: 'SUPER XAMPU ANTICASPA FR 400ML',
    setor: 'liquidos',
    linha: 'Externo',
    tempoEnvaseMinutos: 409,
    vinculos: [{ linhaOuMaquina: 'Externo', tempoEnvaseMinutos: 409 }],
    temposPorMaquina: { 'Externo': 409, 'm-liq-externo': 409 },
  },
  {
    id: 'p-liq-105914',
    codigo: '105914',
    nome: 'RESSALIV MANSAO MAROMBA DSP 48UN ABACAXI',
    setor: 'liquidos',
    linha: 'Epativan',
    tempoEnvaseMinutos: 1198,
    vinculos: [{ linhaOuMaquina: 'Epativan', tempoEnvaseMinutos: 1198 }],
    temposPorMaquina: { 'Epativan': 1198, 'm-liq-epativan': 1198 },
  },
  {
    id: 'p-liq-105915',
    codigo: '105915',
    nome: 'RESSALIV MANSAO MAROMBA DSP 48UN CITRUS',
    setor: 'liquidos',
    linha: 'Epativan',
    tempoEnvaseMinutos: 1198,
    vinculos: [{ linhaOuMaquina: 'Epativan', tempoEnvaseMinutos: 1198 }],
    temposPorMaquina: { 'Epativan': 1198, 'm-liq-epativan': 1198 },
  },
  {
    id: 'p-liq-105924',
    codigo: '105924',
    nome: 'RESSALIV MANSAO MAROMBA DSP48UN MELANCIA',
    setor: 'liquidos',
    linha: 'Epativan',
    tempoEnvaseMinutos: 1198,
    vinculos: [{ linhaOuMaquina: 'Epativan', tempoEnvaseMinutos: 1198 }],
    temposPorMaquina: { 'Epativan': 1198, 'm-liq-epativan': 1198 },
  },
];

export const MAQUINAS_INICIAIS: Maquina[] = [
  // Setor Semissólidos — 4 máquinas
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

  // Setor Líquidos — 5 máquinas (Xarope, Gotas, CAM, Externo, Epativan)
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
  if (mins === 0) return `${horas}h00min`;
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

function gerarVariacoesMaquina(termo?: string): string[] {
  if (!termo) return [];
  const limpo = termo.toLowerCase().trim();
  const variacoes = new Set<string>([limpo]);

  // Equivalências de Norden 1..4 (romano e arábico, singular e plural)
  if (limpo.includes('norden')) {
    if (limpo.includes('iv') || limpo.includes(' 4') || limpo.endsWith('4')) {
      variacoes.add('norden iv');
      variacoes.add('norden 4');
      variacoes.add('nordens 4');
      variacoes.add('nordens iv');
      variacoes.add('m-semi-norden-4');
    } else if (limpo.includes('iii') || limpo.includes(' 3') || limpo.endsWith('3')) {
      variacoes.add('norden iii');
      variacoes.add('norden 3');
      variacoes.add('nordens 3');
      variacoes.add('nordens iii');
      variacoes.add('m-semi-norden-3');
    } else if (limpo.includes('ii') || limpo.includes(' 2') || limpo.endsWith('2')) {
      variacoes.add('norden ii');
      variacoes.add('norden 2');
      variacoes.add('nordens 2');
      variacoes.add('nordens ii');
      variacoes.add('m-semi-norden-2');
    } else if (limpo.includes('i') || limpo.includes(' 1') || limpo.endsWith('1')) {
      variacoes.add('norden i');
      variacoes.add('norden 1');
      variacoes.add('nordens 1');
      variacoes.add('nordens i');
      variacoes.add('m-semi-norden-1');
    }
  }

  return Array.from(variacoes);
}

/**
 * Obtém o tempo específico de envase de um produto para uma máquina específica.
 * Procura primeiro em temposPorMaquina (por nome, linhaPadrao ou id),
 * depois na lista de vinculos, e por fim recorre ao tempoEnvaseMinutos padrão.
 */
export function obterTempoProdutoParaMaquina(
  produto: Produto,
  maquina: { id?: string; nome: string; linhaPadrao?: string; setor?: Setor }
): number {
  if (!produto) return 0;

  const variacoesMaquina = new Set<string>([
    ...gerarVariacoesMaquina(maquina.nome),
    ...gerarVariacoesMaquina(maquina.linhaPadrao),
    ...gerarVariacoesMaquina(maquina.id),
  ]);

  // 1. Verificar em temposPorMaquina
  if (produto.temposPorMaquina) {
    for (const [k, v] of Object.entries(produto.temposPorMaquina)) {
      const kNorm = k.toLowerCase().trim();
      const kVariacoes = gerarVariacoesMaquina(kNorm);
      for (const varItem of kVariacoes) {
        if (variacoesMaquina.has(varItem)) {
          return v;
        }
      }
    }
  }

  // 2. Verificar no array de vínculos
  if (produto.vinculos && produto.vinculos.length > 0) {
    const vEncontrado = produto.vinculos.find((v) => {
      const vNorm = v.linhaOuMaquina.toLowerCase().trim();
      const vVariacoes = gerarVariacoesMaquina(vNorm);
      return vVariacoes.some((vi) => variacoesMaquina.has(vi));
    });
    if (vEncontrado) {
      return vEncontrado.tempoEnvaseMinutos;
    }
  }

  // 3. Fallback
  return produto.tempoEnvaseMinutos || 0;
}

/**
 * Verifica se o produto possui vínculo explícito com a máquina especificada
 */
export function produtoVinculadoAMaquina(
  produto: Produto,
  maquina: { id?: string; nome: string; linhaPadrao?: string; setor?: Setor }
): boolean {
  if (!produto || !maquina) return false;
  if (maquina.setor && produto.setor !== maquina.setor) return false;

  const variacoesMaquina = new Set<string>([
    ...gerarVariacoesMaquina(maquina.nome),
    ...gerarVariacoesMaquina(maquina.linhaPadrao),
    ...gerarVariacoesMaquina(maquina.id),
  ]);

  if (produto.temposPorMaquina) {
    for (const k of Object.keys(produto.temposPorMaquina)) {
      const kNorm = k.toLowerCase().trim();
      const kVariacoes = gerarVariacoesMaquina(kNorm);
      if (kVariacoes.some((vi) => variacoesMaquina.has(vi))) {
        return true;
      }
    }
  }

  if (produto.vinculos && produto.vinculos.length > 0) {
    const encontrou = produto.vinculos.some((v) => {
      const vNorm = v.linhaOuMaquina.toLowerCase().trim();
      const vVariacoes = gerarVariacoesMaquina(vNorm);
      return vVariacoes.some((vi) => variacoesMaquina.has(vi));
    });
    if (encontrou) return true;
  }

  if (produto.linha) {
    const pLinhaNorm = produto.linha.toLowerCase().trim();
    const pVariacoes = gerarVariacoesMaquina(pLinhaNorm);
    if (pVariacoes.some((vi) => variacoesMaquina.has(vi))) {
      return true;
    }
  }

  return false;
}

/**
 * Localiza um produto no catálogo a partir de dados parciais de lote (código ou nome)
 */
export function encontrarProdutoDoLote(
  lote: { produto?: string; codigoProduto?: string },
  produtos: Produto[]
): Produto | undefined {
  if (!lote || !produtos) return undefined;

  // 1. Busca prioritária por código do produto
  if (lote.codigoProduto && lote.codigoProduto.trim()) {
    const codLimpo = lote.codigoProduto.trim().toLowerCase();
    const pPorCodigo = produtos.find(
      (p) => p.codigo && p.codigo.trim().toLowerCase() === codLimpo
    );
    if (pPorCodigo) return pPorCodigo;
  }

  // 2. Busca por nome do produto
  if (lote.produto && lote.produto.trim()) {
    const nomeLimpo = lote.produto.trim().toLowerCase();

    // Correspondência exata
    const pExato = produtos.find((p) => p.nome.trim().toLowerCase() === nomeLimpo);
    if (pExato) return pExato;

    // Correspondência por início
    const pInicia = produtos.find(
      (p) =>
        p.nome.trim().toLowerCase().startsWith(nomeLimpo) ||
        nomeLimpo.startsWith(p.nome.trim().toLowerCase())
    );
    if (pInicia) return pInicia;

    // Correspondência por contenção
    const pContem = produtos.find((p) => {
      const pNome = p.nome.trim().toLowerCase();
      return pNome.includes(nomeLimpo) || nomeLimpo.includes(pNome);
    });
    if (pContem) return pContem;

    // Correspondência por tokens principais (>= 3 letras)
    const tokensLote = nomeLimpo.split(/[\s\-_/]+/).filter((t) => t.length >= 3);
    if (tokensLote.length > 0) {
      const pPorTodosTokens = produtos.find((p) => {
        const pNome = p.nome.toLowerCase();
        return tokensLote.every((t) => pNome.includes(t));
      });
      if (pPorTodosTokens) return pPorTodosTokens;

      const pPorAlgumToken = produtos.find((p) => {
        const pNome = p.nome.toLowerCase();
        return tokensLote.some((t) => pNome.includes(t));
      });
      if (pPorAlgumToken) return pPorAlgumToken;
    }
  }

  return undefined;
}

/**
 * Retorna as máquinas compatíveis com um determinado produto
 */
export function obterMaquinasCompativeisComProduto(
  produto: Produto,
  maquinas: Array<{ id?: string; nome: string; linhaPadrao?: string; setor?: Setor }>
) {
  if (!produto || !maquinas) return [];
  return maquinas.filter((m) => produtoVinculadoAMaquina(produto, m));
}

/**
 * Verifica com rigor técnico se um Lote de Bloqueio é compatível com uma máquina específica.
 * Quando o lote foi cadastrado para 'Todas' (Qualquer Máquina Compatível),
 * consulta o produto no catálogo e valida os vínculos técnicos dele com a máquina.
 */
export function loteBloqueioCompativelComMaquina(
  lote: { produto?: string; codigoProduto?: string; maquina?: string; setor?: Setor },
  maquina: { id?: string; nome: string; linhaPadrao?: string; setor?: Setor },
  produtos: Produto[]
): boolean {
  if (!maquina || !lote) return false;

  // 1. O setor da máquina deve ser compatível com o setor do lote
  if (lote.setor && maquina.setor && lote.setor !== maquina.setor) {
    return false;
  }

  const maqNomeNorm = maquina.nome.toLowerCase().trim();

  // 2. Se o lote especificou uma máquina concreta (diferente de 'Todas' ou genéricos)
  const maqDefinida = lote.maquina && lote.maquina.trim().toLowerCase();
  if (
    maqDefinida &&
    maqDefinida !== 'todas' &&
    maqDefinida !== 'qualquer máquina compatível' &&
    maqDefinida !== 'qualquer máquina'
  ) {
    const variacoesLote = gerarVariacoesMaquina(maqDefinida);
    const variacoesMaq = new Set([
      ...gerarVariacoesMaquina(maquina.nome),
      ...gerarVariacoesMaquina(maquina.linhaPadrao),
      ...gerarVariacoesMaquina(maquina.id),
    ]);
    return variacoesLote.some((v) => variacoesMaq.has(v)) || maqDefinida === maqNomeNorm;
  }

  // 3. Se está configurado para "Qualquer Máquina Compatível", verifica os vínculos técnicos do produto
  const produto = encontrarProdutoDoLote(lote, produtos);
  if (produto) {
    return produtoVinculadoAMaquina(produto, maquina);
  }

  // Fallback: se o produto não foi localizado no catálogo conhecido, restringe pelo setor
  return !lote.setor || !maquina.setor || lote.setor === maquina.setor;
}
