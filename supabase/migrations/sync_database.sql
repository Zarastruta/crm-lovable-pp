-- 1. Sincronização da tabela Trabalhos (Bugs de Monitoramento)
ALTER TABLE public.trabalhos ADD COLUMN IF NOT EXISTS conclusao_percentual numeric DEFAULT 0;
ALTER TABLE public.trabalhos ADD COLUMN IF NOT EXISTS etapa_atual text DEFAULT '';
ALTER TABLE public.trabalhos ADD COLUMN IF NOT EXISTS custo_estimado numeric DEFAULT 0;

-- 2. Correção de Integridade das Obras (Caso ainda aponte para tabela errada)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'obras') THEN
        ALTER TABLE public.obras DROP CONSTRAINT IF EXISTS obras_cliente_id_fkey;
    END IF;
END $$;

-- 3. Unificação de Contatos e Clientes
-- Vamos migrar dados de 'clientes' para 'contatos' (que é mais completa) e depois renomear
-- Nota: 'contatos' já tem nome, email, telefone, tipo, observacoes.
-- Se a tabela 'clientes' existir, migramos.
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clientes') THEN
        INSERT INTO public.contatos (nome, email, telefone, tipo, observacoes)
        SELECT nome, email, telefone, tipo, observacoes FROM public.clientes
        ON CONFLICT DO NOTHING;
        
        -- Agora removemos a tabela 'clientes' redundante
        DROP TABLE IF EXISTS public.clientes CASCADE;
    END IF;
END $$;

-- Renomeamos 'contatos' para 'clientes' para ficar intuitivo
ALTER TABLE public.contatos RENAME TO clientes;

-- 4. Garantir colunas extras de Orçamento (PDF Ouro)
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS condicoes_pagamento text;
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS prazo_execucao text;
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS data_prevista_inicio date;
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS exclusoes text;
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS responsabilidades text;

-- 5. Tabelas Adicionais (Caso os try/catches estejam falhando no frontend)
CREATE TABLE IF NOT EXISTS public.ferramentas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  local_atual text,
  quantidade numeric DEFAULT 1,
  observacoes text,
  criado_em timestamp with time zone DEFAULT now() NOT NULL
);

-- RLS para ferramentas
ALTER TABLE public.ferramentas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir leitura ferramentas para autenticados" ON public.ferramentas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir inserção ferramentas para autenticados" ON public.ferramentas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Permitir atualização ferramentas para autenticados" ON public.ferramentas FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Permitir deleção ferramentas para autenticados" ON public.ferramentas FOR DELETE TO authenticated USING (true);
