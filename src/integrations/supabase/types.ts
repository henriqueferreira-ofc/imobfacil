export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      imoveis_administrados: {
        Row: {
          condominio_iptu: string
          created_at: string
          created_by: string | null
          id: string
          imovel: string
          manutencao_aberta: string
          observacoes: string
          proprietario: string
          repasse_previsto: number
          responsavel: string
          status: string
          taxa_administracao: number
          updated_at: string
        }
        Insert: {
          condominio_iptu?: string
          created_at?: string
          created_by?: string | null
          id?: string
          imovel?: string
          manutencao_aberta?: string
          observacoes?: string
          proprietario?: string
          repasse_previsto?: number
          responsavel?: string
          status?: string
          taxa_administracao?: number
          updated_at?: string
        }
        Update: {
          condominio_iptu?: string
          created_at?: string
          created_by?: string | null
          id?: string
          imovel?: string
          manutencao_aberta?: string
          observacoes?: string
          proprietario?: string
          repasse_previsto?: number
          responsavel?: string
          status?: string
          taxa_administracao?: number
          updated_at?: string
        }
        Relationships: []
      }
      locacoes: {
        Row: {
          administracao: boolean
          bairro: string
          cep: string
          cidade: string
          codigo: string
          corretor: string
          created_at: string
          created_by: string | null
          data_pagamento: string | null
          descricao_imovel: string
          empresa_bairro: string
          empresa_cartao_cnpj_url: string
          empresa_cidade: string
          empresa_cnpj: string
          empresa_comp_residencia_url: string
          empresa_endereco: string
          empresa_estado: string
          empresa_insc_estadual: string
          empresa_nome: string
          empresa_outros_doc_url: string
          endereco: string
          estado: string
          garantia: string
          garantia_caucao: boolean
          id: string
          imovel: string
          imovel_conta_agua_url: string
          imovel_conta_energia_url: string
          imovel_outros_doc_url: string
          inicio_contrato: string | null
          locatario: string
          locatario_celular: string
          locatario_comp_renda_url: string
          locatario_comp_residencia_url: string
          locatario_contato_referencia: string
          locatario_cpf: string
          locatario_doc_tipo: string
          locatario_doc_url: string
          locatario_email: string
          locatario_estado_civil: string
          locatario_orgao_expedidor: string
          locatario_profissao: string
          locatario_rg: string
          locatario_tipo_pessoa: string
          numero_casa: string
          observacoes: string
          prazo: string
          proprietario: string
          proprietario_celular: string
          proprietario_comp_renda_url: string
          proprietario_comp_residencia_url: string
          proprietario_contato_referencia: string
          proprietario_cpf: string
          proprietario_doc_tipo: string
          proprietario_doc_url: string
          proprietario_email: string
          proprietario_estado_civil: string
          proprietario_orgao_expedidor: string
          proprietario_profissao: string
          proprietario_rg: string
          resp_celular: string
          resp_comp_renda_url: string
          resp_comp_residencia_url: string
          resp_contato_referencia: string
          resp_cpf: string
          resp_doc_tipo: string
          resp_doc_url: string
          resp_email: string
          resp_estado_civil: string
          resp_nome: string
          resp_orgao_expedidor: string
          resp_profissao: string
          resp_rg: string
          status_vistoria: string
          tipo_locacao: string
          updated_at: string
          valor_aluguel: number
          valor_caucao: number
          vencimento_dia: number
        }
        Insert: {
          administracao?: boolean
          bairro?: string
          cep?: string
          cidade?: string
          codigo?: string
          corretor?: string
          created_at?: string
          created_by?: string | null
          data_pagamento?: string | null
          descricao_imovel?: string
          empresa_bairro?: string
          empresa_cartao_cnpj_url?: string
          empresa_cidade?: string
          empresa_cnpj?: string
          empresa_comp_residencia_url?: string
          empresa_endereco?: string
          empresa_estado?: string
          empresa_insc_estadual?: string
          empresa_nome?: string
          empresa_outros_doc_url?: string
          endereco?: string
          estado?: string
          garantia?: string
          garantia_caucao?: boolean
          id?: string
          imovel?: string
          imovel_conta_agua_url?: string
          imovel_conta_energia_url?: string
          imovel_outros_doc_url?: string
          inicio_contrato?: string | null
          locatario?: string
          locatario_celular?: string
          locatario_comp_renda_url?: string
          locatario_comp_residencia_url?: string
          locatario_contato_referencia?: string
          locatario_cpf?: string
          locatario_doc_tipo?: string
          locatario_doc_url?: string
          locatario_email?: string
          locatario_estado_civil?: string
          locatario_orgao_expedidor?: string
          locatario_profissao?: string
          locatario_rg?: string
          locatario_tipo_pessoa?: string
          numero_casa?: string
          observacoes?: string
          prazo?: string
          proprietario?: string
          proprietario_celular?: string
          proprietario_comp_renda_url?: string
          proprietario_comp_residencia_url?: string
          proprietario_contato_referencia?: string
          proprietario_cpf?: string
          proprietario_doc_tipo?: string
          proprietario_doc_url?: string
          proprietario_email?: string
          proprietario_estado_civil?: string
          proprietario_orgao_expedidor?: string
          proprietario_profissao?: string
          proprietario_rg?: string
          resp_celular?: string
          resp_comp_renda_url?: string
          resp_comp_residencia_url?: string
          resp_contato_referencia?: string
          resp_cpf?: string
          resp_doc_tipo?: string
          resp_doc_url?: string
          resp_email?: string
          resp_estado_civil?: string
          resp_nome?: string
          resp_orgao_expedidor?: string
          resp_profissao?: string
          resp_rg?: string
          status_vistoria?: string
          tipo_locacao?: string
          updated_at?: string
          valor_aluguel?: number
          valor_caucao?: number
          vencimento_dia?: number
        }
        Update: {
          administracao?: boolean
          bairro?: string
          cep?: string
          cidade?: string
          codigo?: string
          corretor?: string
          created_at?: string
          created_by?: string | null
          data_pagamento?: string | null
          descricao_imovel?: string
          empresa_bairro?: string
          empresa_cartao_cnpj_url?: string
          empresa_cidade?: string
          empresa_cnpj?: string
          empresa_comp_residencia_url?: string
          empresa_endereco?: string
          empresa_estado?: string
          empresa_insc_estadual?: string
          empresa_nome?: string
          empresa_outros_doc_url?: string
          endereco?: string
          estado?: string
          garantia?: string
          garantia_caucao?: boolean
          id?: string
          imovel?: string
          imovel_conta_agua_url?: string
          imovel_conta_energia_url?: string
          imovel_outros_doc_url?: string
          inicio_contrato?: string | null
          locatario?: string
          locatario_celular?: string
          locatario_comp_renda_url?: string
          locatario_comp_residencia_url?: string
          locatario_contato_referencia?: string
          locatario_cpf?: string
          locatario_doc_tipo?: string
          locatario_doc_url?: string
          locatario_email?: string
          locatario_estado_civil?: string
          locatario_orgao_expedidor?: string
          locatario_profissao?: string
          locatario_rg?: string
          locatario_tipo_pessoa?: string
          numero_casa?: string
          observacoes?: string
          prazo?: string
          proprietario?: string
          proprietario_celular?: string
          proprietario_comp_renda_url?: string
          proprietario_comp_residencia_url?: string
          proprietario_contato_referencia?: string
          proprietario_cpf?: string
          proprietario_doc_tipo?: string
          proprietario_doc_url?: string
          proprietario_email?: string
          proprietario_estado_civil?: string
          proprietario_orgao_expedidor?: string
          proprietario_profissao?: string
          proprietario_rg?: string
          resp_celular?: string
          resp_comp_renda_url?: string
          resp_comp_residencia_url?: string
          resp_contato_referencia?: string
          resp_cpf?: string
          resp_doc_tipo?: string
          resp_doc_url?: string
          resp_email?: string
          resp_estado_civil?: string
          resp_nome?: string
          resp_orgao_expedidor?: string
          resp_profissao?: string
          resp_rg?: string
          status_vistoria?: string
          tipo_locacao?: string
          updated_at?: string
          valor_aluguel?: number
          valor_caucao?: number
          vencimento_dia?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nome: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          nome?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nome?: string | null
        }
        Relationships: []
      }
      protocolos: {
        Row: {
          bairro: string
          banco: string
          cep: string
          cidade: string
          cif: string
          cif_doc_url: string
          compradores: string
          contrato: string
          contrato_doc_url: string
          corretor: string
          created_at: string
          created_by: string | null
          endereco: string
          estado: string
          historico: string
          id: string
          imovel: string
          matricula: string
          matricula_doc_url: string
          numero: string
          numero_casa: string
          status: string
          tipo_imovel: string
          tipo_negociacao: string
          updated_at: string
          vendedores: string
        }
        Insert: {
          bairro?: string
          banco?: string
          cep?: string
          cidade?: string
          cif?: string
          cif_doc_url?: string
          compradores?: string
          contrato?: string
          contrato_doc_url?: string
          corretor?: string
          created_at?: string
          created_by?: string | null
          endereco?: string
          estado?: string
          historico?: string
          id?: string
          imovel?: string
          matricula?: string
          matricula_doc_url?: string
          numero?: string
          numero_casa?: string
          status?: string
          tipo_imovel?: string
          tipo_negociacao?: string
          updated_at?: string
          vendedores?: string
        }
        Update: {
          bairro?: string
          banco?: string
          cep?: string
          cidade?: string
          cif?: string
          cif_doc_url?: string
          compradores?: string
          contrato?: string
          contrato_doc_url?: string
          corretor?: string
          created_at?: string
          created_by?: string | null
          endereco?: string
          estado?: string
          historico?: string
          id?: string
          imovel?: string
          matricula?: string
          matricula_doc_url?: string
          numero?: string
          numero_casa?: string
          status?: string
          tipo_imovel?: string
          tipo_negociacao?: string
          updated_at?: string
          vendedores?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cadastrar_locacao_publica: { Args: { p_payload: Json }; Returns: string }
      consultar_locacao: {
        Args: { p_codigo: string }
        Returns: {
          administracao: boolean
          bairro: string
          cep: string
          cidade: string
          codigo: string
          created_at: string
          descricao_imovel: string
          endereco: string
          estado: string
          garantia: string
          imovel: string
          inicio_contrato: string
          locatario: string
          locatario_celular: string
          locatario_email: string
          locatario_estado_civil: string
          locatario_profissao: string
          locatario_tipo_pessoa: string
          numero_casa: string
          observacoes: string
          prazo: string
          proprietario: string
          proprietario_celular: string
          proprietario_email: string
          status_vistoria: string
          tipo_locacao: string
          updated_at: string
          valor_aluguel: number
          vencimento_dia: number
        }[]
      }
      consultar_protocolo: {
        Args: { p_numero: string }
        Returns: {
          bairro: string
          banco: string
          cep: string
          cidade: string
          cif: string
          cif_doc_url: string
          compradores: string
          contrato: string
          contrato_doc_url: string
          corretor: string
          created_at: string
          endereco: string
          estado: string
          historico: string
          imovel: string
          matricula: string
          matricula_doc_url: string
          numero: string
          numero_casa: string
          status: string
          tipo_imovel: string
          tipo_negociacao: string
          updated_at: string
          vendedores: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
