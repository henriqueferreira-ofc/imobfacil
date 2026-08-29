import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Building2, FileText, Lock, Plus, Search, ShieldCheck } from "lucide-react";
import { Wordmark } from "@/components/brand";
import { LocacaoDialog } from "@/components/imoveis-dialogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizarNumero } from "@/lib/protocolos";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ImobFácil — Consulte seu protocolo de negociação" },
      {
        name: "description",
        content:
          "Informe o número do protocolo e acompanhe em tempo real o andamento da negociação do seu imóvel.",
      },
      { property: "og:title", content: "ImobFácil — Consulte seu protocolo" },
      {
        property: "og:description",
        content: "Acompanhe o andamento da negociação do seu imóvel pelo número do protocolo.",
      },
    ],
  }),
  component: Home,
});

const passos = [
  {
    icon: FileText,
    titulo: "Protocolo único",
    texto: "Cada negociação recebe um número exclusivo no momento do cadastro.",
  },
  {
    icon: ShieldCheck,
    titulo: "Histórico confiável",
    texto: "Somente o administrador registra andamentos. Nada se perde no WhatsApp.",
  },
  {
    icon: Search,
    titulo: "Consulta aberta",
    texto: "Comprador e vendedor acompanham tudo com o número em mãos, sem login.",
  },
];

function Home() {
  const navigate = useNavigate();
  const [numero, setNumero] = useState("");
  const [codigoLocacao, setCodigoLocacao] = useState("");
  const [locacaoAberta, setLocacaoAberta] = useState(false);
  const [locacaoCriada, setLocacaoCriada] = useState("");

  function consultar(e: React.FormEvent) {
    e.preventDefault();
    const valor = normalizarNumero(numero);
    if (!valor) return;
    navigate({ to: "/p/$numero", params: { numero: valor } });
  }

  function consultarLocacao(e: React.FormEvent) {
    e.preventDefault();
    const valor = normalizarNumero(codigoLocacao);
    if (!valor) return;
    navigate({ to: "/l/$codigo", params: { codigo: valor } });
  }

  return (
    <div className="min-h-screen">
      <header className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 sm:px-6 sm:py-5">
        <Wordmark />
        <Button asChild variant="ghost" size="sm" className="shrink-0">
          <Link to="/auth">
            <Lock className="size-4" />
            <span className="hidden sm:inline">Área do administrador</span>
            <span className="sm:hidden">Admin</span>
          </Link>
        </Button>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
        <section className="bg-brand-gradient shadow-panel relative overflow-hidden rounded-3xl px-5 py-10 text-primary-foreground sm:px-10 sm:py-14 lg:px-12 lg:py-16">
          <div
            aria-hidden
            className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-brand-bright/25 blur-3xl"
          />
          <div className="relative max-w-2xl">
            <p className="text-eyebrow text-primary-foreground/70">
              Tudo para corretores, em um só lugar
            </p>
            <h1 className="mt-3 text-[1.75rem] leading-[1.1] font-bold sm:mt-4 sm:text-4xl lg:text-5xl">
              Consulte o andamento da sua negociação
            </h1>
            <p className="mt-3 max-w-xl text-sm text-primary-foreground/80 sm:mt-4 sm:text-base">
              Informe o número do protocolo entregue pelo corretor e veja imóvel, partes envolvidas,
              tipo de negociação e todo o histórico atualizado.
            </p>

            <form onSubmit={consultar} className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
              <Input
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="Ex.: PRT-2026-1001"
                aria-label="Número do protocolo"
                className="h-12 w-full border-transparent bg-card text-base text-foreground placeholder:text-muted-foreground sm:max-w-xs"
              />
              <Button
                type="submit"
                size="lg"
                variant="secondary"
                className="h-12 w-full font-semibold sm:w-auto"
              >
                Consultar protocolo
                <ArrowRight className="size-4" />
              </Button>
            </form>
            <p className="mt-3 text-xs text-primary-foreground/60">
              Demonstração: use PRT-2026-1001, PRT-2026-1002 ou PRT-2026-1003.
            </p>
          </div>
        </section>

        <section className="bg-brand-gradient shadow-panel relative mt-6 overflow-hidden rounded-3xl px-5 py-10 text-primary-foreground sm:mt-8 sm:px-10 sm:py-14 lg:px-12 lg:py-16">
          <div
            aria-hidden
            className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-brand-bright/25 blur-3xl"
          />
          <div className="relative max-w-2xl">
            <span className="flex size-10 items-center justify-center rounded-xl bg-card/15 text-primary-foreground">
              <Building2 className="size-5" />
            </span>
            <h2 className="mt-4 text-[1.5rem] leading-[1.15] font-bold sm:text-3xl lg:text-4xl">
              Locação de Imóveis
            </h2>
            <p className="mt-3 max-w-xl text-sm text-primary-foreground/80 sm:text-base">
              Cadastre uma nova locação ou acompanhe pelo código gerado após o envio. A
              administração revisa e gerencia tudo no painel.
            </p>

            <form
              onSubmit={consultarLocacao}
              className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row"
            >
              <Input
                value={codigoLocacao}
                onChange={(e) => setCodigoLocacao(e.target.value)}
                placeholder="Ex.: LOC-2026-1001"
                aria-label="Código da locação"
                className="h-12 w-full border-transparent bg-card text-base text-foreground placeholder:text-muted-foreground sm:max-w-xs"
              />
              <Button
                type="submit"
                size="lg"
                variant="secondary"
                className="h-12 w-full font-semibold sm:w-auto"
              >
                Consultar locação
                <ArrowRight className="size-4" />
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="h-12 w-full border-primary-foreground/30 bg-transparent font-semibold text-primary-foreground hover:bg-card/10 hover:text-primary-foreground sm:w-auto"
                onClick={() => setLocacaoAberta(true)}
              >
                <Plus className="size-4" />
                Nova locação
              </Button>
            </form>

            {locacaoCriada ? (
              <div className="mt-5 rounded-2xl border border-primary-foreground/20 bg-card/10 p-4">
                <p className="text-sm font-semibold">Locação cadastrada com sucesso.</p>
                <p className="mt-1 text-sm text-primary-foreground/80">
                  Guarde este número para consultar depois:
                </p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <code className="rounded-xl bg-card px-4 py-3 text-center text-lg font-bold tracking-wide text-foreground">
                    {locacaoCriada}
                  </code>
                  <Button
                    type="button"
                    size="lg"
                    variant="secondary"
                    className="h-12 font-semibold"
                    onClick={() =>
                      navigate({ to: "/l/$codigo", params: { codigo: locacaoCriada } })
                    }
                  >
                    Consultar agora
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
          {passos.map(({ icon: Icon, titulo, texto }) => (
            <div key={titulo} className="shadow-soft rounded-2xl border bg-card p-5 sm:p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <Icon className="size-5" />
              </span>
              <h2 className="mt-4 text-base font-semibold">{titulo}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{texto}</p>
            </div>
          ))}
        </section>
      </main>

      <LocacaoDialog
        open={locacaoAberta}
        onOpenChange={setLocacaoAberta}
        registro={null}
        publico
        onPublicSuccess={(codigo) => {
          setLocacaoCriada(codigo);
          setCodigoLocacao(codigo);
        }}
      />

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl justify-center px-4 text-center text-xs text-muted-foreground sm:px-6 lg:justify-end lg:text-right">
          <span>
            © 2026 Todos os Direitos reservados a{" "}
            <strong className="font-semibold text-foreground">ImobFácil</strong>
          </span>
        </div>
      </footer>
    </div>
  );
}
