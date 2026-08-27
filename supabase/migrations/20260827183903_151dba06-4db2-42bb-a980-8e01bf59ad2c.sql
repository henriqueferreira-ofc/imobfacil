CREATE POLICY "admins read protocolo docs" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'protocolo-docs' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins insert protocolo docs" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'protocolo-docs' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update protocolo docs" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'protocolo-docs' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'protocolo-docs' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete protocolo docs" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'protocolo-docs' AND public.has_role(auth.uid(), 'admin'));