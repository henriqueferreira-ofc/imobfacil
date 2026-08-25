-- roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name'), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- protocol number sequence
CREATE SEQUENCE public.protocolo_seq START 1001;

CREATE TABLE public.protocolos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero text NOT NULL UNIQUE DEFAULT ('PRT-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.protocolo_seq')::text, 4, '0')),
  vendedores text NOT NULL DEFAULT '',
  compradores text NOT NULL DEFAULT '',
  imovel text NOT NULL DEFAULT '',
  matricula text NOT NULL DEFAULT '',
  cif text NOT NULL DEFAULT '',
  tipo_imovel text NOT NULL DEFAULT 'casa',
  tipo_negociacao text NOT NULL DEFAULT 'a_vista',
  status text NOT NULL DEFAULT 'em_andamento',
  historico text NOT NULL DEFAULT '',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.protocolos TO authenticated;
GRANT ALL ON public.protocolos TO service_role;
GRANT USAGE ON SEQUENCE public.protocolo_seq TO authenticated, service_role;
ALTER TABLE public.protocolos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read protocolos" ON public.protocolos FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins insert protocolos" ON public.protocolos FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update protocolos" ON public.protocolos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete protocolos" ON public.protocolos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER protocolos_updated_at BEFORE UPDATE ON public.protocolos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- public lookup by exact protocol number (no listing possible)
CREATE OR REPLACE FUNCTION public.consultar_protocolo(p_numero text)
RETURNS TABLE (
  numero text, vendedores text, compradores text, imovel text, matricula text,
  cif text, tipo_imovel text, tipo_negociacao text, status text, historico text,
  created_at timestamptz, updated_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.numero, p.vendedores, p.compradores, p.imovel, p.matricula, p.cif,
         p.tipo_imovel, p.tipo_negociacao, p.status, p.historico, p.created_at, p.updated_at
  FROM public.protocolos p
  WHERE upper(trim(p.numero)) = upper(trim(p_numero))
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.consultar_protocolo(text) TO anon, authenticated;

-- demo rows
INSERT INTO public.protocolos (numero, vendedores, compradores, imovel, matricula, cif, tipo_imovel, tipo_negociacao, status, historico) VALUES
('PRT-2026-1001', 'João Batista Silva e Maria Silva', 'Carlos Eduardo Nunes', 'Residencial Jardim das Acácias, Quadra 12, Lote 08 - Goiânia/GO', '104.552', 'CIF-88231', 'casa', 'financiamento', 'em_andamento', E'25/08/2026 - Proposta aceita pelo vendedor.\n26/08/2026 - Documentação do comprador enviada ao banco.\n27/08/2026 - Avaliação do imóvel agendada.'),
('PRT-2026-1002', 'Construtora Alvorada LTDA', 'Fernanda Rocha Lima', 'Loteamento Portal do Sol, Quadra 3, Lote 21 - Aparecida de Goiânia/GO', '87.320', 'CIF-77410', 'lote', 'a_vista', 'concluido', E'12/08/2026 - Sinal pago.\n20/08/2026 - Escritura lavrada e registrada.'),
('PRT-2026-1003', 'Ricardo Almeida', 'Patrícia e Douglas Moreira', 'Edifício Vista Verde, Apto 902 - Setor Bueno, Goiânia/GO', '215.089', 'CIF-91045', 'apartamento', 'agio', 'em_analise', E'22/08/2026 - Negociação de ágio iniciada.\n24/08/2026 - Análise de saldo devedor junto à Caixa.');

SELECT setval('public.protocolo_seq', 1003);