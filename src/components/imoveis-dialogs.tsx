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
import { ESTADOS_UF, formatarCep } from "@/lib/protocolos";
import {
  STATUS_VISTORIA_LABEL,
  type ImovelAdministrado,
  type Locacao,
} from "@/lib/imoveis";

type LocacaoForm = {
  endereco: string;
  numero_casa: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
  proprietario: string;
  locatario: string;
  valor_aluguel: string;
  garantia: string;
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
  proprietario: "",
  locatario: "",
  valor_aluguel: "",
  garantia: "",
  inicio_contrato: "",
  vencimento_dia: "5",
  status_vistoria: "em_analise",
  observacoes: "",
};

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
            proprietario: registro.proprietario ?? "",
            locatario: registro.locatario ?? "",
            valor_aluguel: String(registro.valor_aluguel ?? ""),
            garantia: registro.garantia ?? "",
            inicio_contrato: registro.inicio_contrato ?? "",
            vencimento_dia: String(registro.vencimento_dia ?? 5),
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
        proprietario: form.proprietario,
        locatario: form.locatario,
        valor_aluguel: Number(form.valor_aluguel.replace(",", ".")) || 0,
        garantia: form.garantia,
        inicio_contrato: form.inicio_contrato || null,
        vencimento_dia: Number(form.vencimento_dia) || 5,
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
          <div className="bg-muted/40 grid gap-4 rounded-xl border p-4 sm:col-span-2 sm:grid-cols-2">
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.18em] sm:col-span-2">
              Imóvel para locação
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="loc-endereco">Endereço (rua/avenida)</Label>
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
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="loc-prop">Proprietário</Label>
            <Input
              id="loc-prop"
              value={form.proprietario}
              onChange={(e) => set("proprietario", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="loc-locatario">Locatário</Label>
            <Input
              id="loc-locatario"
              value={form.locatario}
              onChange={(e) => set("locatario", e.target.value)}
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
            <Label htmlFor="loc-garantia">Garantia</Label>
            <Input
              id="loc-garantia"
              value={form.garantia}
              onChange={(e) => set("garantia", e.target.value)}
              placeholder="Fiador, caução, seguro-fiança"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="loc-inicio">Início do contrato</Label>
            <Input
              id="loc-inicio"
              type="date"
              value={form.inicio_contrato}
              onChange={(e) => set("inicio_contrato", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="loc-venc">Vencimento mensal (dia)</Label>
            <Input
              id="loc-venc"
              value={form.vencimento_dia}
              onChange={(e) => set("vencimento_dia", e.target.value.replace(/\D/g, "").slice(0, 2))}
              inputMode="numeric"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Status da vistoria</Label>
            <Select
              value={form.status_vistoria}
              onValueChange={(v) => set("status_vistoria", v)}
            >
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
