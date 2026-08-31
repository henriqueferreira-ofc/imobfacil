CREATE POLICY "authenticated insert locacao docs" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'protocolo-docs' AND name LIKE 'locacoes/%');

CREATE POLICY "authenticated read locacao docs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'protocolo-docs' AND name LIKE 'locacoes/%');
