import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, LogOut, Pencil, Plus, Search, ShieldAlert, Trash2 } from "lucide-react";
import { StatusBadge, Wordmark } from "@/components/brand";
import { ProtocoloDialog } from "@/components/protocolo-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  enderecoCompleto,
  formatarData,
  STATUS_LABEL,
  TIPO_IMOVEL_LABEL,
  TIPO_NEGOCIACAO_LABEL,
  type Protocolo,
} from "@/lib/protocolos";

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
      <div className="mx-auto max-w-6xl space-y-4 p-6">
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
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4">
          <Wordmark subtitle="Painel administrativo" />
          <div className="flex shrink-0 items-center gap-2">
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

      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Protocolos", valor: totais.total },
            { label: "Em andamento", valor: totais.andamento },
            { label: "Em análise", valor: totais.analise },
            { label: "Concluídos", valor: totais.concluidos },
          ].map((item) => (
            <div key={item.label} className="shadow-soft rounded-2xl border bg-card p-4">
              <p className="text-eyebrow text-muted-foreground">{item.label}</p>
              <p className="mt-1.5 font-display text-2xl font-bold">{item.valor}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="relative min-w-0">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por número, parte, imóvel, matrícula..."
              className="pl-9"
            />
          </div>
          <Button
            className="shrink-0"
            onClick={() => {
              setEmEdicao(null);
              setDialogAberto(true);
            }}
          >
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
              <article key={p.id} className="shadow-soft rounded-2xl border bg-card p-5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-lg font-bold">{p.numero}</h2>
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
                      onClick={() => {
                        setEmEdicao(p);
                        setDialogAberto(true);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Excluir protocolo"
                      onClick={() => setParaExcluir(p)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
                  <div className="min-w-0">
                    <dt className="text-eyebrow text-muted-foreground">Vendedor(es)</dt>
                    <dd className="truncate">{p.vendedores || "—"}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-eyebrow text-muted-foreground">Comprador(es)</dt>
                    <dd className="truncate">{p.compradores || "—"}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-eyebrow text-muted-foreground">Tipo</dt>
                    <dd className="truncate">
                      {TIPO_IMOVEL_LABEL[p.tipo_imovel]} •{" "}
                      {TIPO_NEGOCIACAO_LABEL[p.tipo_negociacao]}
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
      </main>

      <ProtocoloDialog
        open={dialogAberto}
        onOpenChange={setDialogAberto}
        protocolo={emEdicao}
      />

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

export const statusLabels = STATUS_LABEL;
