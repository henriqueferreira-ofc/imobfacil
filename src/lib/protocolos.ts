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

export function formatarCep(valor: string) {
  const digitos = valor.replace(/\D/g, "").slice(0, 8);
  return digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;
}

export function enderecoCompleto(p: {
  endereco: string;
  numero_casa: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
}) {
  const rua = [p.endereco, p.numero_casa].filter(Boolean).join(", ");
  const cidadeUf = [p.cidade, p.estado].filter(Boolean).join(" - ");
  return [rua, p.bairro, cidadeUf, p.cep].filter(Boolean).join(" • ");
}

export const ESTADOS_UF = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR",
  "PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];
