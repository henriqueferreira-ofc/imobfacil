CREATE SEQUENCE IF NOT EXISTS public.locacao_seq START 1001;

ALTER TABLE public.locacoes ADD COLUMN IF NOT EXISTS codigo text NOT NULL DEFAULT ((('LOC-'::text || to_char(now(), 'YYYY'::text)) || '-'::text) || lpad((nextval('public.locacao_seq'::regclass))::text, 4, '0'::text));

-- Garante código para registros já existentes
UPDATE public.locacoes SET codigo = DEFAULT WHERE codigo = '';

CREATE UNIQUE INDEX IF NOT EXISTS locacoes_codigo_key ON public.locacoes (codigo);

-- Consulta pública por código (sem expor a tabela inteira)
CREATE OR REPLACE FUNCTION public.consultar_locacao(p_codigo text)
RETURNS TABLE(
  codigo text, imovel text, endereco text, numero_casa text, bairro text,
  cep text, cidade text, estado text, proprietario text, proprietario_email text,
  proprietario_celular text, locatario text, locatario_tipo_pessoa text,
  locatario_profissao text, locatario_estado_civil text, locatario_email text,
  locatario_celular text, descricao_imovel text, tipo_locacao text, prazo text,
  administracao boolean, valor_aluguel numeric, garantia text,
  inicio_contrato date, vencimento_dia integer, status_vistoria text,
  observacoes text, created_at timestamptz, updated_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT l.codigo, l.imovel, l.endereco, l.numero_casa, l.bairro,
         l.cep, l.cidade, l.estado, l.proprietario, l.proprietario_email,
         l.proprietario_celular, l.locatario, l.locatario_tipo_pessoa,
         l.locatario_profissao, l.locatario_estado_civil, l.locatario_email,
         l.locatario_celular, l.descricao_imovel, l.tipo_locacao, l.prazo,
         l.administracao, l.valor_aluguel, l.garantia,
         l.inicio_contrato, l.vencimento_dia, l.status_vistoria,
         l.observacoes, l.created_at, l.updated_at
  FROM public.locacoes l
  WHERE upper(trim(l.codigo)) = upper(trim(p_codigo))
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.consultar_locacao(text) TO anon, authenticated;

-- Cadastro público de locação (retorna o código gerado)
CREATE OR REPLACE FUNCTION public.cadastrar_locacao_publica(p_payload jsonb)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_codigo text;
BEGIN
  INSERT INTO public.locacoes (
    endereco, numero_casa, bairro, cep, cidade, estado,
    locatario_tipo_pessoa, proprietario, proprietario_email, proprietario_celular,
    proprietario_doc_url, locatario, locatario_profissao, locatario_estado_civil,
    locatario_email, locatario_celular, locatario_doc_url, descricao_imovel,
    tipo_locacao, prazo, administracao, valor_aluguel, inicio_contrato,
    vencimento_dia, status_vistoria, observacoes
  ) VALUES (
    coalesce(p_payload->>'endereco',''), coalesce(p_payload->>'numero_casa',''),
    coalesce(p_payload->>'bairro',''), coalesce(p_payload->>'cep',''),
    coalesce(p_payload->>'cidade',''), coalesce(p_payload->>'estado',''),
    coalesce(p_payload->>'locatario_tipo_pessoa','fisica'),
    coalesce(p_payload->>'proprietario',''), coalesce(p_payload->>'proprietario_email',''),
    coalesce(p_payload->>'proprietario_celular',''), coalesce(p_payload->>'proprietario_doc_url',''),
    coalesce(p_payload->>'locatario',''), coalesce(p_payload->>'locatario_profissao',''),
    coalesce(p_payload->>'locatario_estado_civil',''), coalesce(p_payload->>'locatario_email',''),
    coalesce(p_payload->>'locatario_celular',''), coalesce(p_payload->>'locatario_doc_url',''),
    coalesce(p_payload->>'descricao_imovel',''), coalesce(p_payload->>'tipo_locacao','residencial'),
    coalesce(p_payload->>'prazo',''), coalesce((p_payload->>'administracao')::boolean, false),
    coalesce((p_payload->>'valor_aluguel')::numeric, 0),
    nullif(p_payload->>'inicio_contrato','')::date,
    coalesce((p_payload->>'vencimento_dia')::integer, 5),
    coalesce(p_payload->>'status_vistoria','em_analise'),
    coalesce(p_payload->>'observacoes','')
  )
  RETURNING codigo INTO v_codigo;
  RETURN v_codigo;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cadastrar_locacao_publica(jsonb) TO anon, authenticated;