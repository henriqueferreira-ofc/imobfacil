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
  locatario_tipo_pessoa: string;
  proprietario: string;
  proprietario_email: string;
  proprietario_celular: string;
  proprietario_doc_url: string;
  locatario: string;
  locatario_profissao: string;
  locatario_estado_civil: string;
  locatario_email: string;
  locatario_celular: string;
  locatario_doc_url: string;
  descricao_imovel: string;
  tipo_locacao: string;
  prazo: string;
  administracao: boolean;
  valor_aluguel: number;
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
