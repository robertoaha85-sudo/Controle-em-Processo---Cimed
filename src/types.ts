export type Setor = 'liquidos' | 'semissolidos';

export type StatusMaquina =
  | 'em_andamento'
  | 'problema_mecanico'
  | 'atrasado'
  | 'livre'
  | 'em_limpeza_total'
  | 'em_limpeza_parcial'
  | 'aguardando_manipulacao';

export interface Produto {
  id: string;
  nome: string;
  setor: Setor;
  linha: string; // Ex: "NORDEN I", "NORDEN II", "NORDEN III", "NORDEN IV", "CAM", "Gotas", etc.
  tempoEnvaseMinutos: number; // Armazenado em minutos totais
}

export interface MembroEquipe {
  id: string;
  setor: Setor;
  turno: string;
  cargo: string;
  nome: string;
  email: string;
}

export interface Maquina {
  id: string;
  nome: string; // Ex: "Norden I", "CAM"
  setor: Setor;
  linhaPadrao?: string; // Linha associada para filtrar produtos recomendados
  status: 'em_andamento' | 'problema_mecanico' | 'livre' | 'em_limpeza_total' | 'em_limpeza_parcial' | 'aguardando_manipulacao';
  produtoAtualId?: string | null;
  produtoAtualNome?: string | null;
  numeroLote?: string | null;
  dataInicio?: string | null; // Formato YYYY-MM-DD
  horaInicio?: string | null; // Formato HH:mm ou ISO string
  previsaoTermino?: string | null; // Formato HH:mm ou ISO string
  tempoEnvaseMinutos?: number | null;
  teveProblemaMecanico?: boolean; // Flag se durante este lote ocorreu problema
  ultimaAtualizacao?: string;
  detalheProblema?: string | null;
}

export interface LoteHistorico {
  id: string;
  maquinaId: string;
  maquinaNome: string;
  setor: Setor;
  produtoNome: string;
  numeroLote?: string;
  dataInicio?: string;
  horaInicio: string;
  horaTermino: string;
  duracaoMinutos: number;
  teveProblemaMecanico: boolean;
  dataFinalizacao: string; // YYYY-MM-DD
  observacao?: string;
}

export interface ResumoStatus {
  total: number;
  emAndamento: number;
  problemaMecanico: number;
  atrasadas: number;
  livres: number;
  emLimpezaTotal: number;
  emLimpezaParcial: number;
  aguardandoManipulacao: number;
}
