import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/brand";
import { AdministracaoDialog, LocacaoDialog } from "@/components/imoveis-dialogs";
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
import { formatarData } from "@/lib/protocolos";
import { formatarMoeda, type ImovelAdministrado, type Locacao } from "@/lib/imoveis";

function ModuleShell({
  title,
  description,
  stats,
  children,
}: {
  title: string;
  description: string;
  stats: Array<{ label: string; valor: string | number }>;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-eyebrow text-muted-foreground">Módulo administrativo</p>
        <h1 className="mt-2 font-display text-xl font-bold sm:text-2xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="shadow-soft rounded-2xl border bg-card p-4">
            <p className="text-eyebrow text-muted-foreground">{item.label}</p>
            <p className="mt-1.5 font-display text-lg font-bold break-words sm:text-2xl">
              {item.valor}
            </p>
          </div>
        ))}
      </div>

      {children}
    </div>
  );
}

function Toolbar({
  busca,
  setBusca,
  onNovo,
  placeholder,
  novoLabel,
}: {
  busca: string;
  setBusca: (v: string) => void;
  onNovo: () => void;
  placeholder: string;
  novoLabel: string;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
      <div className="relative min-w-0">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>
      <Button className="size-12 shrink-0 px-0 sm:size-auto sm:px-4" onClick={onNovo}>
        <Plus className="size-4" />
        <span className="hidden sm:inline">{novoLabel}</span>
      </Button>
    </div>
  );
}

function CardHeaderRow({
  titulo,
  status,
  onEditar,
  onExcluir,
}: {
  titulo: string;
  status: string;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-base font-bold break-words sm:text-lg">{titulo}</h2>
          <StatusBadge status={status} />
        </div>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button variant="ghost" size="icon" aria-label="Editar" onClick={onEditar}>
          <Pencil className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Excluir" onClick={onExcluir}>
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-eyebrow text-muted-foreground">{label}</dt>
      <dd className="break-words">{valor || "—"}</dd>
    </div>
  );
}

function Vazio({ texto }: { texto: string }) {
  return (
    <div className="rounded-2xl border border-dashed bg-card/50 px-6 py-14 text-center">
      <p className="text-sm text-muted-foreground">{texto}</p>
    </div>
  );
}

export function LocacaoModule() {
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState("");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<Locacao | null>(null);
  const [paraExcluir, setParaExcluir] = useState<Locacao | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["locacoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locacoes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Locacao[];
    },
  });

  const excluir = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("locacoes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locacoes"] });
      toast.success("Locação excluída");
      setParaExcluir(null);
    },
    onError: (error: Error) => toast.error("Erro ao excluir", { description: error.message }),
  });

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const lista = data ?? [];
    if (!termo) return lista;
    return lista.filter((l) =>
      [l.endereco, l.numero_casa, l.bairro, l.cep, l.cidade, l.estado, l.proprietario, l.locatario, l.garantia]
        .join(" ").toLowerCase().includes(termo),
    );
  }, [data, busca]);

  const lista = data ?? [];
  const totalAluguel = lista.reduce((soma, l) => soma + Number(l.valor_aluguel || 0), 0);

  return (
    <ModuleShell
      title="Locação de Imóveis"
      description="Controle contratos, ocupação, garantias, vencimentos e vistoria de imóveis alugados."
      stats={[
        { label: "Contratos", valor: lista.length },
        {
          label: "Vistoria em análise",
          valor: lista.filter((l) => l.status_vistoria === "em_analise").length,
        },
        {
          label: "Vistoria em andamento",
          valor: lista.filter((l) => l.status_vistoria === "em_andamento").length,
        },
        { label: "Aluguéis/mês", valor: formatarMoeda(totalAluguel) },
      ]}
    >
      <Toolbar
        busca={busca}
        setBusca={setBusca}
        onNovo={() => {
          setEmEdicao(null);
          setDialogAberto(true);
        }}
        placeholder="Buscar imóvel, proprietário, locatário..."
        novoLabel="Nova locação"
      />

      <div className="space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </>
        ) : filtrados.length === 0 ? (
          <Vazio texto="Nenhuma locação cadastrada. Cadastre a primeira para começar." />
        ) : (
          filtrados.map((l) => (
            <article key={l.id} className="shadow-soft rounded-2xl border bg-card p-4 sm:p-5">
              <CardHeaderRow
                titulo={enderecoCompleto(l) || "Imóvel não informado"}
                status={l.status_vistoria}
                onEditar={() => {
                  setEmEdicao(l);
                  setDialogAberto(true);
                }}
                onExcluir={() => setParaExcluir(l)}
              />
              <dl className="mt-4 grid grid-cols-2 gap-4 text-sm lg:grid-cols-4">
                <Campo label="Proprietário" valor={l.proprietario} />
                <Campo label="Locatário" valor={l.locatario} />
                <Campo label="Aluguel" valor={formatarMoeda(Number(l.valor_aluguel))} />
                <Campo label="Garantia" valor={l.garantia} />
                <Campo
                  label="Início do contrato"
                  valor={l.inicio_contrato ? formatarData(l.inicio_contrato) : ""}
                />
                <Campo label="Vencimento" valor={`Dia ${l.vencimento_dia}`} />
                <Campo label="Atualizado" valor={formatarData(l.updated_at)} />
              </dl>
              {l.observacoes ? (
                <p className="mt-4 border-t pt-3 text-xs whitespace-pre-line text-muted-foreground">
                  {l.observacoes}
                </p>
              ) : null}
            </article>
          ))
        )}
      </div>

      <LocacaoDialog open={dialogAberto} onOpenChange={setDialogAberto} registro={emEdicao} />

      <AlertDialog open={Boolean(paraExcluir)} onOpenChange={() => setParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir esta locação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é permanente e remove o contrato do painel.
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
    </ModuleShell>
  );
}

export function AdministracaoModule() {
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState("");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<ImovelAdministrado | null>(null);
  const [paraExcluir, setParaExcluir] = useState<ImovelAdministrado | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["imoveis-administrados"],
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
      const { error } = await supabase.from("imoveis_administrados").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["imoveis-administrados"] });
      toast.success("Imóvel excluído");
      setParaExcluir(null);
    },
    onError: (error: Error) => toast.error("Erro ao excluir", { description: error.message }),
  });

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const lista = data ?? [];
    if (!termo) return lista;
    return lista.filter((i) =>
      [i.imovel, i.proprietario, i.responsavel, i.manutencao_aberta]
        .join(" ")
        .toLowerCase()
        .includes(termo),
    );
  }, [data, busca]);

  const lista = data ?? [];
  const totalRepasse = lista.reduce((soma, i) => soma + Number(i.repasse_previsto || 0), 0);

  return (
    <ModuleShell
      title="Administração de Imóveis"
      description="Organize imóveis administrados, repasses, manutenções, documentos e relacionamento com proprietários."
      stats={[
        { label: "Imóveis", valor: lista.length },
        { label: "Repasse previsto", valor: formatarMoeda(totalRepasse) },
        {
          label: "Manutenções abertas",
          valor: lista.filter((i) => i.manutencao_aberta.trim().length > 0).length,
        },
        { label: "Concluídos", valor: lista.filter((i) => i.status === "concluido").length },
      ]}
    >
      <Toolbar
        busca={busca}
        setBusca={setBusca}
        onNovo={() => {
          setEmEdicao(null);
          setDialogAberto(true);
        }}
        placeholder="Buscar imóvel, proprietário, responsável..."
        novoLabel="Novo imóvel"
      />

      <div className="space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </>
        ) : filtrados.length === 0 ? (
          <Vazio texto="Nenhum imóvel administrado cadastrado. Cadastre o primeiro para começar." />
        ) : (
          filtrados.map((i) => (
            <article key={i.id} className="shadow-soft rounded-2xl border bg-card p-4 sm:p-5">
              <CardHeaderRow
                titulo={i.imovel || "Imóvel não informado"}
                status={i.status}
                onEditar={() => {
                  setEmEdicao(i);
                  setDialogAberto(true);
                }}
                onExcluir={() => setParaExcluir(i)}
              />
              <dl className="mt-4 grid grid-cols-2 gap-4 text-sm lg:grid-cols-4">
                <Campo label="Proprietário" valor={i.proprietario} />
                <Campo label="Responsável" valor={i.responsavel} />
                <Campo label="Taxa" valor={`${i.taxa_administracao || 0}%`} />
                <Campo label="Repasse" valor={formatarMoeda(Number(i.repasse_previsto))} />
                <Campo label="Condomínio/IPTU" valor={i.condominio_iptu} />
                <Campo label="Manutenção" valor={i.manutencao_aberta} />
                <Campo label="Atualizado" valor={formatarData(i.updated_at)} />
              </dl>
              {i.observacoes ? (
                <p className="mt-4 border-t pt-3 text-xs whitespace-pre-line text-muted-foreground">
                  {i.observacoes}
                </p>
              ) : null}
            </article>
          ))
        )}
      </div>

      <AdministracaoDialog
        open={dialogAberto}
        onOpenChange={setDialogAberto}
        registro={emEdicao}
      />

      <AlertDialog open={Boolean(paraExcluir)} onOpenChange={() => setParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir este imóvel?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é permanente e remove o imóvel do painel de administração.
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
    </ModuleShell>
  );
}
