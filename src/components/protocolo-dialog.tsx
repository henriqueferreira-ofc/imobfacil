import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
  ESTADOS_UF,
  formatarCep,
  STATUS_LABEL,
  TIPO_IMOVEL_LABEL,
  TIPO_NEGOCIACAO_LABEL,
  type Protocolo,
} from "@/lib/protocolos";

type FormState = Pick<
  Protocolo,
  | "vendedores"
  | "compradores"
  | "endereco"
  | "endereco"
  | "numero_casa"
  | "bairro"
  | "cep"
  | "cidade"
  | "estado"
  | "matricula"
  | "cif"
  | "tipo_imovel"
  | "tipo_negociacao"
  | "status"
  | "historico"
>;

const vazio: FormState = {
  vendedores: "",
  compradores: "",
  imovel: "",
  endereco: "",
  numero_casa: "",
  bairro: "",
  cep: "",
  cidade: "",
  estado: "",
  matricula: "",
  cif: "",
  tipo_imovel: "casa",
  tipo_negociacao: "a_vista",
  status: "em_andamento",
  historico: "",
};

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
      if (protocolo) {
        const { error } = await supabase.from("protocolos").update(form).eq("id", protocolo.id);
        if (error) throw error;
        return protocolo.numero;
      }
      const { data, error } = await supabase
        .from("protocolos")
        .insert(form)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
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
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            salvar.mutate();
          }}
        >
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="vendedores">Vendedor(es)</Label>
            <Input
              id="vendedores"
              value={form.vendedores}
              onChange={(e) => set("vendedores", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="compradores">Comprador(es)</Label>
            <Input
              id="compradores"
              value={form.compradores}
              onChange={(e) => set("compradores", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="imovel">Identificação do imóvel</Label>
            <Input
              id="imovel"
              value={form.imovel}
              onChange={(e) => set("imovel", e.target.value)}
              placeholder="Ex.: Quadra 15, Casa 54"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <p className="text-eyebrow text-muted-foreground">Endereço do imóvel</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="endereco">Endereço (rua/avenida)</Label>
            <Input
              id="endereco"
              value={form.endereco}
              onChange={(e) => set("endereco", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="numero_casa">Número</Label>
            <Input
              id="numero_casa"
              value={form.numero_casa}
              onChange={(e) => set("numero_casa", e.target.value)}
              inputMode="numeric"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bairro">Bairro</Label>
            <Input
              id="bairro"
              value={form.bairro}
              onChange={(e) => set("bairro", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              value={form.cep}
              onChange={(e) => set("cep", formatarCep(e.target.value))}
              inputMode="numeric"
              placeholder="00000-000"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
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
          <div className="space-y-1.5">
            <Label htmlFor="matricula">Matrícula</Label>
            <Input
              id="matricula"
              value={form.matricula}
              onChange={(e) => set("matricula", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cif">CIF</Label>
            <Input id="cif" value={form.cif} onChange={(e) => set("cif", e.target.value)} />
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

          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={salvar.isPending}>
              {salvar.isPending ? "Salvando..." : "Salvar protocolo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
