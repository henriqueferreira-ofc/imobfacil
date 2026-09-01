ALTER TABLE public.locacoes
  ADD COLUMN IF NOT EXISTS doc_negociacao_nome text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS doc_negociacao_url text NOT NULL DEFAULT '';

-- anexos enviados pelo formulário público de locação
CREATE POLICY "public insert locacao docs"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'protocolo-docs' AND name LIKE 'locacoes/%');

-- somente o documento da negociação (prefixo publico/) pode ser lido por qualquer pessoa
CREATE POLICY "public read locacao docs publicos"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'protocolo-docs' AND name LIKE 'locacoes/publico/%');

DROP FUNCTION IF EXISTS public.consultar_locacao(text);

CREATE FUNCTION public.consultar_locacao(p_codigo text)
 RETURNS TABLE(codigo text, imovel text, endereco text, numero_casa text, bairro text, cep text, cidade text, estado text, proprietario text, proprietario_email text, proprietario_celular text, locatario text, locatario_tipo_pessoa text, locatario_profissao text, locatario_estado_civil text, locatario_email text, locatario_celular text, descricao_imovel text, tipo_locacao text, prazo text, administracao boolean, valor_aluguel numeric, garantia text, inicio_contrato date, vencimento_dia integer, status_vistoria text, observacoes text, doc_negociacao_nome text, doc_negociacao_url text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT l.codigo, l.imovel, l.endereco, l.numero_casa, l.bairro,
         l.cep, l.cidade, l.estado, l.proprietario, l.proprietario_email,
         l.proprietario_celular, l.locatario, l.locatario_tipo_pessoa,
         l.locatario_profissao, l.locatario_estado_civil, l.locatario_email,
         l.locatario_celular, l.descricao_imovel, l.tipo_locacao, l.prazo,
         l.administracao, l.valor_aluguel, l.garantia,
         l.inicio_contrato, l.vencimento_dia, l.status_vistoria,
         l.observacoes, l.doc_negociacao_nome, l.doc_negociacao_url,
         l.created_at, l.updated_at
  FROM public.locacoes l
  WHERE upper(trim(l.codigo)) = upper(trim(p_codigo))
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.cadastrar_locacao_publica(p_payload jsonb)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_codigo text;
  v_id uuid;
  v_key text;
  v_val text;
  v_type text;
  v_allowed text[] := ARRAY[
    'endereco','numero_casa','bairro','cep','cidade','estado','corretor',
    'proprietario','proprietario_email','proprietario_celular','proprietario_doc_url',
    'proprietario_profissao','proprietario_estado_civil','proprietario_rg',
    'proprietario_orgao_expedidor','proprietario_cpf','proprietario_contato_referencia',
    'proprietario_doc_tipo','proprietario_comp_residencia_url','proprietario_comp_renda_url',
    'locatario_tipo_pessoa','locatario','locatario_profissao','locatario_estado_civil',
    'locatario_email','locatario_celular','locatario_doc_url','locatario_rg',
    'locatario_orgao_expedidor','locatario_cpf','locatario_contato_referencia',
    'locatario_doc_tipo','locatario_comp_residencia_url','locatario_comp_renda_url',
    'empresa_nome','empresa_cnpj','empresa_insc_estadual','empresa_endereco','empresa_bairro',
    'empresa_cidade','empresa_estado','empresa_cartao_cnpj_url','empresa_comp_residencia_url',
    'empresa_outros_doc_url',
    'resp_nome','resp_estado_civil','resp_profissao','resp_rg','resp_orgao_expedidor','resp_cpf',
    'resp_email','resp_celular','resp_contato_referencia','resp_doc_tipo','resp_doc_url',
    'resp_comp_residencia_url','resp_comp_renda_url',
    'imovel','imovel_conta_energia_url','imovel_conta_agua_url','imovel_outros_doc_url',
    'descricao_imovel','tipo_locacao','prazo','administracao','valor_aluguel',
    'garantia','garantia_caucao','valor_caucao','inicio_contrato','data_pagamento',
    'vencimento_dia','status_vistoria','observacoes',
    'doc_negociacao_nome','doc_negociacao_url'
  ];
BEGIN
  INSERT INTO public.locacoes DEFAULT VALUES RETURNING id, codigo INTO v_id, v_codigo;

  FOR v_key IN SELECT jsonb_object_keys(p_payload) LOOP
    IF v_key = ANY(v_allowed) THEN
      v_val := nullif(p_payload->>v_key, '');
      IF v_val IS NOT NULL THEN
        SELECT format_type(a.atttypid, a.atttypmod) INTO v_type
        FROM pg_attribute a
        WHERE a.attrelid = 'public.locacoes'::regclass
          AND a.attname = v_key
          AND a.attnum > 0;

        EXECUTE format('UPDATE public.locacoes SET %I = $1::%s WHERE id = $2', v_key, v_type)
          USING v_val, v_id;
      END IF;
    END IF;
  END LOOP;

  RETURN v_codigo;
END;
$function$;