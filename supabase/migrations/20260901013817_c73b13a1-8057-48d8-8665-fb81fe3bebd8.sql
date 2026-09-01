DROP FUNCTION IF EXISTS public.consultar_locacao(text);

CREATE OR REPLACE FUNCTION public.consultar_locacao(p_codigo text)
RETURNS TABLE(
  codigo text, imovel text, endereco text, numero_casa text, bairro text, cep text, cidade text, estado text,
  corretor text, proprietario text, proprietario_email text, proprietario_celular text,
  proprietario_profissao text, proprietario_estado_civil text, proprietario_rg text,
  proprietario_orgao_expedidor text, proprietario_cpf text, proprietario_contato_referencia text,
  proprietario_doc_tipo text,
  locatario text, locatario_tipo_pessoa text, locatario_profissao text, locatario_estado_civil text,
  locatario_email text, locatario_celular text, locatario_rg text, locatario_orgao_expedidor text,
  locatario_cpf text, locatario_contato_referencia text, locatario_doc_tipo text,
  empresa_nome text, empresa_cnpj text, empresa_insc_estadual text, empresa_endereco text,
  empresa_bairro text, empresa_cidade text, empresa_estado text,
  resp_nome text, resp_estado_civil text, resp_profissao text, resp_rg text, resp_orgao_expedidor text,
  resp_cpf text, resp_email text, resp_celular text, resp_contato_referencia text, resp_doc_tipo text,
  descricao_imovel text, tipo_locacao text, prazo text, administracao boolean,
  valor_aluguel numeric, garantia text, garantia_caucao boolean, valor_caucao numeric,
  inicio_contrato date, data_pagamento date, vencimento_dia integer, status_vistoria text,
  observacoes text, doc_negociacao_nome text, doc_negociacao_url text,
  created_at timestamptz, updated_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  SELECT l.codigo, l.imovel, l.endereco, l.numero_casa, l.bairro, l.cep, l.cidade, l.estado,
    l.corretor, l.proprietario, l.proprietario_email, l.proprietario_celular,
    l.proprietario_profissao, l.proprietario_estado_civil, l.proprietario_rg,
    l.proprietario_orgao_expedidor, l.proprietario_cpf, l.proprietario_contato_referencia,
    l.proprietario_doc_tipo,
    l.locatario, l.locatario_tipo_pessoa, l.locatario_profissao, l.locatario_estado_civil,
    l.locatario_email, l.locatario_celular, l.locatario_rg, l.locatario_orgao_expedidor,
    l.locatario_cpf, l.locatario_contato_referencia, l.locatario_doc_tipo,
    l.empresa_nome, l.empresa_cnpj, l.empresa_insc_estadual, l.empresa_endereco,
    l.empresa_bairro, l.empresa_cidade, l.empresa_estado,
    l.resp_nome, l.resp_estado_civil, l.resp_profissao, l.resp_rg, l.resp_orgao_expedidor,
    l.resp_cpf, l.resp_email, l.resp_celular, l.resp_contato_referencia, l.resp_doc_tipo,
    l.descricao_imovel, l.tipo_locacao, l.prazo, l.administracao,
    l.valor_aluguel, l.garantia, l.garantia_caucao, l.valor_caucao,
    l.inicio_contrato, l.data_pagamento, l.vencimento_dia, l.status_vistoria,
    l.observacoes, l.doc_negociacao_nome, l.doc_negociacao_url,
    l.created_at, l.updated_at
  FROM public.locacoes l
  WHERE upper(trim(l.codigo)) = upper(trim(p_codigo))
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.consultar_locacao(text) TO anon, authenticated;