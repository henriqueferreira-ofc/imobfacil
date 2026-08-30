ALTER TABLE public.locacoes
  ADD COLUMN IF NOT EXISTS proprietario_profissao text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS proprietario_estado_civil text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS proprietario_rg text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS proprietario_orgao_expedidor text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS proprietario_cpf text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS proprietario_contato_referencia text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS proprietario_doc_tipo text NOT NULL DEFAULT 'rg',
  ADD COLUMN IF NOT EXISTS proprietario_comp_residencia_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS proprietario_comp_renda_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS locatario_rg text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS locatario_orgao_expedidor text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS locatario_cpf text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS locatario_contato_referencia text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS locatario_doc_tipo text NOT NULL DEFAULT 'rg',
  ADD COLUMN IF NOT EXISTS locatario_comp_residencia_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS locatario_comp_renda_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS empresa_nome text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS empresa_cnpj text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS empresa_insc_estadual text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS empresa_endereco text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS empresa_bairro text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS empresa_cidade text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS empresa_estado text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS empresa_cartao_cnpj_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS empresa_comp_residencia_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS empresa_outros_doc_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS resp_nome text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS resp_estado_civil text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS resp_profissao text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS resp_rg text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS resp_orgao_expedidor text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS resp_cpf text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS resp_email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS resp_celular text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS resp_contato_referencia text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS resp_doc_tipo text NOT NULL DEFAULT 'rg',
  ADD COLUMN IF NOT EXISTS resp_doc_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS resp_comp_residencia_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS resp_comp_renda_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS imovel_conta_energia_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS imovel_conta_agua_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS imovel_outros_doc_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS garantia_caucao boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS valor_caucao numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS data_pagamento date;

CREATE OR REPLACE FUNCTION public.cadastrar_locacao_publica(p_payload jsonb)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_codigo text;
  v_id uuid;
  v_key text;
  v_allowed text[] := ARRAY[
    'endereco','numero_casa','bairro','cep','cidade','estado',
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
    'imovel_conta_energia_url','imovel_conta_agua_url','imovel_outros_doc_url',
    'descricao_imovel','tipo_locacao','prazo','administracao','valor_aluguel',
    'garantia_caucao','valor_caucao','inicio_contrato','data_pagamento',
    'vencimento_dia','status_vistoria','observacoes'
  ];
BEGIN
  INSERT INTO public.locacoes DEFAULT VALUES RETURNING id, codigo INTO v_id, v_codigo;

  FOR v_key IN SELECT jsonb_object_keys(p_payload) LOOP
    IF v_key = ANY(v_allowed) THEN
      EXECUTE format(
        'UPDATE public.locacoes SET %I = $1 WHERE id = $2',
        v_key
      ) USING nullif(p_payload->>v_key, '')::text, v_id;
    END IF;
  END LOOP;

  RETURN v_codigo;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cadastrar_locacao_publica(jsonb) TO anon, authenticated;