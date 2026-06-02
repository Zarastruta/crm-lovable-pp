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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      anexos_os: {
        Row: {
          criado_em: string
          id: string
          nome_arquivo: string
          os_id: string
          storage_path: string
          tipo: string
        }
        Insert: {
          criado_em?: string
          id?: string
          nome_arquivo: string
          os_id: string
          storage_path: string
          tipo?: string
        }
        Update: {
          criado_em?: string
          id?: string
          nome_arquivo?: string
          os_id?: string
          storage_path?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "anexos_os_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "os"
            referencedColumns: ["id"]
          },
        ]
      }
      apontamentos: {
        Row: {
          criado_em: string
          data: string
          funcionario_id: string
          id: string
          observacao: string
          periodo: string
        }
        Insert: {
          criado_em?: string
          data?: string
          funcionario_id: string
          id?: string
          observacao?: string
          periodo?: string
        }
        Update: {
          criado_em?: string
          data?: string
          funcionario_id?: string
          id?: string
          observacao?: string
          periodo?: string
        }
        Relationships: [
          {
            foreignKeyName: "apontamentos_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          criado_em: string
          email: string
          id: string
          nome: string
          observacoes: string
          telefone: string
          tipo: string
        }
        Insert: {
          criado_em?: string
          email?: string
          id?: string
          nome: string
          observacoes?: string
          telefone?: string
          tipo?: string
        }
        Update: {
          criado_em?: string
          email?: string
          id?: string
          nome?: string
          observacoes?: string
          telefone?: string
          tipo?: string
        }
        Relationships: []
      }
      condominios: {
        Row: {
          administradora_id: string | null
          cnpj: string
          criado_em: string
          endereco: string
          id: string
          nome: string
          observacoes: string
          sindico_id: string | null
        }
        Insert: {
          administradora_id?: string | null
          cnpj?: string
          criado_em?: string
          endereco?: string
          id?: string
          nome: string
          observacoes?: string
          sindico_id?: string | null
        }
        Update: {
          administradora_id?: string | null
          cnpj?: string
          criado_em?: string
          endereco?: string
          id?: string
          nome?: string
          observacoes?: string
          sindico_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "condominios_administradora_id_fkey"
            columns: ["administradora_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "condominios_sindico_id_fkey"
            columns: ["sindico_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
        ]
      }
      contatos: {
        Row: {
          cpf_cnpj: string
          criado_em: string
          email: string
          id: string
          nome: string
          observacoes: string
          telefone: string
          tipo: string
        }
        Insert: {
          cpf_cnpj?: string
          criado_em?: string
          email?: string
          id?: string
          nome: string
          observacoes?: string
          telefone?: string
          tipo?: string
        }
        Update: {
          cpf_cnpj?: string
          criado_em?: string
          email?: string
          id?: string
          nome?: string
          observacoes?: string
          telefone?: string
          tipo?: string
        }
        Relationships: []
      }
      funcionarios: {
        Row: {
          ativo: boolean
          criado_em: string
          id: string
          nome: string
          tipo: string
          valor_diaria: number
        }
        Insert: {
          ativo?: boolean
          criado_em?: string
          id?: string
          nome: string
          tipo?: string
          valor_diaria?: number
        }
        Update: {
          ativo?: boolean
          criado_em?: string
          id?: string
          nome?: string
          tipo?: string
          valor_diaria?: number
        }
        Relationships: []
      }
      obras: {
        Row: {
          cliente_id: string
          criado_em: string
          endereco: string
          id: string
          nome_local: string
          status: string
        }
        Insert: {
          cliente_id: string
          criado_em?: string
          endereco?: string
          id?: string
          nome_local: string
          status?: string
        }
        Update: {
          cliente_id?: string
          criado_em?: string
          endereco?: string
          id?: string
          nome_local?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "obras_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamentos: {
        Row: {
          cliente_id: string | null
          condominio_id: string | null
          criado_em: string
          data_aprovacao: string | null
          data_emissao: string
          descricao: string
          endereco_obra: string
          id: string
          motivo_recusa: string
          numero: number
          observacoes: string
          sindico_id: string | null
          status: string
          titulo: string
          trabalho_id: string | null
          validade: string | null
          valor: number
        }
        Insert: {
          cliente_id?: string | null
          condominio_id?: string | null
          criado_em?: string
          data_aprovacao?: string | null
          data_emissao?: string
          descricao?: string
          endereco_obra?: string
          id?: string
          motivo_recusa?: string
          numero?: number
          observacoes?: string
          sindico_id?: string | null
          status?: string
          titulo: string
          trabalho_id?: string | null
          validade?: string | null
          valor?: number
        }
        Update: {
          cliente_id?: string | null
          condominio_id?: string | null
          criado_em?: string
          data_aprovacao?: string | null
          data_emissao?: string
          descricao?: string
          endereco_obra?: string
          id?: string
          motivo_recusa?: string
          numero?: number
          observacoes?: string
          sindico_id?: string | null
          status?: string
          titulo?: string
          trabalho_id?: string | null
          validade?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_sindico_id_fkey"
            columns: ["sindico_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_trabalho_id_fkey"
            columns: ["trabalho_id"]
            isOneToOne: false
            referencedRelation: "trabalhos"
            referencedColumns: ["id"]
          },
        ]
      }
      os: {
        Row: {
          criado_em: string
          data_agendada: string | null
          data_conclusao: string | null
          descricao: string
          executor: string
          id: string
          obra_id: string
          prioridade: string
          status: string
          status_pagamento: string
          titulo: string
          valor_recebido: number
          valor_total: number
        }
        Insert: {
          criado_em?: string
          data_agendada?: string | null
          data_conclusao?: string | null
          descricao?: string
          executor?: string
          id?: string
          obra_id: string
          prioridade?: string
          status?: string
          status_pagamento?: string
          titulo: string
          valor_recebido?: number
          valor_total?: number
        }
        Update: {
          criado_em?: string
          data_agendada?: string | null
          data_conclusao?: string | null
          descricao?: string
          executor?: string
          id?: string
          obra_id?: string
          prioridade?: string
          status?: string
          status_pagamento?: string
          titulo?: string
          valor_recebido?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "os_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ativo: boolean
          created_at: string
          email: string
          id: string
          nome: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email?: string
          id?: string
          nome?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string
          id?: string
          nome?: string
          user_id?: string
        }
        Relationships: []
      }
      trabalhos: {
        Row: {
          cliente_id: string | null
          condominio_id: string | null
          criado_em: string
          data: string
          data_pagamento: string | null
          descricao: string
          endereco_obra: string
          id: string
          nota_fiscal: string
          nota_fiscal_data: string | null
          nota_fiscal_foto_path: string | null
          nota_fiscal_hora: string | null
          observacoes: string
          sindico_id: string | null
          status_pagamento: string
          titulo: string
          valor: number
        }
        Insert: {
          cliente_id?: string | null
          condominio_id?: string | null
          criado_em?: string
          data?: string
          data_pagamento?: string | null
          descricao?: string
          endereco_obra?: string
          id?: string
          nota_fiscal?: string
          nota_fiscal_data?: string | null
          nota_fiscal_foto_path?: string | null
          nota_fiscal_hora?: string | null
          observacoes?: string
          sindico_id?: string | null
          status_pagamento?: string
          titulo: string
          valor?: number
        }
        Update: {
          cliente_id?: string | null
          condominio_id?: string | null
          criado_em?: string
          data?: string
          data_pagamento?: string | null
          descricao?: string
          endereco_obra?: string
          id?: string
          nota_fiscal?: string
          nota_fiscal_data?: string | null
          nota_fiscal_foto_path?: string | null
          nota_fiscal_hora?: string | null
          observacoes?: string
          sindico_id?: string | null
          status_pagamento?: string
          titulo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "trabalhos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trabalhos_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trabalhos_sindico_id_fkey"
            columns: ["sindico_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
