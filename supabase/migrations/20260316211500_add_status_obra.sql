
-- Adiciona o campo status_obra na tabela trabalhos
ALTER TABLE public.trabalhos 
  ADD COLUMN IF NOT EXISTS status_obra text NOT NULL DEFAULT 'aguardando';

-- Garante que apenas valores válidos são aceitos
ALTER TABLE public.trabalhos
  ADD CONSTRAINT trabalhos_status_obra_check 
  CHECK (status_obra IN ('aguardando', 'em_andamento', 'concluido', 'cancelado'));
