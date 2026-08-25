import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, FileText, Lock, Search, ShieldCheck } from "lucide-react";
import { Wordmark } from "@/components/brand";
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

  function consultar(e: React.FormEvent) {
    e.preventDefault();
    const valor = normalizarNumero(numero);
    if (!valor) return;
    navigate({ to: "/p/$numero", params: { numero: valor } });
  }

  return (
    <div className="min-h-screen">
      <header className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-5">
        <Wordmark />
        <Button asChild variant="ghost" size="sm" className="shrink-0">
          <Link to="/auth">
            <Lock className="size-4" />
            <span className="hidden sm:inline">Área do administrador</span>
            <span className="sm:hidden">Admin</span>
          </Link>
        </Button>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20">
        <section className="bg-brand-gradient shadow-panel relative overflow-hidden rounded-3xl px-6 py-12 text-primary-foreground sm:px-12 sm:py-16">
          <div
            aria-hidden
            className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-brand-bright/25 blur-3xl"
          />
          <div className="relative max-w-2xl">
            <p className="text-eyebrow text-primary-foreground/70">
              Tudo para corretores, em um só lugar
            </p>
            <h1 className="mt-4 text-4xl leading-[1.05] font-bold sm:text-5xl">
              Consulte o andamento da sua negociação
            </h1>
            <p className="mt-4 max-w-xl text-base text-primary-foreground/80">
              Informe o número do protocolo entregue pelo corretor e veja imóvel, partes
              envolvidas, tipo de negociação e todo o histórico atualizado.
            </p>

            <form onSubmit={consultar} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Input
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="Ex.: PRT-2026-1001"
                aria-label="Número do protocolo"
                className="h-12 border-transparent bg-card text-base text-foreground placeholder:text-muted-foreground sm:max-w-xs"
              />
              <Button type="submit" size="lg" variant="secondary" className="h-12 font-semibold">
                Consultar protocolo
                <ArrowRight className="size-4" />
              </Button>
            </form>
            <p className="mt-3 text-xs text-primary-foreground/60">
              Demonstração: use PRT-2026-1001, PRT-2026-1002 ou PRT-2026-1003.
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {passos.map(({ icon: Icon, titulo, texto }) => (
            <div key={titulo} className="shadow-soft rounded-2xl border bg-card p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <Icon className="size-5" />
              </span>
              <h2 className="mt-4 text-base font-semibold">{titulo}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{texto}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-5 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <div>
            <span className="font-semibold text-foreground">ImobFácil</span>
            <span className="ml-1">Protocolos de compra e venda de casas, lotes e apartamentos.</span>
          </div>
          <span>© 2026 Todos os Direitos reservados a <strong className="font-semibold text-foreground">ImobFácil</strong></span>
        </div>
      </footer>
    </div>
  );
}
