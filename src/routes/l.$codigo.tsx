import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Building2 } from "lucide-react";
import { Wordmark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { formatarData, formatarDataHora, enderecoCompleto } from "@/lib/protocolos";
import { formatarMoeda, STATUS_VISTORIA_LABEL, type LocacaoPublica } from "@/lib/imoveis";

export const Route = createFileRoute("/l/$codigo")({
  head: ({ params }) => ({
    meta: [
      { title: `Locação ${params.codigo} — ImobFácil` },
      {
        name: "description",
        content: `Consulta pública da locação ${params.codigo}.`,
      },
      { property: "og:title", content: `Locação ${params.codigo} — ImobFácil` },
      {
        property: "og:description",
        content: "Consulta pública do cadastro de locação imobiliária.",
      },
    ],
  }),
  component: ConsultaLocacao,
});

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-eyebrow text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium break-words">{valor || "—"}</dd>
    </div>
  );
}

function ConsultaLocacao() {
  const { codigo } = Route.useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["locacao-publica", codigo],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("consultar_locacao", { p_codigo: codigo });
      if (error) throw error;
      return ((data as unknown as LocacaoPublica[] | null) ?? [])[0] ?? null;
    },
  });

  return (
    <div className="min-h-screen">
      <header className="mx-auto grid max-w-4xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 sm:px-6 sm:py-5">
        <Wordmark subtitle="Consulta pública" />
        <Button asChild variant="ghost" size="sm" className="shrink-0">
          <Link to="/">
            <ArrowLeft className="size-4" />
            Nova consulta
          </Link>
        </Button>
      </header>

      <main className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 sm:pb-20">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-28 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
          </div>
        ) : !data || isError ? (
          <div className="shadow-soft rounded-3xl border bg-card px-6 py-14 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
              <Building2 className="size-6" />
            </span>
            <h1 className="mt-5 text-xl font-semibold">Locação não encontrada</h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Não localizamos nenhum cadastro para <span className="font-medium">{codigo}</span>.
              Confira o código informado e tente novamente.
            </p>
            <Button asChild className="mt-6">
              <Link to="/">Tentar outro código</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <section className="bg-brand-gradient shadow-panel rounded-3xl px-5 py-6 text-primary-foreground sm:px-10 sm:py-8">
              <p className="text-eyebrow text-primary-foreground/70">Locação</p>
              <div className="mt-2 flex flex-col items-start gap-3 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4">
                <h1 className="font-display text-2xl font-bold break-all sm:truncate sm:break-normal sm:text-3xl lg:text-4xl">
                  {data.codigo}
                </h1>
                <span className="rounded-full bg-card px-3 py-1.5 text-sm font-semibold text-foreground">
                  {STATUS_VISTORIA_LABEL[data.status_vistoria] ?? data.status_vistoria}
                </span>
              </div>
              <p className="mt-3 text-sm text-primary-foreground/75">
                Aberta em {formatarDataHora(data.created_at)} • atualizada em{" "}
                {formatarDataHora(data.updated_at)}
              </p>
            </section>

            <section className="shadow-soft rounded-3xl border bg-card p-5 sm:p-8">
              <h2 className="text-base font-semibold">Partes envolvidas</h2>
              <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Campo label="Locador" valor={data.proprietario} />
                <Campo label="Locatário" valor={data.locatario} />
                <Campo label="E-mail do locador" valor={data.proprietario_email} />
                <Campo label="E-mail do locatário" valor={data.locatario_email} />
                <Campo label="Celular do locador" valor={data.proprietario_celular} />
                <Campo label="Celular do locatário" valor={data.locatario_celular} />
              </dl>
            </section>

            <section className="shadow-soft rounded-3xl border bg-card p-5 sm:p-8">
              <h2 className="text-base font-semibold">Dados do imóvel</h2>
              <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Campo label="Endereço" valor={enderecoCompleto(data)} />
                <Campo label="Descrição" valor={data.descricao_imovel} />
              </dl>
            </section>

            <section className="shadow-soft rounded-3xl border bg-card p-5 sm:p-8">
              <h2 className="text-base font-semibold">Dados da negociação</h2>
              <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Campo
                  label="Tipo de locação"
                  valor={data.tipo_locacao === "comercial" ? "Comercial" : "Residencial"}
                />
                <Campo label="Prazo" valor={data.prazo} />
                <Campo label="Valor do aluguel" valor={formatarMoeda(Number(data.valor_aluguel))} />
                <Campo
                  label="Início"
                  valor={data.inicio_contrato ? formatarData(data.inicio_contrato) : ""}
                />
                <Campo label="Vencimento" valor={`Dia ${data.vencimento_dia}`} />
                <Campo label="Administração" valor={data.administracao ? "Sim" : "Não"} />
              </dl>
            </section>

            {(data.doc_negociacao_nome || data.doc_negociacao_url) && (
              <section className="shadow-soft rounded-3xl border bg-card p-5 sm:p-8">
                <h2 className="text-base font-semibold">Documento da negociação</h2>
                <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-medium">{data.doc_negociacao_nome || "Documento"}</p>
                  {data.doc_negociacao_url ? (
                    <Button size="sm" onClick={() => void baixarDocumento(data.doc_negociacao_url)}>
                      <Download className="size-4" />
                      Baixar documento
                    </Button>
                  ) : null}
                </div>
              </section>
            )}

            <section className="shadow-soft rounded-3xl border bg-card p-5 sm:p-8">
              <h2 className="text-base font-semibold">Histórico e observações</h2>
              <p className="mt-3 text-sm whitespace-pre-line text-muted-foreground">
                {data.observacoes || "Nenhuma observação registrada até o momento."}
              </p>
            </section>

          </div>
        )}
      </main>
    </div>
  );
}
