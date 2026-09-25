export type Setor = 'liquidos' | 'semissolidos';

export type StatusMaquina =
  | 'em_andamento'
  | 'problema_mecanico'
  | 'atrasado'
  | 'livre'
  | 'em_limpeza_total'
  | 'em_limpeza_parcial'
  | 'aguardando_manipulacao';

export interface VinculoMaquinaTempo {
  linhaOuMaquina: string; // Ex: "Xarope", "CAM", "Gotas", "Externo", "Epativan", "Norden I", etc.
  tempoEnvaseMinutos: number; // Minutos totais
}

export interface Produto {
  id: string;
  codigo: string; // Código do produto, ex: "100000"
  nome: string;
  setor: Setor;
  linha: string; // Ex: "Xarope", "CAM", "Gotas", "Externo", "Epativan", "NORDEN I", etc.
  tempoEnvaseMinutos: number; // Tempo padrão (em minutos)
  vinculos?: VinculoMaquinaTempo[]; // Máquinas às quais o produto está vinculado com seus tempos específicos
  temposPorMaquina?: Record<string, number>; // Mapeamento rápido: { [maquinaNomeOuLinha]: minutos }
}

export interface MembroEquipe {
  id: string;
  setor: Setor;
  turno: string;
  cargo: string;
  nome: string;
  email: string;
}

export type PrazoBloqueio = 'hoje' | 'semana' | 'mes';
export type StatusBloqueio = 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';

export interface LoteBloqueio {
  id: string;
  produto: string;
  codigoProduto?: string | null;
  numeroLote: string;
  maquina: string; // Ex: "Norden 1", "CAM", "Todas", etc.
  setor?: Setor;
  prazo: PrazoBloqueio;
  dataLimite?: string;
  status: StatusBloqueio;
  observacoes?: string;
  criadoEm: string;
  concluidoEm?: string | null;
  iniciadoEm?: string | null;
  maquinaEmUsoId?: string | null;
}

export interface Maquina {
  id: string;
  nome: string; // Ex: "Norden I", "CAM"
  setor: Setor;
  linhaPadrao?: string; // Linha associada para filtrar produtos recomendados
  status: 'em_andamento' | 'problema_mecanico' | 'livre' | 'em_limpeza_total' | 'em_limpeza_parcial' | 'aguardando_manipulacao';
  produtoAtualId?: string | null;
  produtoAtualCodigo?: string | null;
  produtoAtualNome?: string | null;
  numeroLote?: string | null;
  dataInicio?: string | null; // Formato YYYY-MM-DD
  horaInicio?: string | null; // Formato HH:mm ou ISO string
  previsaoTermino?: string | null; // Formato HH:mm ou ISO string
  tempoEnvaseMinutos?: number | null;
  teveProblemaMecanico?: boolean; // Flag se durante este lote ocorreu problema
  ultimaAtualizacao?: string;
  detalheProblema?: string | null;
  isBloqueio?: boolean;
  loteBloqueioId?: string | null;
}

export interface LoteHistorico {
  id: string;
  maquinaId: string;
  maquinaNome: string;
  setor: Setor;
  produtoCodigo?: string | null;
  produtoNome: string;
  numeroLote?: string;
  dataInicio?: string;
  horaInicio: string;
  horaTermino: string;
  duracaoMinutos: number;
  duracaoPrevistaMinutos?: number; // Previsão do tempo de envase (ex: 17h00min)
  duracaoRealMinutos?: number; // Tempo real decorrido entre início e término
  teveProblemaMecanico: boolean;
  dataFinalizacao: string; // YYYY-MM-DD
  observacao?: string;
  isBloqueio?: boolean;
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
