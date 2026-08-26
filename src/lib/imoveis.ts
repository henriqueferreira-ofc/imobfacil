export type StatusVistoria = "em_analise" | "em_andamento" | "concluido";

export const STATUS_VISTORIA_LABEL: Record<string, string> = {
  em_analise: "Em análise",
  em_andamento: "Em andamento",
  concluido: "Concluído",
};

export interface Locacao {
  id: string;
  imovel: string;
  endereco: string;
  numero_casa: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
  proprietario: string;
  locatario: string;
  valor_aluguel: number;
  garantia: string;
  inicio_contrato: string | null;
  vencimento_dia: number;
  status_vistoria: string;
  observacoes: string;
  created_at: string;
  updated_at: string;
}

export interface ImovelAdministrado {
  id: string;
  imovel: string;
  proprietario: string;
  responsavel: string;
  taxa_administracao: number;
  repasse_previsto: number;
  condominio_iptu: string;
  manutencao_aberta: string;
  status: string;
  observacoes: string;
  created_at: string;
  updated_at: string;
}

export function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(valor) || 0,
  );
}
