import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Paperclip, FileCheck2, Loader2, X } from "lucide-react";
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
import {
  BAIRROS,
  BANCOS,
  STATUS_LABEL,
  TIPO_IMOVEL_LABEL,
  TIPO_NEGOCIACAO_LABEL,
  type Protocolo,
} from "@/lib/protocolos";

type FormState = Pick<
  Protocolo,
  | "vendedores"
  | "compradores"
  | "corretor"
  | "endereco"
  | "numero_casa"
  | "bairro"
  | "cep"
  | "cidade"
  | "estado"
  | "matricula"
  | "cif"
  | "contrato"
  | "banco"
  | "matricula_doc_url"
  | "cif_doc_url"
  | "contrato_doc_url"
  | "tipo_imovel"
  | "tipo_negociacao"
  | "status"
  | "historico"
>;

const vazio: FormState = {
  vendedores: "",
  compradores: "",
  corretor: "",
  endereco: "",
  numero_casa: "",
  bairro: "",
  cep: "",
  cidade: "",
  estado: "",
  matricula: "",
  cif: "",
  contrato: "",
  banco: "",
  matricula_doc_url: "",
  cif_doc_url: "",
  contrato_doc_url: "",
  tipo_imovel: "casa",
  tipo_negociacao: "a_vista",
  status: "em_andamento",
  historico: "",
};

type AnexoKey = "matricula_doc_url" | "cif_doc_url" | "contrato_doc_url";

function AnexoDocumento({
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
    const path = `${crypto.randomUUID()}.${ext}`;
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
    <div className="flex items-center gap-1">
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

function BlocoTitulo({ children }: { children: React.ReactNode }) {
  return (
    <div className="sm:col-span-2">
      <p className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-sm font-extrabold uppercase text-primary shadow-sm">
        {children}
      </p>
    </div>
  );
}

export function ProtocoloDialog({
  open,
  onOpenChange,
  protocolo,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  protocolo: Protocolo | null;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(vazio);

  useEffect(() => {
    if (!open) return;
    setForm(protocolo ? { ...vazio, ...protocolo } : vazio);
  }, [open, protocolo]);

  const salvar = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        banco: form.tipo_negociacao === "financiamento" ? form.banco : "",
      };
      if (protocolo) {
        const { error } = await supabase.from("protocolos").update(payload).eq("id", protocolo.id);
        if (error) throw error;
        return protocolo.numero;
      }
      const { data, error } = await supabase
        .from("protocolos")
        .insert(payload)
        .select("numero")
        .single();
      if (error) throw error;
      return data.numero as string;
    },
    onSuccess: (numero) => {
      queryClient.invalidateQueries({ queryKey: ["protocolos"] });
      toast.success(protocolo ? "Protocolo atualizado" : `Protocolo ${numero} criado`);
      onOpenChange(false);
    },
    onError: (error: Error) => toast.error("Erro ao salvar", { description: error.message }),
  });

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setAnexo(key: AnexoKey, path: string) {
    setForm((prev) => ({ ...prev, [key]: path }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">
            {protocolo ? `Editar ${protocolo.numero}` : "Novo protocolo"}
          </DialogTitle>
          <DialogDescription>
            {protocolo
              ? "As alterações ficam visíveis na consulta pública imediatamente."
              : "O número do protocolo é gerado automaticamente ao salvar."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            salvar.mutate();
          }}
        >
          <section className="bg-muted/40 grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
            <BlocoTitulo>Vendedor(es)</BlocoTitulo>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="vendedores" className="sr-only">
                Vendedor(es)
              </Label>
              <Input
                id="vendedores"
                value={form.vendedores}
                onChange={(e) => set("vendedores", e.target.value)}
                required
              />
            </div>

            <BlocoTitulo>Comprador(es)</BlocoTitulo>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="compradores" className="sr-only">
                Comprador(es)
              </Label>
              <Input
                id="compradores"
                value={form.compradores}
                onChange={(e) => set("compradores", e.target.value)}
                required
              />
            </div>

            <BlocoTitulo>Corretor responsável</BlocoTitulo>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="corretor" className="sr-only">
                Corretor responsável
              </Label>
              <Input
                id="corretor"
                value={form.corretor}
                onChange={(e) => set("corretor", e.target.value)}
              />
            </div>
          </section>

          <section className="bg-muted/40 grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
            <BlocoTitulo>Endereço do imóvel</BlocoTitulo>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="endereco">Endereço (rua/avenida)</Label>
              <Input
                id="endereco"
                value={form.endereco}
                onChange={(e) => set("endereco", e.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Bairro</Label>
              <Select value={form.bairro} onValueChange={(v) => set("bairro", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o bairro" />
                </SelectTrigger>
                <SelectContent>
                  {BAIRROS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="bg-muted/40 grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
            <BlocoTitulo>Documentos</BlocoTitulo>
            <div className="space-y-1.5">
              <Label htmlFor="matricula">Matrícula</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="matricula"
                  value={form.matricula}
                  onChange={(e) => set("matricula", e.target.value)}
                />
                <AnexoDocumento
                  label="Matrícula"
                  valor={form.matricula_doc_url}
                  onChange={(p) => setAnexo("matricula_doc_url", p)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cif">CIF</Label>
              <div className="flex items-center gap-2">
                <Input id="cif" value={form.cif} onChange={(e) => set("cif", e.target.value)} />
                <AnexoDocumento
                  label="CIF"
                  valor={form.cif_doc_url}
                  onChange={(p) => setAnexo("cif_doc_url", p)}
                />
              </div>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="contrato">Contrato</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="contrato"
                  value={form.contrato}
                  onChange={(e) => set("contrato", e.target.value)}
                />
                <AnexoDocumento
                  label="Contrato"
                  valor={form.contrato_doc_url}
                  onChange={(p) => setAnexo("contrato_doc_url", p)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Tipo de imóvel</Label>
              <Select
                value={form.tipo_imovel}
                onValueChange={(v) => set("tipo_imovel", v as FormState["tipo_imovel"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPO_IMOVEL_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de negociação</Label>
              <Select
                value={form.tipo_negociacao}
                onValueChange={(v) => set("tipo_negociacao", v as FormState["tipo_negociacao"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPO_NEGOCIACAO_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.tipo_negociacao === "financiamento" && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Banco</Label>
                <Select value={form.banco} onValueChange={(v) => set("banco", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o banco" />
                  </SelectTrigger>
                  <SelectContent>
                    {BANCOS.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </section>

          <section className="bg-muted/40 grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
            <BlocoTitulo>Status e histórico</BlocoTitulo>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set("status", v as FormState["status"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="historico">Histórico</Label>
              <Textarea
                id="historico"
                rows={7}
                value={form.historico}
                onChange={(e) => set("historico", e.target.value)}
                placeholder={"25/08/2026 - Proposta aceita.\n26/08/2026 - Documentos enviados."}
              />
              <p className="text-xs text-muted-foreground">
                Uma linha por andamento — cada linha aparece como um item da linha do tempo.
              </p>
            </div>
          </section>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={salvar.isPending}>
              {salvar.isPending ? "Salvando..." : "Salvar protocolo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
