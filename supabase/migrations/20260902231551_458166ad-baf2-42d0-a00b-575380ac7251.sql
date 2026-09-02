-- 1. Helper: only files actually linked to a locacao's public negotiation doc are readable
CREATE OR REPLACE FUNCTION public.is_locacao_doc_publico(_path text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.locacoes WHERE doc_negociacao_url = _path
  )
$$;

REVOKE ALL ON FUNCTION public.is_locacao_doc_publico(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_locacao_doc_publico(text) TO anon, authenticated;

-- 2. Tighten anonymous uploads: generated UUID filenames + allowed extensions only
DROP POLICY IF EXISTS "public insert locacao docs" ON storage.objects;
CREATE POLICY "public insert locacao docs"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'protocolo-docs'
  AND name ~* '^locacoes/(publico/)?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|png|jpg|jpeg|webp|heic|doc|docx)$'
);

-- 3. Public reads only for the negotiation document tied to an existing locacao
DROP POLICY IF EXISTS "public read locacao docs publicos" ON storage.objects;
CREATE POLICY "public read locacao docs publicos"
ON storage.objects FOR SELECT TO anon, authenticated
USING (
  bucket_id = 'protocolo-docs'
  AND name LIKE 'locacoes/publico/%'
  AND public.is_locacao_doc_publico(name)
);

-- 4. Remove blanket PUBLIC execute on the SECURITY DEFINER RPCs
REVOKE ALL ON FUNCTION public.consultar_protocolo(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.consultar_locacao(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cadastrar_locacao_publica(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consultar_protocolo(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consultar_locacao(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cadastrar_locacao_publica(jsonb) TO anon, authenticated;

-- 5. Trigger-only / internal definer functions must not be callable from the API
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.assign_initial_role() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;