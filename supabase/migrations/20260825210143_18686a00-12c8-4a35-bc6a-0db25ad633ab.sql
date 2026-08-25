ALTER TABLE public.protocolos
  ADD COLUMN IF NOT EXISTS endereco text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS numero_casa text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS bairro text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cep text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cidade text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS estado text NOT NULL DEFAULT '';

DROP FUNCTION IF EXISTS public.consultar_protocolo(text);

CREATE FUNCTION public.consultar_protocolo(p_numero text)
 RETURNS TABLE(numero text, vendedores text, compradores text, imovel text, endereco text, numero_casa text, bairro text, cep text, cidade text, estado text, matricula text, cif text, tipo_imovel text, tipo_negociacao text, status text, historico text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT p.numero, p.vendedores, p.compradores, p.imovel,
         p.endereco, p.numero_casa, p.bairro, p.cep, p.cidade, p.estado,
         p.matricula, p.cif,
         p.tipo_imovel, p.tipo_negociacao, p.status, p.historico, p.created_at, p.updated_at
  FROM public.protocolos p
  WHERE upper(trim(p.numero)) = upper(trim(p_numero))
  LIMIT 1;
$function$;