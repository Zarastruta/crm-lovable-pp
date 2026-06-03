-- ============================================================
-- RLS (Row Level Security) — Vulcano CRM
-- Execute no Supabase → SQL Editor
-- Fase 6: isolamento multi-tenant por user_id
-- ============================================================

-- ── 6.1 Adicionar coluna user_id em todas as tabelas ────────
ALTER TABLE clientes          ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE condominios       ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE trabalhos         ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE orcamentos        ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE orcamento_itens   ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE funcionarios      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE ferramentas       ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE catalogo_servicos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE ponto_diario      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- ── 6.2 Ativar RLS e criar políticas de isolamento ──────────

-- clientes
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Autenticados podem tudo em clientes"   ON clientes;
DROP POLICY IF EXISTS "usuarios_isolados_clientes"            ON clientes;
CREATE POLICY "usuarios_isolados_clientes" ON clientes
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- condominios
ALTER TABLE condominios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Autenticados podem tudo em condominios" ON condominios;
DROP POLICY IF EXISTS "usuarios_isolados_condominios"          ON condominios;
CREATE POLICY "usuarios_isolados_condominios" ON condominios
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- trabalhos
ALTER TABLE trabalhos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Autenticados podem tudo em trabalhos" ON trabalhos;
DROP POLICY IF EXISTS "usuarios_isolados_trabalhos"          ON trabalhos;
CREATE POLICY "usuarios_isolados_trabalhos" ON trabalhos
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- orcamentos
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Autenticados podem tudo em orcamentos" ON orcamentos;
DROP POLICY IF EXISTS "usuarios_isolados_orcamentos"          ON orcamentos;
CREATE POLICY "usuarios_isolados_orcamentos" ON orcamentos
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- orcamento_itens
ALTER TABLE orcamento_itens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Autenticados podem tudo em orcamento_itens" ON orcamento_itens;
DROP POLICY IF EXISTS "usuarios_isolados_orcamento_itens"          ON orcamento_itens;
CREATE POLICY "usuarios_isolados_orcamento_itens" ON orcamento_itens
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- funcionarios
ALTER TABLE funcionarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Autenticados podem tudo em funcionarios" ON funcionarios;
DROP POLICY IF EXISTS "usuarios_isolados_funcionarios"          ON funcionarios;
CREATE POLICY "usuarios_isolados_funcionarios" ON funcionarios
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ferramentas
ALTER TABLE ferramentas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Autenticados podem tudo em ferramentas" ON ferramentas;
DROP POLICY IF EXISTS "usuarios_isolados_ferramentas"          ON ferramentas;
CREATE POLICY "usuarios_isolados_ferramentas" ON ferramentas
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- catalogo_servicos
ALTER TABLE catalogo_servicos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Autenticados podem tudo em catalogo_servicos" ON catalogo_servicos;
DROP POLICY IF EXISTS "usuarios_isolados_catalogo_servicos"          ON catalogo_servicos;
CREATE POLICY "usuarios_isolados_catalogo_servicos" ON catalogo_servicos
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ponto_diario
ALTER TABLE ponto_diario ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Autenticados podem tudo em ponto_diario" ON ponto_diario;
DROP POLICY IF EXISTS "usuarios_isolados_ponto_diario"          ON ponto_diario;
CREATE POLICY "usuarios_isolados_ponto_diario" ON ponto_diario
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── 7.1 Função de código OS automático ──────────────────────
CREATE OR REPLACE FUNCTION next_os_code(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_year TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
  v_seq  INT;
BEGIN
  SELECT COUNT(*) + 1 INTO v_seq
  FROM trabalhos
  WHERE user_id = p_user_id
    AND EXTRACT(YEAR FROM criado_em) = EXTRACT(YEAR FROM NOW());
  RETURN 'OS-' || v_year || '-' || LPAD(v_seq::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- ── Verificação final ────────────────────────────────────────
SELECT schemaname, tablename, rowsecurity AS rls_ativo
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
