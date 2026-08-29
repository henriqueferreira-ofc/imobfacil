CREATE SEQUENCE IF NOT EXISTS public.locacao_seq START 1001;
GRANT USAGE ON SEQUENCE public.locacao_seq TO authenticated, anon, service_role;

ALTER TABLE public.locacoes
  ADD COLUMN IF NOT EXISTS codigo text,
  ADD COLUMN IF NOT EXISTS administracao boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS proprietario_email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS proprietario_celular text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS proprietario_doc_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS locatario_tipo_pessoa text NOT NULL DEFAULT 'fisica',
  ADD COLUMN IF NOT EXISTS locatario_profissao text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS locatario_estado_civil text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS locatario_email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS locatario_celular text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS locatario_doc_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS descricao_imovel text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS tipo_locacao text NOT NULL DEFAULT 'residencial',
  ADD COLUMN IF NOT EXISTS prazo text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS endereco text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS numero_casa text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS bairro text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cep text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cidade text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS estado text NOT NULL DEFAULT '';

ALTER TABLE public.locacoes
  ALTER COLUMN codigo SET DEFAULT ('LOC-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.locacao_seq')::text, 4, '0'));

UPDATE public.locacoes
SET codigo = 'LOC-' || to_char(COALESCE(created_at, now()), 'YYYY') || '-' || lpad(nextval('public.locacao_seq')::text, 4, '0')
WHERE codigo IS NULL OR codigo = '';

CREATE UNIQUE INDEX IF NOT EXISTS locacoes_codigo_key ON public.locacoes (codigo);

ALTER TABLE public.locacoes
  ALTER COLUMN codigo SET NOT NULL;

DROP FUNCTION IF EXISTS public.consultar_locacao(text);
DROP FUNCTION IF EXISTS public.cadastrar_locacao_publica(jsonb);

CREATE FUNCTION public.consultar_locacao(p_codigo text)
 RETURNS TABLE(
  codigo text,
  imovel text,
  endereco text,
  numero_casa text,
  bairro text,
  cep text,
  cidade text,
  estado text,
  locatario_tipo_pessoa text,
  proprietario text,
  proprietario_email text,
  proprietario_celular text,
  proprietario_doc_url text,
  locatario text,
  locatario_profissao text,
  locatario_estado_civil text,
  locatario_email text,
  locatario_celular text,
  locatario_doc_url text,
  descricao_imovel text,
  tipo_locacao text,
  prazo text,
  administracao boolean,
  valor_aluguel numeric,
  inicio_contrato date,
  vencimento_dia integer,
  status_vistoria text,
  observacoes text,
  created_at timestamptz,
  updated_at timestamptz
 )
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT l.codigo, l.imovel, l.endereco, l.numero_casa, l.bairro, l.cep, l.cidade, l.estado,
         l.locatario_tipo_pessoa, l.proprietario, l.proprietario_email, l.proprietario_celular,
         l.proprietario_doc_url, l.locatario, l.locatario_profissao, l.locatario_estado_civil,
         l.locatario_email, l.locatario_celular, l.locatario_doc_url, l.descricao_imovel,
         l.tipo_locacao, l.prazo, l.administracao, l.valor_aluguel, l.inicio_contrato,
         l.vencimento_dia, l.status_vistoria, l.observacoes, l.created_at, l.updated_at
  FROM public.locacoes l
  WHERE upper(trim(l.codigo)) = upper(trim(p_codigo))
  LIMIT 1;
$function$;

CREATE FUNCTION public.cadastrar_locacao_publica(p_payload jsonb)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  novo_codigo text;
BEGIN
  INSERT INTO public.locacoes (
    endereco,
    numero_casa,
    bairro,
    cep,
    cidade,
    estado,
    locatario_tipo_pessoa,
    proprietario,
    proprietario_email,
    proprietario_celular,
    proprietario_doc_url,
    locatario,
    locatario_profissao,
    locatario_estado_civil,
    locatario_email,
    locatario_celular,
    locatario_doc_url,
    descricao_imovel,
    tipo_locacao,
    prazo,
    administracao,
    valor_aluguel,
    inicio_contrato,
    vencimento_dia,
    status_vistoria,
    observacoes
  )
  VALUES (
    COALESCE(p_payload->>'endereco', ''),
    COALESCE(p_payload->>'numero_casa', ''),
    COALESCE(p_payload->>'bairro', ''),
    COALESCE(p_payload->>'cep', ''),
    COALESCE(p_payload->>'cidade', ''),
    COALESCE(p_payload->>'estado', ''),
    COALESCE(p_payload->>'locatario_tipo_pessoa', 'fisica'),
    COALESCE(p_payload->>'proprietario', ''),
    COALESCE(p_payload->>'proprietario_email', ''),
    COALESCE(p_payload->>'proprietario_celular', ''),
    COALESCE(p_payload->>'proprietario_doc_url', ''),
    COALESCE(p_payload->>'locatario', ''),
    COALESCE(p_payload->>'locatario_profissao', ''),
    COALESCE(p_payload->>'locatario_estado_civil', ''),
    COALESCE(p_payload->>'locatario_email', ''),
    COALESCE(p_payload->>'locatario_celular', ''),
    COALESCE(p_payload->>'locatario_doc_url', ''),
    COALESCE(p_payload->>'descricao_imovel', ''),
    COALESCE(p_payload->>'tipo_locacao', 'residencial'),
    COALESCE(p_payload->>'prazo', ''),
    COALESCE((p_payload->>'administracao')::boolean, false),
    COALESCE(NULLIF(p_payload->>'valor_aluguel', '')::numeric, 0),
    NULLIF(p_payload->>'inicio_contrato', '')::date,
    COALESCE(NULLIF(p_payload->>'vencimento_dia', '')::integer, 4),
    COALESCE(p_payload->>'status_vistoria', 'em_analise'),
    COALESCE(p_payload->>'observacoes', '')
  )
  RETURNING codigo INTO novo_codigo;

  RETURN novo_codigo;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.consultar_locacao(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cadastrar_locacao_publica(jsonb) TO anon, authenticated;

INSERT INTO storage.buckets (id, name, public)
VALUES ('protocolo-docs', 'protocolo-docs', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public insert locacao docs" ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'protocolo-docs' AND name LIKE 'locacoes/%');
CREATE POLICY "public read own locacao docs by path" ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'protocolo-docs' AND name LIKE 'locacoes/%');
