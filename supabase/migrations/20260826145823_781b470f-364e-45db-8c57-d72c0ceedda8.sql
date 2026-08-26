ALTER TABLE public.locacoes
  ADD COLUMN IF NOT EXISTS endereco text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS numero_casa text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS bairro text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cep text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cidade text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS estado text NOT NULL DEFAULT '';

UPDATE public.locacoes SET endereco = imovel WHERE endereco = '' AND imovel <> '';