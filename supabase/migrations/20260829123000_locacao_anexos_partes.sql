ALTER TABLE public.locacoes
  ADD COLUMN IF NOT EXISTS proprietario_doc_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS locatario_doc_url text NOT NULL DEFAULT '';
