-- Storage: tighten anonymous uploads for the public locacao form
DROP POLICY IF EXISTS "public insert locacao docs" ON storage.objects;
DROP POLICY IF EXISTS "public read locacao docs publicos" ON storage.objects;

CREATE POLICY "public insert locacao docs"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'protocolo-docs'
  AND name ~* '^locacoes/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|png|jpg|jpeg|webp|heic|doc|docx)$'
);

-- Public downloads only for files actually referenced by a locacao record
CREATE POLICY "public read locacao docs publicos"
ON storage.objects FOR SELECT TO anon, authenticated
USING (
  bucket_id = 'protocolo-docs'
  AND public.is_locacao_doc_publico(name)
);

-- user_roles: read-only for the owner, no writes from the Data API
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon, authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
