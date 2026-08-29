import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileCheck2, Loader2, Paperclip, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ESTADOS_UF, formatarCep } from "@/lib/protocolos";
import { STATUS_VISTORIA_LABEL, type ImovelAdministrado, type Locacao } from "@/lib/imoveis";

type LocacaoForm = {
  endereco: string;
  numero_casa: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
  locatario_tipo_pessoa: string;
  proprietario: string;
  proprietario_email: string;
  proprietario_celular: string;
  proprietario_doc_url: string;
  locatario: string;
  locatario_profissao: string;
  locatario_estado_civil: string;
  locatario_email: string;
  locatario_celular: string;
  locatario_doc_url: string;
  descricao_imovel: string;
  tipo_locacao: string;
  prazo: string;
  administracao: string;
  valor_aluguel: string;
  inicio_contrato: string;
  vencimento_dia: string;
  status_vistoria: string;
  observacoes: string;
};

const locacaoVazia: LocacaoForm = {
  endereco: "",
  numero_casa: "",
  bairro: "",
  cep: "",
  cidade: "",
  estado: "",
  locatario_tipo_pessoa: "fisica",
  proprietario: "",
  proprietario_email: "",
  proprietario_celular: "",
  proprietario_doc_url: "",
  locatario: "",
  locatario_profissao: "",
  locatario_estado_civil: "",
  locatario_email: "",
  locatario_celular: "",
  locatario_doc_url: "",
  descricao_imovel: "",
  tipo_locacao: "residencial",
  prazo: "",
  administracao: "nao",
  valor_aluguel: "",
  inicio_contrato: "",
  vencimento_dia: "4",
  status_vistoria: "em_analise",
  observacoes: "",
};

type LocacaoAnexoKey = "proprietario_doc_url" | "locatario_doc_url";

function AnexoLocacaoDocumento({
  valor,
  onChange,
  label,
}: {
  valor: string;
  onChange: (path: string) => void;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(file: File) {
    setEnviando(true);
    const ext = file.name.split(".").pop() ?? "pdf";
    const path = `locacoes/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("protocolo-docs").upload(path, file);
    setEnviando(false);
    if (error) {
      toast.error(`Erro ao anexar ${label}`, { description: error.message });
      return;
    }
    onChange(path);
    toast.success(`${label}: documento anexado`);
  }

  async function abrir() {
    const { data, error } = await supabase.storage
      .from("protocolo-docs")
      .createSignedUrl(valor, 300);
    if (error || !data) {
      toast.error("Não foi possível abrir o documento");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex shrink-0 items-center gap-1">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void enviar(file);
          e.target.value = "";
        }}
      />
      {valor ? (
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void abrir()}
            title="Ver documento anexado"
          >
            <FileCheck2 className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange("")}
            title="Remover anexo"
          >
            <X className="size-4" />
          </Button>
        </>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={enviando}
          onClick={() => inputRef.current?.click()}
          title={`Anexar documento de ${label}`}
        >
          {enviando ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Paperclip className="size-4" />
          )}
        </Button>
      )}
    </div>
  );
}

export function LocacaoDialog({
  open,
  onOpenChange,
  registro,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registro: Locacao | null;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<LocacaoForm>(locacaoVazia);

  useEffect(() => {
    if (!open) return;
    setForm(
      registro
        ? {
            endereco: registro.endereco ?? "",
            numero_casa: registro.numero_casa ?? "",
            bairro: registro.bairro ?? "",
            cep: registro.cep ?? "",
            cidade: registro.cidade ?? "",
            estado: registro.estado ?? "",
            locatario_tipo_pessoa: registro.locatario_tipo_pessoa ?? "fisica",
            proprietario: registro.proprietario ?? "",
            proprietario_email: registro.proprietario_email ?? "",
            proprietario_celular: registro.proprietario_celular ?? "",
            proprietario_doc_url: registro.proprietario_doc_url ?? "",
            locatario: registro.locatario ?? "",
            locatario_profissao: registro.locatario_profissao ?? "",
            locatario_estado_civil: registro.locatario_estado_civil ?? "",
            locatario_email: registro.locatario_email ?? "",
            locatario_celular: registro.locatario_celular ?? "",
            locatario_doc_url: registro.locatario_doc_url ?? "",
            descricao_imovel: registro.descricao_imovel ?? "",
            tipo_locacao: registro.tipo_locacao ?? "residencial",
            prazo: registro.prazo ?? "",
            administracao: registro.administracao ? "sim" : "nao",
            valor_aluguel: String(registro.valor_aluguel ?? ""),
            inicio_contrato: registro.inicio_contrato ?? "",
            vencimento_dia: String(registro.vencimento_dia ?? 4),
            status_vistoria: registro.status_vistoria ?? "em_analise",
            observacoes: registro.observacoes ?? "",
          }
        : locacaoVazia,
    );
  }, [open, registro]);

  const salvar = useMutation({
    mutationFn: async () => {
      const payload = {
        endereco: form.endereco,
        numero_casa: form.numero_casa,
        bairro: form.bairro,
        cep: form.cep,
        cidade: form.cidade,
        estado: form.estado,
        locatario_tipo_pessoa: form.locatario_tipo_pessoa,
        proprietario: form.proprietario,
        proprietario_email: form.proprietario_email,
        proprietario_celular: form.proprietario_celular,
        proprietario_doc_url: form.proprietario_doc_url,
        locatario: form.locatario,
        locatario_profissao: form.locatario_profissao,
        locatario_estado_civil: form.locatario_estado_civil,
        locatario_email: form.locatario_email,
        locatario_celular: form.locatario_celular,
        locatario_doc_url: form.locatario_doc_url,
        descricao_imovel: form.descricao_imovel,
        tipo_locacao: form.tipo_locacao,
        prazo: form.prazo,
        administracao: form.administracao === "sim",
        valor_aluguel: Number(form.valor_aluguel.replace(",", ".")) || 0,
        inicio_contrato: form.inicio_contrato || null,
        vencimento_dia: Number(form.vencimento_dia) || 4,
        status_vistoria: form.status_vistoria,
        observacoes: form.observacoes,
      };
      if (registro) {
        const { error } = await supabase.from("locacoes").update(payload).eq("id", registro.id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("locacoes").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locacoes"] });
      toast.success(registro ? "Locação atualizada" : "Locação cadastrada");
      onOpenChange(false);
    },
    onError: (error: Error) => toast.error("Erro ao salvar", { description: error.message }),
  });

  function set<K extends keyof LocacaoForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setAnexo(key: LocacaoAnexoKey, path: string) {
    setForm((prev) => ({ ...prev, [key]: path }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">
            {registro ? "Editar locação" : "Nova locação"}
          </DialogTitle>
          <DialogDescription>
            Contrato, partes envolvidas, aluguel e status da vistoria.
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            salvar.mutate();
          }}
        >
          <div className="bg-muted/40 grid gap-4 rounded-xl border p-4 sm:col-span-2">
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.18em]">
              Locador e Locatário
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <section className="relative grid gap-4 rounded-xl border bg-background/70 p-3">
                <div className="absolute right-3 top-3">
                  <AnexoLocacaoDocumento
                    label="locador"
                    valor={form.proprietario_doc_url}
                    onChange={(path) => setAnexo("proprietario_doc_url", path)}
                  />
                </div>
                <h3 className="text-center text-sm font-bold uppercase tracking-wide">Locador</h3>
                <div className="space-y-1.5">
                  <Label htmlFor="loc-prop">Locador</Label>
                  <Input
                    id="loc-prop"
                    value={form.proprietario}
                    onChange={(e) => set("proprietario", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="loc-prop-email">E-mail</Label>
                  <Input
                    id="loc-prop-email"
                    type="email"
                    value={form.proprietario_email}
                    onChange={(e) => set("proprietario_email", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="loc-prop-celular">Celular</Label>
                  <Input
                    id="loc-prop-celular"
                    value={form.proprietario_celular}
                    onChange={(e) => set("proprietario_celular", e.target.value)}
                    inputMode="tel"
                  />
                </div>
              </section>

              <section className="relative grid gap-4 rounded-xl border bg-background/70 p-3">
                <AnexoLocacaoDocumento
                  label="locatário"
                  valor={form.locatario_doc_url}
                  onChange={(path) => setAnexo("locatario_doc_url", path)}
                />
                <h3 className="text-center text-sm font-bold uppercase tracking-wide">Locatário</h3>
                <div className="space-y-1.5">
                  <Label>Tipo de pessoa</Label>
                  <Select
                    value={form.locatario_tipo_pessoa}
                    onValueChange={(v) => set("locatario_tipo_pessoa", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fisica">Pessoa física</SelectItem>
                      <SelectItem value="juridica">Pessoa jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="loc-locatario">Locatário</Label>
                  <Input
                    id="loc-locatario"
                    value={form.locatario}
                    onChange={(e) => set("locatario", e.target.value)}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="loc-profissao">Profissão</Label>
                    <Input
                      id="loc-profissao"
                      value={form.locatario_profissao}
                      onChange={(e) => set("locatario_profissao", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Estado civil</Label>
                    <Select
                      value={form.locatario_estado_civil}
                      onValueChange={(v) => set("locatario_estado_civil", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="casado">Casado</SelectItem>
                        <SelectItem value="solteiro">Solteiro</SelectItem>
                        <SelectItem value="divorciado">Divorciado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="loc-email">E-mail</Label>
                  <Input
                    id="loc-email"
                    type="email"
                    value={form.locatario_email}
                    onChange={(e) => set("locatario_email", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="loc-celular">Celular</Label>
                  <Input
                    id="loc-celular"
                    value={form.locatario_celular}
                    onChange={(e) => set("locatario_celular", e.target.value)}
                    inputMode="tel"
                  />
                </div>
              </section>
            </div>
          </div>

          <div className="bg-muted/40 grid gap-4 rounded-xl border p-4 sm:col-span-2 sm:grid-cols-2">
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.18em] sm:col-span-2">
              Dados do imóvel
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="loc-endereco">Endereço</Label>
              <Input
                id="loc-endereco"
                value={form.endereco}
                onChange={(e) => set("endereco", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loc-numero">Número</Label>
              <Input
                id="loc-numero"
                value={form.numero_casa}
                onChange={(e) => set("numero_casa", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loc-bairro">Bairro</Label>
              <Input
                id="loc-bairro"
                value={form.bairro}
                onChange={(e) => set("bairro", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loc-cep">CEP</Label>
              <Input
                id="loc-cep"
                value={form.cep}
                onChange={(e) => set("cep", formatarCep(e.target.value))}
                placeholder="00000-000"
                inputMode="numeric"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loc-cidade">Cidade</Label>
              <Input
                id="loc-cidade"
                value={form.cidade}
                onChange={(e) => set("cidade", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Estado (UF)</Label>
              <Select value={form.estado} onValueChange={(v) => set("estado", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_UF.map((uf) => (
                    <SelectItem key={uf} value={uf}>
                      {uf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="loc-descricao">Descrição do imóvel</Label>
              <Textarea
                id="loc-descricao"
                rows={4}
                value={form.descricao_imovel}
                onChange={(e) => set("descricao_imovel", e.target.value)}
              />
            </div>
          </div>

          <div className="bg-muted/40 grid gap-4 rounded-xl border p-4 sm:col-span-2 sm:grid-cols-2">
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.18em] sm:col-span-2">
              Dados da negociação
            </p>
            <div className="space-y-1.5">
              <Label>Tipo de locação</Label>
              <Select value={form.tipo_locacao} onValueChange={(v) => set("tipo_locacao", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residencial">Residencial</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loc-prazo">Prazo</Label>
              <Input
                id="loc-prazo"
                value={form.prazo}
                onChange={(e) => set("prazo", e.target.value)}
                placeholder="Ex.: 12 meses"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loc-inicio">Início</Label>
              <Input
                id="loc-inicio"
                type="date"
                value={form.inicio_contrato}
                onChange={(e) => set("inicio_contrato", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loc-valor">Valor do aluguel (R$)</Label>
              <Input
                id="loc-valor"
                value={form.valor_aluguel}
                onChange={(e) => set("valor_aluguel", e.target.value)}
                inputMode="decimal"
                placeholder="1500"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Vencimento</Label>
              <Select value={form.vencimento_dia} onValueChange={(v) => set("vencimento_dia", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">Dia 04</SelectItem>
                  <SelectItem value="10">Dia 10</SelectItem>
                  <SelectItem value="20">Dia 20</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Administração</Label>
              <Select value={form.administracao} onValueChange={(v) => set("administracao", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sim">Sim</SelectItem>
                  <SelectItem value="nao">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-muted/40 grid gap-4 rounded-xl border p-4 sm:col-span-2">
            <Label>Status da vistoria</Label>
            <Select value={form.status_vistoria} onValueChange={(v) => set("status_vistoria", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_VISTORIA_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="loc-obs">Histórico e observações</Label>
            <Textarea
              id="loc-obs"
              rows={6}
              value={form.observacoes}
              onChange={(e) => set("observacoes", e.target.value)}
              placeholder="Registre movimentações, pendências e próximos passos."
            />
          </div>

          <DialogFooter className="gap-2 sm:col-span-2">
            <Button
              type="button"
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={salvar.isPending}>
              {salvar.isPending ? "Salvando..." : "Salvar cadastro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type AdmForm = {
  imovel: string;
  proprietario: string;
  responsavel: string;
  taxa_administracao: string;
  repasse_previsto: string;
  condominio_iptu: string;
  manutencao_aberta: string;
  status: string;
  observacoes: string;
};

const admVazio: AdmForm = {
  imovel: "",
  proprietario: "",
  responsavel: "",
  taxa_administracao: "",
  repasse_previsto: "",
  condominio_iptu: "",
  manutencao_aberta: "",
  status: "em_analise",
  observacoes: "",
};

export function AdministracaoDialog({
  open,
  onOpenChange,
  registro,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registro: ImovelAdministrado | null;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AdmForm>(admVazio);

  useEffect(() => {
    if (!open) return;
    setForm(
      registro
        ? {
            imovel: registro.imovel ?? "",
            proprietario: registro.proprietario ?? "",
            responsavel: registro.responsavel ?? "",
            taxa_administracao: String(registro.taxa_administracao ?? ""),
            repasse_previsto: String(registro.repasse_previsto ?? ""),
            condominio_iptu: registro.condominio_iptu ?? "",
            manutencao_aberta: registro.manutencao_aberta ?? "",
            status: registro.status ?? "em_analise",
            observacoes: registro.observacoes ?? "",
          }
        : admVazio,
    );
  }, [open, registro]);

  const salvar = useMutation({
    mutationFn: async () => {
      const payload = {
        imovel: form.imovel,
        proprietario: form.proprietario,
        responsavel: form.responsavel,
        taxa_administracao: Number(form.taxa_administracao.replace(",", ".")) || 0,
        repasse_previsto: Number(form.repasse_previsto.replace(",", ".")) || 0,
        condominio_iptu: form.condominio_iptu,
        manutencao_aberta: form.manutencao_aberta,
        status: form.status,
        observacoes: form.observacoes,
      };
      if (registro) {
        const { error } = await supabase
          .from("imoveis_administrados")
          .update(payload)
          .eq("id", registro.id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("imoveis_administrados").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["imoveis-administrados"] });
      toast.success(registro ? "Imóvel atualizado" : "Imóvel cadastrado");
      onOpenChange(false);
    },
    onError: (error: Error) => toast.error("Erro ao salvar", { description: error.message }),
  });

  function set<K extends keyof AdmForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">
            {registro ? "Editar imóvel administrado" : "Novo imóvel administrado"}
          </DialogTitle>
          <DialogDescription>
            Repasses, manutenções e relacionamento com o proprietário.
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            salvar.mutate();
          }}
        >
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="adm-imovel">Imóvel administrado</Label>
            <Input
              id="adm-imovel"
              value={form.imovel}
              onChange={(e) => set("imovel", e.target.value)}
              placeholder="Rua, número, bairro, cidade"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="adm-prop">Proprietário</Label>
            <Input
              id="adm-prop"
              value={form.proprietario}
              onChange={(e) => set("proprietario", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="adm-resp">Responsável interno</Label>
            <Input
              id="adm-resp"
              value={form.responsavel}
              onChange={(e) => set("responsavel", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="adm-taxa">Taxa de administração (%)</Label>
            <Input
              id="adm-taxa"
              value={form.taxa_administracao}
              onChange={(e) => set("taxa_administracao", e.target.value)}
              inputMode="decimal"
              placeholder="10"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="adm-repasse">Repasse previsto (R$)</Label>
            <Input
              id="adm-repasse"
              value={form.repasse_previsto}
              onChange={(e) => set("repasse_previsto", e.target.value)}
              inputMode="decimal"
              placeholder="1350"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="adm-cond">Condomínio / IPTU</Label>
            <Input
              id="adm-cond"
              value={form.condominio_iptu}
              onChange={(e) => set("condominio_iptu", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="adm-manut">Manutenção aberta</Label>
            <Input
              id="adm-manut"
              value={form.manutencao_aberta}
              onChange={(e) => set("manutencao_aberta", e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_VISTORIA_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="adm-obs">Observações do proprietário</Label>
            <Textarea
              id="adm-obs"
              rows={6}
              value={form.observacoes}
              onChange={(e) => set("observacoes", e.target.value)}
            />
          </div>

          <DialogFooter className="gap-2 sm:col-span-2">
            <Button
              type="button"
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={salvar.isPending}>
              {salvar.isPending ? "Salvando..." : "Salvar cadastro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
