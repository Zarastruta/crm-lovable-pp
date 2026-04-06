export type TipoContato = "sindico" | "pessoa_fisica" | "empresa" | "administradora";
export type StatusPagamento = "pago" | "nao_pago";
export type StatusOrcamento = "rascunho" | "enviado" | "aprovado" | "recusado" | "vencido" | "convertido";
export type StatusObra = "aguardando" | "em_andamento" | "concluido" | "cancelado";
export type TipoFuncionario = "proprio" | "terceirizado" | "parceiro";

export interface Cliente {
  id: string;
  nome: string;
  tipo: TipoContato;
  cpf_cnpj: string;
  telefone: string;
  email: string;
  observacoes: string;
  criadoEm: string;
}

export interface Condominio {
  id: string;
  nome: string;
  cnpj: string;
  endereco: string;
  sindicoId: string | null;
  administradoraId: string | null;
  observacoes: string;
  criadoEm: string;
}

export interface Funcionario {
  id: string;
  nome: string;
  tipo: TipoFuncionario;
  valor_diaria: number;
  ativo: boolean;
  criadoEm: string;
}

export interface Trabalho {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  valor: number;
  status_pagamento: StatusPagamento;
  status_obra: StatusObra;
  nota_fiscal: string;
  nota_fiscal_data: string | null;
  nota_fiscal_hora: string | null;
  data_pagamento: string | null;
  nota_fiscal_foto_path: string;
  condominioId: string | null;
  clienteId: string | null;
  sindicoId: string | null;
  endereco_obra: string;
  observacoes: string;
  conclusao_percentual: number; // 0-100
  etapa_atual: string;
  custo_estimado: number;
  criadoEm: string;
}

export interface Orcamento {
  id: string;
  numero: number;
  titulo: string;
  descricao: string;
  status: StatusOrcamento;
  data_emissao: string;
  validade: string | null;
  valor: number;
  observacoes: string;
  condicoes_pagamento?: string;
  prazo_execucao?: string;
  data_prevista_inicio?: string | null;
  exclusoes?: string;
  responsabilidades?: string;
  condominioId: string | null;
  clienteId: string | null;
  sindicoId: string | null;
  endereco_obra: string;
  motivo_recusa: string;
  data_aprovacao: string | null;
  trabalhoId: string | null;
  criadoEm: string;
  itens?: OrcamentoItem[];
}

export interface Ferramenta {
  id: string;
  nome: string;
  local_atual: string;
  quantidade: number;
  observacoes: string;
  criadoEm: string;
}

export interface CatalogoServico {
  id: string;
  nome: string;
  unidade_padrao: string;
  valor_base_sugerido: number;
  custo_padrao: number;
  prestador_padrao_id: string | null;
  criado_em: string;
}

export interface OrcamentoItem {
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
}
