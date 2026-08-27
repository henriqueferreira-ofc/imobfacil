ALTER TABLE public.protocolos
  ADD COLUMN IF NOT EXISTS corretor text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS contrato text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS banco text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS matricula_doc_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cif_doc_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS contrato_doc_url text NOT NULL DEFAULT '';

DROP FUNCTION IF EXISTS public.consultar_protocolo(text);

CREATE FUNCTION public.consultar_protocolo(p_numero text)
 RETURNS TABLE(numero text, vendedores text, compradores text, imovel text, corretor text, endereco text, numero_casa text, bairro text, cep text, cidade text, estado text, matricula text, cif text, contrato text, banco text, matricula_doc_url text, cif_doc_url text, contrato_doc_url text, tipo_imovel text, tipo_negociacao text, status text, historico text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT p.numero, p.vendedores, p.compradores, p.imovel, p.corretor,
         p.endereco, p.numero_casa, p.bairro, p.cep, p.cidade, p.estado,
         p.matricula, p.cif, p.contrato, p.banco,
         p.matricula_doc_url, p.cif_doc_url, p.contrato_doc_url,
         p.tipo_imovel, p.tipo_negociacao, p.status, p.historico, p.created_at, p.updated_at
  FROM public.protocolos p
  WHERE upper(trim(p.numero)) = upper(trim(p_numero))
  LIMIT 1;
$function$;