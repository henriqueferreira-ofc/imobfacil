CREATE TABLE public.locacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  imovel text NOT NULL DEFAULT '',
  proprietario text NOT NULL DEFAULT '',
  locatario text NOT NULL DEFAULT '',
  valor_aluguel numeric NOT NULL DEFAULT 0,
  garantia text NOT NULL DEFAULT '',
  inicio_contrato date,
  vencimento_dia integer NOT NULL DEFAULT 5,
  status_vistoria text NOT NULL DEFAULT 'em_analise',
  observacoes text NOT NULL DEFAULT '',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.locacoes TO authenticated;
GRANT ALL ON public.locacoes TO service_role;
ALTER TABLE public.locacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read locacoes" ON public.locacoes FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins insert locacoes" ON public.locacoes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update locacoes" ON public.locacoes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete locacoes" ON public.locacoes FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER locacoes_updated_at BEFORE UPDATE ON public.locacoes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.imoveis_administrados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  imovel text NOT NULL DEFAULT '',
  proprietario text NOT NULL DEFAULT '',
  responsavel text NOT NULL DEFAULT '',
  taxa_administracao numeric NOT NULL DEFAULT 0,
  repasse_previsto numeric NOT NULL DEFAULT 0,
  condominio_iptu text NOT NULL DEFAULT '',
  manutencao_aberta text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'em_analise',
  observacoes text NOT NULL DEFAULT '',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.imoveis_administrados TO authenticated;
GRANT ALL ON public.imoveis_administrados TO service_role;
ALTER TABLE public.imoveis_administrados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read imoveis_adm" ON public.imoveis_administrados FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins insert imoveis_adm" ON public.imoveis_administrados FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update imoveis_adm" ON public.imoveis_administrados FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete imoveis_adm" ON public.imoveis_administrados FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER imoveis_adm_updated_at BEFORE UPDATE ON public.imoveis_administrados FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();