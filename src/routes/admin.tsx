import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import {
  BarChart3,
  Building2,
  FileDown,
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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
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
  formatarMoeda,
  STATUS_VISTORIA_LABEL,
  type ImovelAdministrado,
  type Locacao,
} from "@/lib/imoveis";
import {
  enderecoCompleto,
  formatarData,
  TIPO_IMOVEL_LABEL,
  TIPO_NEGOCIACAO_LABEL,
  STATUS_LABEL,
  type Protocolo,
} from "@/lib/protocolos";

type AdminModulo = "protocolos" | "analise" | "locacao" | "administracao";

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
    id: "analise",
    label: "Análise de Dados",
    description: "Relatórios e gráficos",
    icon: BarChart3,
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

  const { data: locacoes, isLoading: loadingLocacoes } = useQuery({
    queryKey: ["locacoes"],
    enabled: Boolean(session) && isAdmin === true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locacoes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Locacao[];
    },
  });

  const { data: imoveisAdministrados, isLoading: loadingAdministracao } = useQuery({
    queryKey: ["imoveis-administrados"],
    enabled: Boolean(session) && isAdmin === true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("imoveis_administrados")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as ImovelAdministrado[];
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
          ) : moduloAtivo === "analise" ? (
            <AnaliseModule
              protocolos={protocolos ?? []}
              locacoes={locacoes ?? []}
              imoveisAdministrados={imoveisAdministrados ?? []}
              isLoading={isLoading || loadingLocacoes || loadingAdministracao}
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

const chartColors = ["#3b82f6", "#f59e0b", "#22c55e", "#ef4444", "#14b8a6"];

function AnaliseModule({
  protocolos,
  locacoes,
  imoveisAdministrados,
  isLoading,
}: {
  protocolos: Protocolo[];
  locacoes: Locacao[];
  imoveisAdministrados: ImovelAdministrado[];
  isLoading: boolean;
}) {
  const analise = useMemo(() => {
    const total = protocolos.length;
    const porStatus = Object.entries(STATUS_LABEL).map(([status, label]) => ({
      status,
      label,
      labelCurto: label.replace("Em ", ""),
      total: protocolos.filter((p) => p.status === status).length,
    }));
    const porImovel = Object.entries(TIPO_IMOVEL_LABEL).map(([tipo, label]) => ({
      tipo,
      label,
      total: protocolos.filter((p) => p.tipo_imovel === tipo).length,
    }));
    const porNegociacao = Object.entries(TIPO_NEGOCIACAO_LABEL).map(([tipo, label]) => ({
      tipo,
      label,
      total: protocolos.filter((p) => p.tipo_negociacao === tipo).length,
    }));
    const ativos = protocolos.filter((p) => ["em_andamento", "em_analise"].includes(p.status));
    const concluidos = protocolos.filter((p) => p.status === "concluido").length;
    const cancelados = protocolos.filter((p) => p.status === "cancelado").length;
    const taxaConclusao = total ? Math.round((concluidos / total) * 100) : 0;
    const taxaAtivos = total ? Math.round((ativos.length / total) * 100) : 0;
    const atualizados = [...protocolos]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);
    const pendencias = [
      {
        label: "Em andamento",
        total: protocolos.filter((p) => p.status === "em_andamento").length,
      },
      { label: "Em análise", total: protocolos.filter((p) => p.status === "em_analise").length },
      { label: "Cancelados", total: cancelados },
    ];
    const totalAlugueis = locacoes.reduce(
      (soma, item) => soma + Number(item.valor_aluguel || 0),
      0,
    );
    const totalRepasses = imoveisAdministrados.reduce(
      (soma, item) => soma + Number(item.repasse_previsto || 0),
      0,
    );
    const modulos = [
      {
        modulo: "Protocolo de Documentos",
        moduloCurto: "Protocolos",
        total,
        emAnalise: protocolos.filter((p) => p.status === "em_analise").length,
        emAndamento: protocolos.filter((p) => p.status === "em_andamento").length,
        concluidos,
        valor: 0,
      },
      {
        modulo: "Locação de Imóveis",
        moduloCurto: "Locações",
        total: locacoes.length,
        emAnalise: locacoes.filter((l) => l.status_vistoria === "em_analise").length,
        emAndamento: locacoes.filter((l) => l.status_vistoria === "em_andamento").length,
        concluidos: locacoes.filter((l) => l.status_vistoria === "concluido").length,
        valor: totalAlugueis,
      },
      {
        modulo: "Administração de Imóveis",
        moduloCurto: "Admin.",
        total: imoveisAdministrados.length,
        emAnalise: imoveisAdministrados.filter((i) => i.status === "em_analise").length,
        emAndamento: imoveisAdministrados.filter((i) => i.status === "em_andamento").length,
        concluidos: imoveisAdministrados.filter((i) => i.status === "concluido").length,
        valor: totalRepasses,
      },
    ];

    return {
      total,
      porStatus,
      porImovel,
      porNegociacao,
      ativos,
      concluidos,
      cancelados,
      taxaConclusao,
      taxaAtivos,
      atualizados,
      pendencias,
      modulos,
      totalGeral: total + locacoes.length + imoveisAdministrados.length,
      totalAlugueis,
      totalRepasses,
    };
  }, [protocolos, locacoes, imoveisAdministrados]);

  const principalStatus = [...analise.porStatus].sort((a, b) => b.total - a.total)[0];
  const principalImovel = [...analise.porImovel].sort((a, b) => b.total - a.total)[0];
  const principalNegociacao = [...analise.porNegociacao].sort((a, b) => b.total - a.total)[0];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-4 sm:space-y-5">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="min-w-0">
          <p className="text-eyebrow text-muted-foreground">Inteligência do negócio</p>
          <h1 className="mt-2 font-display text-xl font-bold break-words sm:text-2xl">
            Análise de Dados
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Relatório gerencial consolidado dos três módulos, com leitura específica para Protocolo
            de Documentos, Locação de Imóveis e Administração de Imóveis.
          </p>
        </div>
        <Button
          className="w-full sm:w-auto"
          onClick={() => gerarRelatorioPdf(analise, protocolos, locacoes, imoveisAdministrados)}
        >
          <FileDown className="size-4" />
          Gerar PDF
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        {[
          { label: "Registros totais", valor: analise.totalGeral },
          { label: "Protocolos", valor: analise.total },
          { label: "Locações", valor: locacoes.length },
          { label: "Administração", valor: imoveisAdministrados.length },
        ].map((item) => (
          <div
            key={item.label}
            className="shadow-soft min-w-0 rounded-2xl border bg-card p-3 sm:p-4"
          >
            <p className="text-eyebrow text-muted-foreground">{item.label}</p>
            <p className="mt-1.5 font-display text-base font-bold break-words sm:text-2xl">
              {item.valor}
            </p>
          </div>
        ))}
      </div>

      <section className="shadow-soft min-w-0 rounded-2xl border bg-card p-4 sm:p-5">
        <h2 className="font-display text-lg font-bold break-words">Análise por módulo</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {analise.modulos.map((modulo) => (
            <div key={modulo.modulo} className="min-w-0 rounded-xl border bg-background p-3 sm:p-4">
              <h3 className="font-display text-sm font-bold break-words sm:text-base">
                {modulo.modulo}
              </h3>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:gap-3">
                <AnaliseMetric label="Total" value={String(modulo.total)} />
                <AnaliseMetric label="Em análise" value={String(modulo.emAnalise)} />
                <AnaliseMetric label="Em andamento" value={String(modulo.emAndamento)} />
                <AnaliseMetric label="Concluídos" value={String(modulo.concluidos)} />
                {modulo.valor > 0 ? (
                  <div className="col-span-2">
                    <AnaliseMetric
                      label="Valor mensal previsto"
                      value={formatarMoeda(modulo.valor)}
                    />
                  </div>
                ) : null}
              </dl>
            </div>
          ))}
        </div>
      </section>

      <section className="shadow-soft min-w-0 rounded-2xl border bg-card p-4 sm:p-5">
        <h2 className="font-display text-lg font-bold break-words">Registros por módulo</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Comparativo direto entre os três módulos do sistema.
        </p>
        <ChartContainer
          config={{ total: { label: "Registros", color: "var(--color-brand-bright)" } }}
          className="mt-4 h-56 w-full sm:h-64 lg:h-72"
        >
          <BarChart data={analise.modulos} margin={{ top: 8, right: 8, bottom: 6, left: -28 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="moduloCurto"
              tickLine={false}
              axisLine={false}
              interval={0}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="total" radius={[8, 8, 0, 0]} fill="var(--color-total)" />
          </BarChart>
        </ChartContainer>
      </section>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-5">
        {[
          { label: "Protocolos ativos", valor: analise.ativos.length },
          { label: "Conclusão", valor: `${analise.taxaConclusao}%` },
          { label: "Em aberto", valor: `${analise.taxaAtivos}%` },
          { label: "Aluguéis/mês", valor: formatarMoeda(analise.totalAlugueis) },
          { label: "Repasses/mês", valor: formatarMoeda(analise.totalRepasses) },
        ].map((item) => (
          <div
            key={item.label}
            className="shadow-soft min-w-0 rounded-2xl border bg-card p-3 sm:p-4"
          >
            <p className="text-eyebrow text-muted-foreground">{item.label}</p>
            <p className="mt-1.5 font-display text-base font-bold break-words sm:text-2xl">
              {item.valor}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="shadow-soft min-w-0 rounded-2xl border bg-card p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-display text-lg font-bold break-words">Protocolos por status</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Mostra onde a operação está concentrada hoje.
              </p>
            </div>
          </div>
          <ChartContainer
            config={{ total: { label: "Protocolos", color: "var(--color-brand-bright)" } }}
            className="mt-4 h-56 w-full sm:h-64 lg:h-72"
          >
            <BarChart data={analise.porStatus} margin={{ top: 8, right: 8, bottom: 6, left: -28 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="labelCurto"
                tickLine={false}
                axisLine={false}
                interval={0}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="total" radius={[8, 8, 0, 0]} fill="var(--color-total)" />
            </BarChart>
          </ChartContainer>
        </section>

        <section className="shadow-soft min-w-0 rounded-2xl border bg-card p-4 sm:p-5">
          <h2 className="font-display text-lg font-bold break-words">Leitura rápida</h2>
          <div className="mt-4 space-y-3 text-sm">
            <AnaliseInsight label="Maior concentração" value={principalStatus?.label ?? "—"} />
            <AnaliseInsight label="Tipo mais recorrente" value={principalImovel?.label ?? "—"} />
            <AnaliseInsight
              label="Negociação mais comum"
              value={principalNegociacao?.label ?? "—"}
            />
            <AnaliseInsight
              label="Protocolos que exigem atenção"
              value={`${analise.ativos.length} em aberto`}
            />
          </div>
        </section>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <AnalisePieCard title="Tipos de imóvel" data={analise.porImovel} />
        <AnalisePieCard title="Tipos de negociação" data={analise.porNegociacao} />
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="shadow-soft min-w-0 rounded-2xl border bg-card p-4 sm:p-5">
          <h2 className="font-display text-lg font-bold break-words">Fila de atenção</h2>
          <div className="mt-4 space-y-3">
            {analise.pendencias.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-xl border p-3"
              >
                <span className="text-sm font-medium">{item.label}</span>
                <span className="font-display text-lg font-bold">{item.total}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="shadow-soft min-w-0 rounded-2xl border bg-card p-4 sm:p-5">
          <h2 className="font-display text-lg font-bold break-words">Últimas atualizações</h2>
          <div className="mt-4 space-y-3">
            {analise.atualizados.length === 0 ? (
              <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                Nenhum protocolo cadastrado para analisar.
              </p>
            ) : (
              analise.atualizados.map((p) => (
                <div
                  key={p.id}
                  className="grid gap-2 rounded-xl border p-3 sm:grid-cols-[1fr_auto]"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display font-bold">{p.numero}</p>
                      <StatusBadge status={p.status} />
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {enderecoCompleto(p) || "Endereço não informado"}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {formatarData(p.updated_at)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function AnaliseInsight({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border bg-background p-3">
      <p className="text-eyebrow text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold break-words sm:text-base">{value}</p>
    </div>
  );
}

function AnaliseMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-eyebrow text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-semibold break-words sm:text-base">{value}</dd>
    </div>
  );
}

function gerarRelatorioPdf(
  analise: {
    totalGeral: number;
    total: number;
    ativos: Protocolo[];
    concluidos: number;
    taxaConclusao: number;
    taxaAtivos: number;
    totalAlugueis: number;
    totalRepasses: number;
    modulos: Array<{
      modulo: string;
      total: number;
      emAnalise: number;
      emAndamento: number;
      concluidos: number;
      valor: number;
    }>;
    porStatus: Array<{ label: string; total: number }>;
    porImovel: Array<{ label: string; total: number }>;
    porNegociacao: Array<{ label: string; total: number }>;
    atualizados: Protocolo[];
  },
  protocolos: Protocolo[],
  locacoes: Locacao[],
  imoveisAdministrados: ImovelAdministrado[],
) {
  // pop-ups são bloqueados no preview/iframe: imprimimos via iframe oculto
  const hoje = new Date().toLocaleDateString("pt-BR");
  const moduleRows = analise.modulos
    .map(
      (m) => `
        <tr>
          <td>${escapeHtml(m.modulo)}</td>
          <td>${m.total}</td>
          <td>${m.emAnalise}</td>
          <td>${m.emAndamento}</td>
          <td>${m.concluidos}</td>
          <td>${m.valor ? formatarMoeda(m.valor) : "-"}</td>
        </tr>
      `,
    )
    .join("");
  const statusRows = analise.porStatus
    .map((s) => `<tr><td>${escapeHtml(s.label)}</td><td>${s.total}</td></tr>`)
    .join("");
  const imovelRows = analise.porImovel
    .map((s) => `<tr><td>${escapeHtml(s.label)}</td><td>${s.total}</td></tr>`)
    .join("");
  const negociacaoRows = analise.porNegociacao
    .map((s) => `<tr><td>${escapeHtml(s.label)}</td><td>${s.total}</td></tr>`)
    .join("");
  const atualizadosRows = analise.atualizados
    .map(
      (p) => `
        <tr>
          <td>${escapeHtml(p.numero)}</td>
          <td>${escapeHtml(STATUS_LABEL[p.status] ?? p.status)}</td>
          <td>${escapeHtml(enderecoCompleto(p) || "-")}</td>
          <td>${formatarData(p.updated_at)}</td>
        </tr>
      `,
    )
    .join("");

  const html = `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Relatório de Análise de Dados - ImobFácil</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 32px;
            color: #111827;
            font-family: Arial, sans-serif;
            line-height: 1.35;
          }
          h1, h2, h3 { margin: 0; }
          h1 { font-size: 28px; }
          h2 { margin-top: 28px; font-size: 18px; }
          p { margin: 6px 0 0; color: #5f6b7a; }
          .header {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 18px;
          }
          .brand { font-weight: 700; color: #0f1f4d; }
          .grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-top: 20px;
          }
          .card {
            border: 1px solid #dbe2ea;
            border-radius: 12px;
            padding: 14px;
          }
          .label {
            color: #667085;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
          }
          .value {
            margin-top: 8px;
            font-size: 24px;
            font-weight: 700;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            font-size: 13px;
          }
          th, td {
            border-bottom: 1px solid #e5e7eb;
            padding: 10px 8px;
            text-align: left;
            vertical-align: top;
          }
          th {
            color: #667085;
            font-size: 11px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          .columns {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
          @media print {
            body { padding: 18mm; }
            button { display: none; }
          }
          @media (max-width: 760px) {
            body { padding: 18px; }
            .header, .columns { grid-template-columns: 1fr; display: grid; }
            .grid { grid-template-columns: repeat(2, 1fr); }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">ImobFácil</div>
            <h1>Relatório de Análise de Dados</h1>
            <p>Consolidado dos módulos Protocolo de Documentos, Locação de Imóveis e Administração de Imóveis.</p>
          </div>
          <div>
            <div class="label">Gerado em</div>
            <div class="value" style="font-size:18px">${hoje}</div>
          </div>
        </div>

        <div class="grid">
          <div class="card"><div class="label">Registros totais</div><div class="value">${analise.totalGeral}</div></div>
          <div class="card"><div class="label">Protocolos</div><div class="value">${analise.total}</div></div>
          <div class="card"><div class="label">Locações</div><div class="value">${locacoes.length}</div></div>
          <div class="card"><div class="label">Administração</div><div class="value">${imoveisAdministrados.length}</div></div>
        </div>

        <h2>Análise por módulo</h2>
        <table>
          <thead>
            <tr>
              <th>Módulo</th>
              <th>Total</th>
              <th>Em análise</th>
              <th>Em andamento</th>
              <th>Concluídos</th>
              <th>Valor mensal</th>
            </tr>
          </thead>
          <tbody>${moduleRows}</tbody>
        </table>

        <div class="columns">
          <section>
            <h2>Protocolos por status</h2>
            <table><thead><tr><th>Status</th><th>Total</th></tr></thead><tbody>${statusRows}</tbody></table>
          </section>
          <section>
            <h2>Tipos de imóvel</h2>
            <table><thead><tr><th>Tipo</th><th>Total</th></tr></thead><tbody>${imovelRows}</tbody></table>
          </section>
          <section>
            <h2>Tipos de negociação</h2>
            <table><thead><tr><th>Tipo</th><th>Total</th></tr></thead><tbody>${negociacaoRows}</tbody></table>
          </section>
        </div>

        <h2>Indicadores financeiros previstos</h2>
        <div class="grid">
          <div class="card"><div class="label">Aluguéis/mês</div><div class="value">${formatarMoeda(analise.totalAlugueis)}</div></div>
          <div class="card"><div class="label">Repasses/mês</div><div class="value">${formatarMoeda(analise.totalRepasses)}</div></div>
          <div class="card"><div class="label">Conclusão de protocolos</div><div class="value">${analise.taxaConclusao}%</div></div>
          <div class="card"><div class="label">Protocolos em aberto</div><div class="value">${analise.taxaAtivos}%</div></div>
        </div>

        <h2>Últimas atualizações de protocolos</h2>
        <table>
          <thead><tr><th>Protocolo</th><th>Status</th><th>Imóvel</th><th>Atualizado</th></tr></thead>
          <tbody>${atualizadosRows || '<tr><td colspan="4">Nenhum protocolo cadastrado.</td></tr>'}</tbody>
        </table>

      </body>
    </html>
  `;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  if (!doc) {
    iframe.remove();
    toast.error("Não foi possível gerar o relatório");
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  const imprimir = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      toast.success("Relatório pronto", {
        description: 'Escolha "Salvar como PDF" na janela de impressão.',
      });
    } catch {
      toast.error("Não foi possível abrir a impressão");
    }
    window.setTimeout(() => iframe.remove(), 60000);
  };

  if (doc.readyState === "complete") window.setTimeout(imprimir, 300);
  else iframe.addEventListener("load", () => window.setTimeout(imprimir, 300));
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function AnalisePieCard({
  title,
  data,
}: {
  title: string;
  data: Array<{ label: string; total: number }>;
}) {
  const chartData = data.map((item, index) => ({
    ...item,
    fill: chartColors[index % chartColors.length],
  }));

  return (
    <section className="shadow-soft min-w-0 rounded-2xl border bg-card p-4 sm:p-5">
      <h2 className="font-display text-lg font-bold break-words">{title}</h2>
      <ChartContainer
        config={{ total: { label: "Protocolos" } }}
        className="mx-auto mt-3 h-52 w-full max-w-sm sm:mt-4 sm:h-60 md:h-64 md:max-w-md"
      >
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
          <Pie data={chartData} dataKey="total" nameKey="label" innerRadius="52%" outerRadius="78%">
            {chartData.map((entry) => (
              <Cell key={entry.label} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="mt-3 grid gap-2 sm:mt-4">
        {chartData.map((item) => (
          <div
            key={item.label}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: item.fill }} />
              <span className="min-w-0 truncate">{item.label}</span>
            </span>
            <span className="font-semibold">{item.total}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
