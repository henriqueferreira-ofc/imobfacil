import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Building2,
  ExternalLink,
  FileText,
  Home,
  LogOut,
  Menu,
  Pencil,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { Logo, StatusBadge } from "@/components/brand";
import { ProtocoloDialog } from "@/components/protocolo-dialog";
import { AdministracaoModule, LocacaoModule } from "@/components/imoveis-modules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin, useSession } from "@/hooks/useSession";
import { cn } from "@/lib/utils";
import {
  enderecoCompleto,
  formatarData,
  TIPO_IMOVEL_LABEL,
  TIPO_NEGOCIACAO_LABEL,
  type Protocolo,
} from "@/lib/protocolos";

type AdminModulo = "protocolos" | "locacao" | "administracao";

const modulos: Array<{
  id: AdminModulo;
  label: string;
  description: string;
  icon: typeof FileText;
}> = [
  {
    id: "protocolos",
    label: "Protocolo de Documentos",
    description: "Cadastro e consulta pública",
    icon: FileText,
  },
  {
    id: "locacao",
    label: "Locação de Imóveis",
    description: "Contratos, vistoria e aluguel",
    icon: Home,
  },
  {
    id: "administracao",
    label: "Administração de Imóveis",
    description: "Gestão, repasses e manutenção",
    icon: Building2,
  },
];

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Protocolos — Painel administrativo | ImobFácil" },
      {
        name: "description",
        content: "Cadastro e gestão dos protocolos de negociação da imobiliária.",
      },
      { property: "og:title", content: "Protocolos — Painel administrativo | ImobFácil" },
      { property: "og:description", content: "Gestão dos protocolos de negociação." },
    ],
  }),
  component: Admin,
});

function Admin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session, loading } = useSession();
  const { data: isAdmin, isLoading: loadingRole } = useIsAdmin(session?.user.id);

  const [busca, setBusca] = useState("");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<Protocolo | null>(null);
  const [paraExcluir, setParaExcluir] = useState<Protocolo | null>(null);
  const [moduloAtivo, setModuloAtivo] = useState<AdminModulo>("protocolos");
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", replace: true });
  }, [loading, session, navigate]);

  const { data: protocolos, isLoading } = useQuery({
    queryKey: ["protocolos"],
    enabled: Boolean(session) && isAdmin === true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("protocolos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Protocolo[];
    },
  });

  const excluir = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("protocolos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["protocolos"] });
      toast.success("Protocolo excluído");
      setParaExcluir(null);
    },
    onError: (error: Error) => toast.error("Erro ao excluir", { description: error.message }),
  });

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return protocolos ?? [];
    return (protocolos ?? []).filter((p) =>
      [
        p.numero,
        p.vendedores,
        p.compradores,
        p.endereco,
        p.bairro,
        p.cidade,
        p.estado,
        p.cep,
        p.matricula,
        p.cif,
      ]
        .join(" ")
        .toLowerCase()
        .includes(termo),
    );
  }, [protocolos, busca]);

  async function sair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (loading || loadingRole) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (session && isAdmin === false) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <div className="shadow-soft max-w-sm rounded-3xl border bg-card p-8 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
            <ShieldAlert className="size-6" />
          </span>
          <h1 className="mt-5 text-lg font-semibold">Acesso restrito</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sua conta não tem perfil de administrador. Solicite a liberação ao responsável.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Button asChild variant="outline">
              <Link to="/">Consulta pública</Link>
            </Button>
            <Button onClick={sair}>Sair</Button>
          </div>
        </div>
      </div>
    );
  }

  const totais = {
    total: protocolos?.length ?? 0,
    andamento: (protocolos ?? []).filter((p) => p.status === "em_andamento").length,
    analise: (protocolos ?? []).filter((p) => p.status === "em_analise").length,
    concluidos: (protocolos ?? []).filter((p) => p.status === "concluido").length,
  };

  return (
    <div className="min-h-dvh overflow-x-hidden lg:grid lg:grid-cols-[292px_minmax(0,1fr)]">
      <aside className="hidden bg-card lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-[292px] lg:border-r">
        <AdminSidebar moduloAtivo={moduloAtivo} onModuloChange={setModuloAtivo} />
      </aside>

      <div className="min-w-0 lg:col-start-2">
        <header className="border-b bg-background/80 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-2 px-4 sm:px-6 lg:justify-end lg:px-10">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Abrir menu"
              onClick={() => setMenuAberto(true)}
            >
              <Menu className="size-5" />
            </Button>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link to="/">
                  <ExternalLink className="size-4" />
                  <span className="hidden sm:inline">Consulta pública</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={sair}>
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          {moduloAtivo === "protocolos" ? (
            <ProtocolosModule
              busca={busca}
              setBusca={setBusca}
              totais={totais}
              isLoading={isLoading}
              filtrados={filtrados}
              onNovo={() => {
                setEmEdicao(null);
                setDialogAberto(true);
              }}
              onEditar={(protocolo) => {
                setEmEdicao(protocolo);
                setDialogAberto(true);
              }}
              onExcluir={setParaExcluir}
            />
          ) : moduloAtivo === "locacao" ? (
            <LocacaoModule />
          ) : (
            <AdministracaoModule />
          )}
        </main>
      </div>

      <Sheet open={menuAberto} onOpenChange={setMenuAberto}>
        <SheetContent side="left" className="w-[min(82vw,320px)] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu administrativo</SheetTitle>
            <SheetDescription>Escolha um módulo do painel administrativo.</SheetDescription>
          </SheetHeader>
          <AdminSidebar
            moduloAtivo={moduloAtivo}
            onModuloChange={(modulo) => {
              setModuloAtivo(modulo);
              setMenuAberto(false);
            }}
          />
        </SheetContent>
      </Sheet>

      <ProtocoloDialog open={dialogAberto} onOpenChange={setDialogAberto} protocolo={emEdicao} />

      <AlertDialog open={Boolean(paraExcluir)} onOpenChange={() => setParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {paraExcluir?.numero}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é permanente. A consulta pública deste protocolo deixará de funcionar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => paraExcluir && excluir.mutate(paraExcluir.id)}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AdminSidebar({
  moduloAtivo,
  onModuloChange,
}: {
  moduloAtivo: AdminModulo;
  onModuloChange: (modulo: AdminModulo) => void;
}) {
  return (
    <div className="flex h-full flex-col bg-card px-4 py-5 lg:overflow-y-auto lg:px-5">
      <div className="flex items-center gap-3 rounded-xl px-1">
        <Logo className="size-14 rounded-2xl" />
        <span className="min-w-0">
          <span className="block truncate font-display text-xl font-bold leading-none">
            Imob<span className="text-brand-bright">Fácil</span>
          </span>
          <span className="mt-1 block truncate text-sm text-muted-foreground">
            Painel administrativo
          </span>
        </span>
      </div>

      <nav className="mt-8 flex flex-col gap-2">
        {modulos.map(({ id, label, icon: Icon }) => {
          const active = moduloAtivo === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onModuloChange(id)}
              className={cn(
                "flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-base font-semibold text-foreground transition hover:bg-secondary lg:text-sm",
                active && "bg-secondary text-secondary-foreground",
              )}
            >
              <Icon className="size-5 shrink-0" />
              <span className="min-w-0 leading-tight">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function ProtocolosModule({
  busca,
  setBusca,
  totais,
  isLoading,
  filtrados,
  onNovo,
  onEditar,
  onExcluir,
}: {
  busca: string;
  setBusca: (busca: string) => void;
  totais: { total: number; andamento: number; analise: number; concluidos: number };
  isLoading: boolean;
  filtrados: Protocolo[];
  onNovo: () => void;
  onEditar: (protocolo: Protocolo) => void;
  onExcluir: (protocolo: Protocolo) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Protocolos", valor: totais.total },
          { label: "Em andamento", valor: totais.andamento },
          { label: "Em análise", valor: totais.analise },
          { label: "Concluídos", valor: totais.concluidos },
        ].map((item) => (
          <div key={item.label} className="shadow-soft rounded-2xl border bg-card p-4">
            <p className="text-eyebrow text-muted-foreground">{item.label}</p>
            <p className="mt-1.5 font-display text-xl font-bold sm:text-2xl">{item.valor}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="relative min-w-0">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar protocolo, parte, endereço..."
            className="pl-9"
          />
        </div>
        <Button className="size-12 shrink-0 px-0 sm:size-auto sm:px-4" onClick={onNovo}>
          <Plus className="size-4" />
          <span className="hidden sm:inline">Novo protocolo</span>
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </>
        ) : filtrados.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card/50 px-6 py-14 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum protocolo encontrado. Cadastre o primeiro para começar.
            </p>
          </div>
        ) : (
          filtrados.map((p) => (
            <article key={p.id} className="shadow-soft rounded-2xl border bg-card p-4 sm:p-5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-base font-bold sm:text-lg">{p.numero}</h2>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {enderecoCompleto(p) || "Endereço não informado"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Editar protocolo"
                    onClick={() => onEditar(p)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Excluir protocolo"
                    onClick={() => onExcluir(p)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-4 text-sm lg:grid-cols-4">
                <div className="min-w-0">
                  <dt className="text-eyebrow text-muted-foreground">Vendedor(es)</dt>
                  <dd className="line-clamp-2">{p.vendedores || "—"}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-eyebrow text-muted-foreground">Comprador(es)</dt>
                  <dd className="line-clamp-2">{p.compradores || "—"}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-eyebrow text-muted-foreground">Tipo</dt>
                  <dd className="line-clamp-2">
                    {TIPO_IMOVEL_LABEL[p.tipo_imovel]} • {TIPO_NEGOCIACAO_LABEL[p.tipo_negociacao]}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-eyebrow text-muted-foreground">Atualizado</dt>
                  <dd className="truncate">{formatarData(p.updated_at)}</dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap gap-2 border-t pt-3 text-xs text-muted-foreground">
                <span>Matrícula {p.matricula || "—"}</span>
                <span>•</span>
                <span>CIF {p.cif || "—"}</span>
                <span>•</span>
                <Link
                  to="/p/$numero"
                  params={{ numero: p.numero }}
                  className="font-medium text-brand-bright hover:underline"
                >
                  Ver consulta pública
                </Link>
              </div>
            </article>
          ))
        )}
      </div>
    </>
  );
}
