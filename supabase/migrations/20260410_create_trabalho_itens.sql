-- ============================================================
-- TABELA: trabalho_itens (Sincronização Orçamento -> Obra)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.trabalho_itens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  trabalho_id uuid NOT NULL REFERENCES public.trabalhos(id) ON DELETE CASCADE,
  servico_id uuid REFERENCES public.catalogo_servicos(id) ON DELETE SET NULL,
  nome text NOT NULL,
  unidade text NOT NULL,
  quantidade numeric NOT NULL DEFAULT 1,
  valor_unitario numeric NOT NULL DEFAULT 0,
  custo_unitario numeric NOT NULL DEFAULT 0,
  funcionario_id uuid REFERENCES public.funcionarios(id) ON DELETE SET NULL,
  criado_em timestamp with time zone DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.trabalho_itens ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
DROP POLICY IF EXISTS "Autenticados podem tudo em trabalho_itens" ON public.trabalho_itens;
CREATE POLICY "Autenticados podem tudo em trabalho_itens"
  ON public.trabalho_itens FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Comentário para documentação
COMMENT ON TABLE public.trabalho_itens IS 'Armazena os itens de serviço vinculados a uma OS/Trabalho, permitindo rastrear custos reais vs orçados.';
