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

const CAMPOS_LOCACAO_TEXTO = [
  "endereco",
  "numero_casa",
  "bairro",
  "cep",
  "cidade",
  "estado",
  "proprietario",
  "proprietario_profissao",
  "proprietario_estado_civil",
  "proprietario_rg",
  "proprietario_orgao_expedidor",
  "proprietario_cpf",
  "proprietario_email",
  "proprietario_celular",
  "proprietario_contato_referencia",
  "proprietario_doc_tipo",
  "proprietario_doc_url",
  "proprietario_comp_residencia_url",
  "proprietario_comp_renda_url",
  "locatario_tipo_pessoa",
  "locatario",
  "locatario_estado_civil",
  "locatario_profissao",
  "locatario_rg",
  "locatario_orgao_expedidor",
  "locatario_cpf",
  "locatario_email",
  "locatario_celular",
  "locatario_contato_referencia",
  "locatario_doc_tipo",
  "locatario_doc_url",
  "locatario_comp_residencia_url",
  "locatario_comp_renda_url",
  "empresa_nome",
  "empresa_cnpj",
  "empresa_insc_estadual",
  "empresa_endereco",
  "empresa_bairro",
  "empresa_cidade",
  "empresa_estado",
  "empresa_cartao_cnpj_url",
  "empresa_comp_residencia_url",
  "empresa_outros_doc_url",
  "resp_nome",
  "resp_estado_civil",
  "resp_profissao",
  "resp_rg",
  "resp_orgao_expedidor",
  "resp_cpf",
  "resp_email",
  "resp_celular",
  "resp_contato_referencia",
  "resp_doc_tipo",
  "resp_doc_url",
  "resp_comp_residencia_url",
  "resp_comp_renda_url",
  "imovel_conta_energia_url",
  "imovel_conta_agua_url",
  "imovel_outros_doc_url",
  "descricao_imovel",
  "tipo_locacao",
  "prazo",
  "administracao",
  "garantia_caucao",
  "valor_aluguel",
  "valor_caucao",
  "inicio_contrato",
  "data_pagamento",
  "status_vistoria",
  "observacoes",
] as const;

type LocacaoCampo = (typeof CAMPOS_LOCACAO_TEXTO)[number];
type LocacaoForm = Record<LocacaoCampo, string>;

const locacaoVazia: LocacaoForm = CAMPOS_LOCACAO_TEXTO.reduce((acc, campo) => {
  acc[campo] = "";
  return acc;
}, {} as LocacaoForm);

locacaoVazia.locatario_tipo_pessoa = "fisica";
locacaoVazia.tipo_locacao = "residencial";
locacaoVazia.administracao = "nao";
locacaoVazia.garantia_caucao = "nao";
locacaoVazia.status_vistoria = "em_analise";
locacaoVazia.proprietario_doc_tipo = "rg";
locacaoVazia.locatario_doc_tipo = "rg";
locacaoVazia.resp_doc_tipo = "rg";

function AnexoBotao({
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
          title={`Anexar ${label}`}
        >
          {enviando ? <Loader2 className="size-4 animate-spin" /> : <Paperclip className="size-4" />}
        </Button>
      )}
    </div>
  );
}

function LinhaAnexo({
  nome,
  valor,
  onChange,
}: {
  nome: string;
  valor: string;
  onChange: (path: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border bg-background px-3 py-2">
      <span className="min-w-0 truncate text-sm">{nome}</span>
      <AnexoBotao label={nome} valor={valor} onChange={onChange} />
    </div>
  );
}

function BlocoTitulo({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase sm:col-span-2">
      {children}
    </p>
  );
}

export function LocacaoDialog({
  open,
  onOpenChange,
  registro,
  publico = false,
  onPublicSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registro: Locacao | null;
  publico?: boolean;
  onPublicSuccess?: (codigo: string) => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<LocacaoForm>(locacaoVazia);

  useEffect(() => {
    if (!open) return;
    if (!registro) {
      setForm(locacaoVazia);
      return;
    }
    const registroQualquer = registro as unknown as Record<string, unknown>;
    const proximo = { ...locacaoVazia };
    for (const campo of CAMPOS_LOCACAO_TEXTO) {
      const valor = registroQualquer[campo];
      if (valor === null || valor === undefined) continue;
      if (typeof valor === "boolean") {
        proximo[campo] = valor ? "sim" : "nao";
      } else {
        proximo[campo] = String(valor);
      }
    }
    setForm(proximo);
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
        proprietario_profissao: form.proprietario_profissao,
        proprietario_estado_civil: form.proprietario_estado_civil,
        proprietario_rg: form.proprietario_rg,
        proprietario_orgao_expedidor: form.proprietario_orgao_expedidor,
        proprietario_cpf: form.proprietario_cpf,
        proprietario_email: form.proprietario_email,
        proprietario_celular: form.proprietario_celular,
        proprietario_contato_referencia: form.proprietario_contato_referencia,
        proprietario_doc_tipo: form.proprietario_doc_tipo,
        proprietario_doc_url: form.proprietario_doc_url,
        proprietario_comp_residencia_url: form.proprietario_comp_residencia_url,
        proprietario_comp_renda_url: form.proprietario_comp_renda_url,
        locatario_tipo_pessoa: form.locatario_tipo_pessoa,
        locatario: form.locatario,
        locatario_estado_civil: form.locatario_estado_civil,
        locatario_profissao: form.locatario_profissao,
        locatario_rg: form.locatario_rg,
        locatario_orgao_expedidor: form.locatario_orgao_expedidor,
        locatario_cpf: form.locatario_cpf,
        locatario_email: form.locatario_email,
        locatario_celular: form.locatario_celular,
        locatario_contato_referencia: form.locatario_contato_referencia,
        locatario_doc_tipo: form.locatario_doc_tipo,
        locatario_doc_url: form.locatario_doc_url,
        locatario_comp_residencia_url: form.locatario_comp_residencia_url,
        locatario_comp_renda_url: form.locatario_comp_renda_url,
        empresa_nome: form.empresa_nome,
        empresa_cnpj: form.empresa_cnpj,
        empresa_insc_estadual: form.empresa_insc_estadual,
        empresa_endereco: form.empresa_endereco,
        empresa_bairro: form.empresa_bairro,
        empresa_cidade: form.empresa_cidade,
        empresa_estado: form.empresa_estado,
        empresa_cartao_cnpj_url: form.empresa_cartao_cnpj_url,
        empresa_comp_residencia_url: form.empresa_comp_residencia_url,
        empresa_outros_doc_url: form.empresa_outros_doc_url,
        resp_nome: form.resp_nome,
        resp_estado_civil: form.resp_estado_civil,
        resp_profissao: form.resp_profissao,
        resp_rg: form.resp_rg,
        resp_orgao_expedidor: form.resp_orgao_expedidor,
        resp_cpf: form.resp_cpf,
        resp_email: form.resp_email,
        resp_celular: form.resp_celular,
        resp_contato_referencia: form.resp_contato_referencia,
        resp_doc_tipo: form.resp_doc_tipo,
        resp_doc_url: form.resp_doc_url,
        resp_comp_residencia_url: form.resp_comp_residencia_url,
        resp_comp_renda_url: form.resp_comp_renda_url,
        imovel_conta_energia_url: form.imovel_conta_energia_url,
        imovel_conta_agua_url: form.imovel_conta_agua_url,
        imovel_outros_doc_url: form.imovel_outros_doc_url,
        descricao_imovel: form.descricao_imovel,
        tipo_locacao: form.tipo_locacao,
        prazo: form.prazo,
        administracao: form.administracao === "sim",
        garantia_caucao: form.garantia_caucao === "sim",
        valor_aluguel: Number(form.valor_aluguel.replace(",", ".")) || 0,
        valor_caucao: Number(form.valor_caucao.replace(",", ".")) || 0,
        inicio_contrato: form.inicio_contrato || null,
        data_pagamento: form.data_pagamento || null,
        status_vistoria: form.status_vistoria || "em_analise",
        observacoes: form.observacoes,
      };
      if (publico) {
        const { data, error } = await supabase.rpc("cadastrar_locacao_publica", {
          p_payload: payload,
        });
        if (error) throw error;
        return data as string;
      }
      if (registro) {
        const { error } = await supabase.from("locacoes").update(payload).eq("id", registro.id);
        if (error) throw error;
        return undefined;
      }
      const { error } = await supabase.from("locacoes").insert(payload);
      if (error) throw error;
      return undefined;
    },
    onSuccess: (codigo) => {
      queryClient.invalidateQueries({ queryKey: ["locacoes"] });
      if (publico && codigo) {
        toast.success(`Locação cadastrada: ${codigo}`);
        onPublicSuccess?.(codigo);
        onOpenChange(false);
        return;
      }
      toast.success(registro ? "Locação atualizada" : "Locação cadastrada");
      onOpenChange(false);
    },
    onError: (error: Error) => toast.error("Erro ao salvar", { description: error.message }),
  });

  function set(key: LocacaoCampo, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function CampoTexto({
    campo,
    label,
    tipo,
    modo,
  }: {
    campo: LocacaoCampo;
    label: string;
    tipo?: string;
    modo?: "tel" | "numeric" | "decimal" | "email";
  }) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={`loc-${campo}`}>{label}</Label>
        <Input
          id={`loc-${campo}`}
          type={tipo}
          inputMode={modo}
          value={form[campo]}
          onChange={(e) => set(campo, e.target.value)}
        />
      </div>
    );
  }

  function CampoSelect({
    campo,
    label,
    opcoes,
    placeholder,
  }: {
    campo: LocacaoCampo;
    label: string;
    opcoes: Array<{ value: string; label: string }>;
    placeholder?: string;
  }) {
    return (
      <div className="space-y-1.5">
        <Label>{label}</Label>
        <Select value={form[campo]} onValueChange={(v) => set(campo, v)}>
          <SelectTrigger>
            <SelectValue placeholder={placeholder ?? "Selecione"} />
          </SelectTrigger>
          <SelectContent>
            {opcoes.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  function DocumentoIdentificacao({
    campoTipo,
    campoAnexo,
  }: {
    campoTipo: LocacaoCampo;
    campoAnexo: LocacaoCampo;
  }) {
    return (
      <div className="grid gap-2 sm:col-span-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <CampoSelect
          campo={campoTipo}
          label="Documento de identificação"
          opcoes={[
            { value: "rg", label: "RG" },
            { value: "cnh", label: "CNH" },
          ]}
        />
        <div className="sm:pb-1">
          <AnexoBotao
            label="documento de identificação"
            valor={form[campoAnexo]}
            onChange={(path) => set(campoAnexo, path)}
          />
        </div>
      </div>
    );
  }

  const pessoaJuridica = form.locatario_tipo_pessoa === "juridica";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-display">
            {registro ? "Editar locação" : "Nova locação"}
          </DialogTitle>
          <DialogDescription>
            {publico
              ? "Preencha os dados da locação. O administrador acompanhará o cadastro pelo painel."
              : "Locador, locatário, imóvel e dados da negociação."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            salvar.mutate();
          }}
        >
          {/* LOCADOR */}
          <section className="bg-muted/40 grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
            <BlocoTitulo>Locador</BlocoTitulo>
            <CampoTexto campo="proprietario" label="Nome" />
            <CampoTexto campo="proprietario_profissao" label="Profissão" />
            <CampoSelect
              campo="proprietario_estado_civil"
              label="Estado civil"
              opcoes={ESTADO_CIVIL_OPCOES}
            />
            <CampoTexto campo="proprietario_rg" label="RG" />
            <CampoTexto campo="proprietario_orgao_expedidor" label="Órgão expedidor" />
            <CampoTexto campo="proprietario_cpf" label="CPF" />
            <CampoTexto campo="proprietario_email" label="E-mail" tipo="email" />
            <CampoTexto campo="proprietario_celular" label="Celular" modo="tel" />
            <CampoTexto campo="proprietario_contato_referencia" label="Contato de referência" />

            <BlocoTitulo>Documentos do locador</BlocoTitulo>
            <DocumentoIdentificacao
              campoTipo="proprietario_doc_tipo"
              campoAnexo="proprietario_doc_url"
            />
            <LinhaAnexo
              nome="Comprovante de residência"
              valor={form.proprietario_comp_residencia_url}
              onChange={(p) => set("proprietario_comp_residencia_url", p)}
            />
            <LinhaAnexo
              nome="Comprovante de renda"
              valor={form.proprietario_comp_renda_url}
              onChange={(p) => set("proprietario_comp_renda_url", p)}
            />
          </section>

          {/* LOCATÁRIO */}
          <section className="bg-muted/40 grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
            <BlocoTitulo>Locatário</BlocoTitulo>
            <div className="sm:col-span-2">
              <CampoSelect
                campo="locatario_tipo_pessoa"
                label="Tipo de pessoa"
                opcoes={[
                  { value: "fisica", label: "Pessoa física" },
                  { value: "juridica", label: "Pessoa jurídica" },
                ]}
              />
            </div>

            {!pessoaJuridica ? (
              <>
                <CampoTexto campo="locatario" label="Nome" />
                <CampoSelect
                  campo="locatario_estado_civil"
                  label="Estado civil"
                  opcoes={ESTADO_CIVIL_OPCOES}
                />
                <CampoTexto campo="locatario_profissao" label="Profissão" />
                <CampoTexto campo="locatario_rg" label="RG" />
                <CampoTexto campo="locatario_orgao_expedidor" label="Órgão expedidor" />
                <CampoTexto campo="locatario_cpf" label="CPF" />
                <CampoTexto campo="locatario_email" label="E-mail" tipo="email" />
                <CampoTexto campo="locatario_celular" label="Celular" modo="tel" />
                <CampoTexto campo="locatario_contato_referencia" label="Contato de referência" />

                <BlocoTitulo>Documentos do locatário</BlocoTitulo>
                <DocumentoIdentificacao
                  campoTipo="locatario_doc_tipo"
                  campoAnexo="locatario_doc_url"
                />
                <LinhaAnexo
                  nome="Comprovante de residência"
                  valor={form.locatario_comp_residencia_url}
                  onChange={(p) => set("locatario_comp_residencia_url", p)}
                />
                <LinhaAnexo
                  nome="Comprovante de renda"
                  valor={form.locatario_comp_renda_url}
                  onChange={(p) => set("locatario_comp_renda_url", p)}
                />
              </>
            ) : (
              <>
                <CampoTexto campo="empresa_nome" label="Empresa" />
                <CampoTexto campo="empresa_cnpj" label="CNPJ" />
                <CampoTexto campo="empresa_insc_estadual" label="Insc. estadual" />
                <CampoTexto campo="empresa_endereco" label="Endereço" />
                <CampoTexto campo="empresa_bairro" label="Bairro" />
                <CampoTexto campo="empresa_cidade" label="Cidade" />
                <CampoTexto campo="empresa_estado" label="Estado" />

                <BlocoTitulo>Documentos da empresa</BlocoTitulo>
                <LinhaAnexo
                  nome="Cartão CNPJ"
                  valor={form.empresa_cartao_cnpj_url}
                  onChange={(p) => set("empresa_cartao_cnpj_url", p)}
                />
                <LinhaAnexo
                  nome="Comprovante de residência"
                  valor={form.empresa_comp_residencia_url}
                  onChange={(p) => set("empresa_comp_residencia_url", p)}
                />
                <LinhaAnexo
                  nome="Outros"
                  valor={form.empresa_outros_doc_url}
                  onChange={(p) => set("empresa_outros_doc_url", p)}
                />

                <BlocoTitulo>Responsável da empresa</BlocoTitulo>
                <CampoTexto campo="resp_nome" label="Nome do responsável" />
                <CampoSelect
                  campo="resp_estado_civil"
                  label="Estado civil"
                  opcoes={ESTADO_CIVIL_OPCOES}
                />
                <CampoTexto campo="resp_profissao" label="Profissão" />
                <CampoTexto campo="resp_rg" label="RG" />
                <CampoTexto campo="resp_orgao_expedidor" label="Órgão expedidor" />
                <CampoTexto campo="resp_cpf" label="CPF" />
                <CampoTexto campo="resp_email" label="E-mail" tipo="email" />
                <CampoTexto campo="resp_celular" label="Celular" modo="tel" />
                <CampoTexto campo="resp_contato_referencia" label="Contato de referência" />

                <BlocoTitulo>Documentos do responsável</BlocoTitulo>
                <DocumentoIdentificacao campoTipo="resp_doc_tipo" campoAnexo="resp_doc_url" />
                <LinhaAnexo
                  nome="Comprovante de residência"
                  valor={form.resp_comp_residencia_url}
                  onChange={(p) => set("resp_comp_residencia_url", p)}
                />
                <LinhaAnexo
                  nome="Comprovante de renda"
                  valor={form.resp_comp_renda_url}
                  onChange={(p) => set("resp_comp_renda_url", p)}
                />
              </>
            )}
          </section>

          {/* DADOS DO IMÓVEL */}
          <section className="bg-muted/40 grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
            <BlocoTitulo>Dados do imóvel</BlocoTitulo>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="loc-endereco">Endereço (rua, quadra/lote)</Label>
              <Input
                id="loc-endereco"
                value={form.endereco}
                onChange={(e) => set("endereco", e.target.value)}
                placeholder="Ex.: Rua 12, Quadra 8, Lote 15"
                required
              />
            </div>
            <CampoSelect
              campo="bairro"
              label="Bairro"
              opcoes={BAIRROS.map((b) => ({ value: b, label: b }))}
            />
            <CampoSelect
              campo="tipo_locacao"
              label="Tipo de residência"
              opcoes={[
                { value: "residencial", label: "Residencial" },
                { value: "comercial", label: "Comercial" },
              ]}
            />
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="loc-descricao">Descrição do imóvel</Label>
              <Textarea
                id="loc-descricao"
                rows={4}
                value={form.descricao_imovel}
                onChange={(e) => set("descricao_imovel", e.target.value)}
              />
            </div>

            <BlocoTitulo>Documentos do imóvel</BlocoTitulo>
            <LinhaAnexo
              nome="Conta de energia"
              valor={form.imovel_conta_energia_url}
              onChange={(p) => set("imovel_conta_energia_url", p)}
            />
            <LinhaAnexo
              nome="Conta de água"
              valor={form.imovel_conta_agua_url}
              onChange={(p) => set("imovel_conta_agua_url", p)}
            />
            <LinhaAnexo
              nome="Outros"
              valor={form.imovel_outros_doc_url}
              onChange={(p) => set("imovel_outros_doc_url", p)}
            />
          </section>

          {/* DADOS DA NEGOCIAÇÃO */}
          <section className="bg-muted/40 grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
            <BlocoTitulo>Dados da negociação</BlocoTitulo>
            <CampoSelect
              campo="administracao"
              label="Com administração"
              opcoes={[
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
              ]}
            />
            <CampoTexto campo="valor_aluguel" label="Valor do aluguel (R$)" modo="decimal" />
            <CampoSelect
              campo="garantia_caucao"
              label="Garantia caução"
              opcoes={[
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
              ]}
            />
            <CampoTexto campo="valor_caucao" label="Valor da caução (R$)" modo="decimal" />
            <CampoTexto campo="prazo" label="Duração" />
            <CampoTexto campo="inicio_contrato" label="Data do início" tipo="date" />
            <CampoTexto campo="data_pagamento" label="Data do pagamento" tipo="date" />
            <CampoSelect
              campo="status_vistoria"
              label="Status da vistoria"
              opcoes={Object.entries(STATUS_VISTORIA_LABEL).map(([value, label]) => ({
                value,
                label,
              }))}
            />
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="loc-obs">Observações</Label>
              <Textarea
                id="loc-obs"
                rows={6}
                value={form.observacoes}
                onChange={(e) => set("observacoes", e.target.value)}
                placeholder="Registre movimentações, pendências e próximos passos."
              />
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
