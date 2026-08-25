export type TipoImovel = "casa" | "lote" | "apartamento";
export type TipoNegociacao = "agio" | "a_vista" | "financiamento";
export type StatusProtocolo = "em_andamento" | "em_analise" | "concluido" | "cancelado";

export interface Protocolo {
  id: string;
  numero: string;
  vendedores: string;
  compradores: string;
  imovel: string;
  endereco: string;
  numero_casa: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
  matricula: string;
  cif: string;
  tipo_imovel: TipoImovel;
  tipo_negociacao: TipoNegociacao;
  status: StatusProtocolo;
  historico: string;
  created_at: string;
  updated_at: string;
}

export type ProtocoloPublico = Omit<Protocolo, "id">;

export const TIPO_IMOVEL_LABEL: Record<string, string> = {
  casa: "Casa",
  lote: "Lote",
  apartamento: "Apartamento",
};

export const TIPO_NEGOCIACAO_LABEL: Record<string, string> = {
  agio: "Ágio",
  a_vista: "À vista",
  financiamento: "Financiamento",
};

export const STATUS_LABEL: Record<string, string> = {
  em_andamento: "Em andamento",
  em_analise: "Em análise",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatarDataHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function normalizarNumero(valor: string) {
  return valor.trim().toUpperCase();
}
