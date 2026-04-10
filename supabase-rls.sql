-- ============================================================
-- RLS (Row Level Security) — CRM PratesPaiva
-- Execute isso no Supabase → SQL Editor
-- Política: qualquer usuário autenticado tem acesso total.
-- Isso bloqueia acesso anônimo (sem login) a todos os dados.
-- ============================================================

-- ── clientes ────────────────────────────────────────────────
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Autenticados podem tudo em clientes" ON clientes;
CREATE POLICY "Autenticados podem tudo em clientes"
  ON clientes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ── condominios ─────────────────────────────────────────────
ALTER TABLE condominios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Autenticados podem tudo em condominios" ON condominios;
CREATE POLICY "Autenticados podem tudo em condominios"
  ON condominios FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ── trabalhos ───────────────────────────────────────────────
ALTER TABLE trabalhos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Autenticados podem tudo em trabalhos" ON trabalhos;
CREATE POLICY "Autenticados podem tudo em trabalhos"
  ON trabalhos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ── orcamentos ──────────────────────────────────────────────
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Autenticados podem tudo em orcamentos" ON orcamentos;
CREATE POLICY "Autenticados podem tudo em orcamentos"
  ON orcamentos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ── orcamento_itens ─────────────────────────────────────────
ALTER TABLE orcamento_itens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Autenticados podem tudo em orcamento_itens" ON orcamento_itens;
CREATE POLICY "Autenticados podem tudo em orcamento_itens"
  ON orcamento_itens FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ── funcionarios ────────────────────────────────────────────
ALTER TABLE funcionarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Autenticados podem tudo em funcionarios" ON funcionarios;
CREATE POLICY "Autenticados podem tudo em funcionarios"
  ON funcionarios FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ── ferramentas ─────────────────────────────────────────────
ALTER TABLE ferramentas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Autenticados podem tudo em ferramentas" ON ferramentas;
CREATE POLICY "Autenticados podem tudo em ferramentas"
  ON ferramentas FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ── catalogo_servicos ───────────────────────────────────────
ALTER TABLE catalogo_servicos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Autenticados podem tudo em catalogo_servicos" ON catalogo_servicos;
CREATE POLICY "Autenticados podem tudo em catalogo_servicos"
  ON catalogo_servicos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ── ponto_diario ────────────────────────────────────────────
ALTER TABLE ponto_diario ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Autenticados podem tudo em ponto_diario" ON ponto_diario;
CREATE POLICY "Autenticados podem tudo em ponto_diario"
  ON ponto_diario FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ── Verificação final ────────────────────────────────────────
-- Rode isso depois para confirmar que o RLS está ativo:
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_ativo
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
