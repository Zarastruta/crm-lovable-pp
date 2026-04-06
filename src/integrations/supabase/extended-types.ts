import { Database } from "./types";

// Extended database types to fix missing columns/tables in generated types
export type ExtendedDatabase = Database & {
  public: Database["public"] & {
    Tables: Database["public"]["Tables"] & {
      clientes: {
        Row: Database["public"]["Tables"]["clientes"]["Row"] & {
          cpf_cnpj: string | null;
        };
        Insert: Database["public"]["Tables"]["clientes"]["Insert"] & {
          cpf_cnpj?: string | null;
        };
        Update: Database["public"]["Tables"]["clientes"]["Update"] & {
          cpf_cnpj?: string | null;
        };
        Relationships: Database["public"]["Tables"]["clientes"]["Relationships"];
      };
      trabalhos: {
        Row: Database["public"]["Tables"]["trabalhos"]["Row"] & {
          conclusao_percentual: number | null;
          etapa_atual: string | null;
          custo_estimado: number | null;
        };
        Insert: Database["public"]["Tables"]["trabalhos"]["Insert"] & {
          conclusao_percentual?: number | null;
          etapa_atual?: string | null;
          custo_estimado?: number | null;
        };
        Update: Database["public"]["Tables"]["trabalhos"]["Update"] & {
          conclusao_percentual?: number | null;
          etapa_atual?: string | null;
          custo_estimado?: number | null;
        };
        Relationships: Database["public"]["Tables"]["trabalhos"]["Relationships"];
      };
      ferramentas: {
        Row: {
          id: string;
          nome: string;
          local_atual: string | null;
          quantidade: number | null;
          observacoes: string | null;
          criado_em: string;
        };
        Insert: {
          id?: string;
          nome: string;
          local_atual?: string | null;
          quantidade?: number | null;
          observacoes?: string | null;
          criado_em?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          local_atual?: string | null;
          quantidade?: number | null;
          observacoes?: string | null;
          criado_em?: string;
        };
        Relationships: [];
      };
      orcamentos: {
        Row: Database["public"]["Tables"]["orcamentos"]["Row"] & {
          condicoes_pagamento: string | null;
          prazo_execucao: string | null;
          data_prevista_inicio: string | null;
          exclusoes: string | null;
          responsabilidades: string | null;
        };
        Insert: Database["public"]["Tables"]["orcamentos"]["Insert"] & {
          condicoes_pagamento?: string | null;
          prazo_execucao?: string | null;
          data_prevista_inicio?: string | null;
          exclusoes?: string | null;
          responsabilidades?: string | null;
        };
        Update: Database["public"]["Tables"]["orcamentos"]["Update"] & {
          condicoes_pagamento?: string | null;
          prazo_execucao?: string | null;
          data_prevista_inicio?: string | null;
          exclusoes?: string | null;
          responsabilidades?: string | null;
        };
        Relationships: Database["public"]["Tables"]["orcamentos"]["Relationships"];
      };
      catalogo_servicos: {
        Row: {
          id: string;
          nome: string;
          unidade_padrao: string;
          valor_base_sugerido: number;
          custo_padrao: number;
          prestador_padrao_id: string | null;
          criado_em: string;
        };
        Insert: {
          id?: string;
          nome: string;
          unidade_padrao?: string;
          valor_base_sugerido?: number;
          custo_padrao?: number;
          prestador_padrao_id?: string | null;
          criado_em?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          unidade_padrao?: string;
          valor_base_sugerido?: number;
          custo_padrao?: number;
          prestador_padrao_id?: string | null;
          criado_em?: string;
        };
        Relationships: [
          {
            foreignKeyName: "catalogo_servicos_prestador_padrao_id_fkey";
            columns: ["prestador_padrao_id"];
            isOneToOne: false;
            referencedRelation: "funcionarios";
            referencedColumns: ["id"];
          }
        ];
      };
      orcamento_itens: {
        Row: {
          id: string;
          orcamento_id: string;
          servico_id: string | null;
          nome: string;
          unidade: string;
          quantidade: number;
          valor_unitario: number;
          custo_unitario: number;
          funcionario_id: string | null;
          criado_em: string;
        };
        Insert: {
          id?: string;
          orcamento_id: string;
          servico_id?: string | null;
          nome: string;
          unidade: string;
          quantidade?: number;
          valor_unitario?: number;
          custo_unitario?: number;
          funcionario_id?: string | null;
          criado_em?: string;
        };
        Update: {
          id?: string;
          orcamento_id?: string;
          servico_id?: string | null;
          nome?: string;
          unidade?: string;
          quantidade?: number;
          valor_unitario?: number;
          custo_unitario?: number;
          funcionario_id?: string | null;
          criado_em?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orcamento_itens_orcamento_id_fkey";
            columns: ["orcamento_id"];
            isOneToOne: false;
            referencedRelation: "orcamentos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orcamento_itens_servico_id_fkey";
            columns: ["servico_id"];
            isOneToOne: false;
            referencedRelation: "catalogo_servicos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orcamento_itens_funcionario_id_fkey";
            columns: ["funcionario_id"];
            isOneToOne: false;
            referencedRelation: "funcionarios";
            referencedColumns: ["id"];
          }
        ];
      };
    };
  };
};
