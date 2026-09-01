export type StatusVistoria = "em_analise" | "em_andamento" | "concluido";

export const STATUS_VISTORIA_LABEL: Record<string, string> = {
  em_analise: "Em análise",
  em_andamento: "Em andamento",
  concluido: "Concluído",
};

export const ESTADO_CIVIL_OPCOES = [
  { value: "casado", label: "Casado" },
  { value: "solteiro", label: "Solteiro" },
  { value: "uniao_estavel", label: "União Estável" },
];

export interface Locacao {
  id: string;
  proprietario_profissao: string;
  proprietario_estado_civil: string;
  proprietario_rg: string;
  proprietario_orgao_expedidor: string;
  proprietario_cpf: string;
  proprietario_contato_referencia: string;
  proprietario_doc_tipo: string;
  proprietario_comp_residencia_url: string;
  proprietario_comp_renda_url: string;
  locatario_rg: string;
  locatario_orgao_expedidor: string;
  locatario_cpf: string;
  locatario_contato_referencia: string;
  locatario_doc_tipo: string;
  locatario_comp_residencia_url: string;
  locatario_comp_renda_url: string;
  empresa_nome: string;
  empresa_cnpj: string;
  empresa_insc_estadual: string;
  empresa_endereco: string;
  empresa_bairro: string;
  empresa_cidade: string;
  empresa_estado: string;
  empresa_cartao_cnpj_url: string;
  empresa_comp_residencia_url: string;
  empresa_outros_doc_url: string;
  resp_nome: string;
  resp_estado_civil: string;
  resp_profissao: string;
  resp_rg: string;
  resp_orgao_expedidor: string;
  resp_cpf: string;
  resp_email: string;
  resp_celular: string;
  resp_contato_referencia: string;
  resp_doc_tipo: string;
  resp_doc_url: string;
  resp_comp_residencia_url: string;
  resp_comp_renda_url: string;
  imovel_conta_energia_url: string;
  imovel_conta_agua_url: string;
  imovel_outros_doc_url: string;
  garantia_caucao: boolean;
  valor_caucao: number;
  data_pagamento: string | null;
  codigo: string;
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
  corretor: string;
  prazo: string;
  administracao: boolean;
  valor_aluguel: number;
  inicio_contrato: string | null;
  vencimento_dia: number;
  status_vistoria: string;
  doc_negociacao_nome: string;
  doc_negociacao_url: string;
  observacoes: string;

  created_at: string;
  updated_at: string;
}

export type LocacaoPublica = Omit<Locacao, "id" | "created_by">;

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
