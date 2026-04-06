
CREATE TABLE public.orcamentos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero serial NOT NULL,
  titulo text NOT NULL,
  descricao text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'rascunho',
  data_emissao date NOT NULL DEFAULT CURRENT_DATE,
  validade date,
  valor numeric NOT NULL DEFAULT 0,
  observacoes text NOT NULL DEFAULT '',
  condominio_id uuid REFERENCES public.condominios(id),
  cliente_id uuid REFERENCES public.contatos(id),
  sindico_id uuid REFERENCES public.contatos(id),
  endereco_obra text NOT NULL DEFAULT '',
  motivo_recusa text NOT NULL DEFAULT '',
  data_aprovacao date,
  trabalho_id uuid REFERENCES public.trabalhos(id),
  criado_em timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users orcamentos SELECT" ON public.orcamentos FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users orcamentos INSERT" ON public.orcamentos FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users orcamentos UPDATE" ON public.orcamentos FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users orcamentos DELETE" ON public.orcamentos FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);
