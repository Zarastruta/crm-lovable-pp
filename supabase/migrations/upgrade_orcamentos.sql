-- 1. Extensão da tabela orcamentos (Padrão Ouro PratesPaiva)
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS condicoes_pagamento text;
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS prazo_execucao text;
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS data_prevista_inicio date;
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS exclusoes text;
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS responsabilidades text;

-- 2. Tabela de Catálogo de Serviços
CREATE TABLE IF NOT EXISTS public.catalogo_servicos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  unidade_padrao text NOT NULL DEFAULT 'un',
  valor_base_sugerido numeric NOT NULL DEFAULT 0,
  custo_padrao numeric NOT NULL DEFAULT 0,
  prestador_padrao_id uuid REFERENCES public.funcionarios(id) ON DELETE SET NULL,
  criado_em timestamp with time zone DEFAULT now() NOT NULL
);

-- RLS para catalogo_servicos
ALTER TABLE public.catalogo_servicos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir leitura para usuários autenticados" ON public.catalogo_servicos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir inserção para usuários autenticados" ON public.catalogo_servicos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Permitir atualização para usuários autenticados" ON public.catalogo_servicos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Permitir deleção para usuários autenticados" ON public.catalogo_servicos FOR DELETE TO authenticated USING (true);

-- 3. Tabela de Itens (Tabela do PDF)
CREATE TABLE IF NOT EXISTS public.orcamento_itens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  orcamento_id uuid NOT NULL REFERENCES public.orcamentos(id) ON DELETE CASCADE,
  servico_id uuid REFERENCES public.catalogo_servicos(id) ON DELETE SET NULL,
  nome text NOT NULL,
  unidade text NOT NULL,
  quantidade numeric NOT NULL DEFAULT 1,
  valor_unitario numeric NOT NULL DEFAULT 0,
  custo_unitario numeric NOT NULL DEFAULT 0,
  funcionario_id uuid REFERENCES public.funcionarios(id) ON DELETE SET NULL,
  criado_em timestamp with time zone DEFAULT now() NOT NULL
);

-- RLS para orcamento_itens
ALTER TABLE public.orcamento_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir leitura itens para autenticados" ON public.orcamento_itens FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir inserção itens para autenticados" ON public.orcamento_itens FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Permitir atualização itens para autenticados" ON public.orcamento_itens FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Permitir deleção itens para autenticados" ON public.orcamento_itens FOR DELETE TO authenticated USING (true);
