import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileSearch } from "lucide-react";
import { StatusBadge, Wordmark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import {
  formatarDataHora,
  TIPO_IMOVEL_LABEL,
  TIPO_NEGOCIACAO_LABEL,
  type ProtocoloPublico,
} from "@/lib/protocolos";

export const Route = createFileRoute("/p/$numero")({
  head: ({ params }) => ({
    meta: [
      { title: `Protocolo ${params.numero} — ImobFácil` },
      {
        name: "description",
        content: `Andamento da negociação registrada no protocolo ${params.numero}.`,
      },
      { property: "og:title", content: `Protocolo ${params.numero} — ImobFácil` },
      {
        property: "og:description",
        content: "Consulta pública do andamento da negociação imobiliária.",
      },
    ],
  }),
  component: ConsultaProtocolo,
});

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-eyebrow text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium break-words">{valor || "—"}</dd>
    </div>
  );
}

function ConsultaProtocolo() {
  const { numero } = Route.useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["protocolo-publico", numero],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("consultar_protocolo", { p_numero: numero });
      if (error) throw error;
      return ((data as ProtocoloPublico[] | null) ?? [])[0] ?? null;
    },
  });

  return (
    <div className="min-h-screen">
      <header className="mx-auto grid max-w-4xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-5">
        <Wordmark subtitle="Consulta pública" />
        <Button asChild variant="ghost" size="sm" className="shrink-0">
          <Link to="/">
            <ArrowLeft className="size-4" />
            Nova consulta
          </Link>
        </Button>
      </header>

      <main className="mx-auto max-w-4xl px-5 pb-20">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-28 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
          </div>
        ) : !data || isError ? (
          <div className="shadow-soft rounded-3xl border bg-card px-6 py-14 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
              <FileSearch className="size-6" />
            </span>
            <h1 className="mt-5 text-xl font-semibold">Protocolo não encontrado</h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Não localizamos nenhum registro para <span className="font-medium">{numero}</span>.
              Confira o número informado pelo corretor e tente novamente.
            </p>
            <Button asChild className="mt-6">
              <Link to="/">Tentar outro número</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <section className="bg-brand-gradient shadow-panel rounded-3xl px-6 py-8 text-primary-foreground sm:px-10">
              <p className="text-eyebrow text-primary-foreground/70">Protocolo</p>
              <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                <h1 className="truncate font-display text-3xl font-bold sm:text-4xl">
                  {data.numero}
                </h1>
                <span className="shrink-0 rounded-full bg-card px-3 py-1.5">
                  <StatusBadge status={data.status} />
                </span>
              </div>
              <p className="mt-3 text-sm text-primary-foreground/75">
                Aberto em {formatarDataHora(data.created_at)} • atualizado em{" "}
                {formatarDataHora(data.updated_at)}
              </p>
            </section>

            <section className="shadow-soft rounded-3xl border bg-card p-6 sm:p-8">
              <h2 className="text-base font-semibold">Dados da negociação</h2>
              <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                <Campo label="Vendedor(es)" valor={data.vendedores} />
                <Campo label="Comprador(es)" valor={data.compradores} />
                <Campo label="Imóvel" valor={data.imovel} />
                <Campo label="Matrícula" valor={data.matricula} />
                <Campo label="CIF" valor={data.cif} />
                <Campo
                  label="Tipo de imóvel"
                  valor={TIPO_IMOVEL_LABEL[data.tipo_imovel] ?? data.tipo_imovel}
                />
                <Campo
                  label="Tipo de negociação"
                  valor={TIPO_NEGOCIACAO_LABEL[data.tipo_negociacao] ?? data.tipo_negociacao}
                />
              </dl>
            </section>

            <section className="shadow-soft rounded-3xl border bg-card p-6 sm:p-8">
              <h2 className="text-base font-semibold">Histórico</h2>
              {data.historico.trim() ? (
                <ol className="mt-5 space-y-4">
                  {data.historico
                    .split("\n")
                    .filter((linha) => linha.trim())
                    .map((linha, i) => (
                      <li key={i} className="relative border-l pl-5">
                        <span className="absolute top-1.5 -left-[5px] size-2.5 rounded-full bg-brand-bright" />
                        <p className="text-sm leading-relaxed">{linha}</p>
                      </li>
                    ))}
                </ol>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Nenhum andamento registrado até o momento.
                </p>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
