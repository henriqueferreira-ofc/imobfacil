ALTER TABLE public.locacoes
  ADD COLUMN IF NOT EXISTS proprietario_email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS proprietario_celular text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS proprietario_doc_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS locatario_tipo_pessoa text NOT NULL DEFAULT 'fisica',
  ADD COLUMN IF NOT EXISTS locatario_profissao text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS locatario_estado_civil text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS locatario_email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS locatario_celular text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS locatario_doc_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS descricao_imovel text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS tipo_locacao text NOT NULL DEFAULT 'residencial',
  ADD COLUMN IF NOT EXISTS prazo text NOT NULL DEFAULT '';