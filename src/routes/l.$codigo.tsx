import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { jsPDF } from "jspdf";
import { ArrowLeft, Building2, Download, FileDown, Lock } from "lucide-react";
import { toast } from "sonner";
import { Wordmark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { formatarData, formatarDataHora, enderecoCompleto } from "@/lib/protocolos";
import { formatarMoeda, STATUS_VISTORIA_LABEL, type LocacaoPublica } from "@/lib/imoveis";

const SENHA_PDF_LOCACAO = "1298";

async function baixarDocumento(path: string) {
  const { data, error } = await supabase.storage.from("protocolo-docs").createSignedUrl(path, 300);
  if (error || !data) {
    toast.error("Não foi possível abrir o documento");
    return;
  }
  window.open(data.signedUrl, "_blank", "noopener,noreferrer");
}

function valorPdf(valor: string | number | boolean | null | undefined) {
  if (typeof valor === "boolean") return valor ? "Sim" : "Não";
  const texto = String(valor ?? "").trim();
  return texto || "-";
}

function mascararUltimos(valor: string, visiveis = 4) {
  const texto = String(valor ?? "").trim();
  const digitos = texto.replace(/\D/g, "");
  const base = digitos || texto;
  if (!base) return "";
  if (base.length <= visiveis) return base;
  return `${"*".repeat(Math.max(base.length - visiveis, 4))}${base.slice(-visiveis)}`;
}

function SenhaPdfDialog({
  open,
  onOpenChange,
  onConfirmado,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirmado: () => void;
}) {
  const [senha, setSenha] = useState("");

  function confirmar(valor = senha) {
    if (valor.trim() !== SENHA_PDF_LOCACAO) {
      toast.error("Senha incorreta", { description: "Confira os 4 dígitos e tente novamente." });
      setSenha("");
      return;
    }
    onOpenChange(false);
    setSenha("");
    onConfirmado();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setSenha("");
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="items-center text-center">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
            <Lock className="size-5" />
          </span>
          <DialogTitle className="mt-2">Download protegido</DialogTitle>
          <DialogDescription>
            Digite a senha de 4 dígitos para baixar o PDF da locação.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-2">
          <InputOTP
            maxLength={4}
            value={senha}
            autoFocus
            onChange={(v) => {
              setSenha(v);
              if (v.length === 4) confirmar(v);
            }}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={() => confirmar()} disabled={senha.length < 4}>
            <FileDown className="size-4" />
            Baixar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function adicionarSecaoPdf(
  doc: jsPDF,
  titulo: string,
  campos: Array<[string, string | number | boolean | null | undefined]>,
  yInicial: number,
) {
  const margemX = 16;
  const larguraPagina = doc.internal.pageSize.getWidth();
  const alturaPagina = doc.internal.pageSize.getHeight();
  let y = yInicial;

  if (y > alturaPagina - 32) {
    doc.addPage();
    y = 18;
  }

  doc.setFillColor(244, 247, 251);
  doc.roundedRect(margemX, y, larguraPagina - margemX * 2, 10, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(titulo, margemX + 4, y + 6.5);
  y += 16;

  campos.forEach(([label, valor]) => {
    const texto = valorPdf(valor);
    const linhas = doc.splitTextToSize(texto, larguraPagina - margemX * 2 - 42);
    const alturaCampo = Math.max(10, linhas.length * 5 + 5);

    if (y + alturaCampo > alturaPagina - 18) {
      doc.addPage();
      y = 18;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(label.toUpperCase(), margemX, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(linhas, margemX + 42, y);
    y += alturaCampo;
  });

  return y + 4;
}

function baixarPdfLocacao(data: LocacaoPublica) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const larguraPagina = doc.internal.pageSize.getWidth();
  let y = 18;

  doc.setFillColor(31, 58, 169);
  doc.rect(0, 0, larguraPagina, 42, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("Contrato de Locação", 16, 18);
  doc.setFontSize(12);
  doc.text(data.codigo, 16, 28);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    `Status: ${STATUS_VISTORIA_LABEL[data.status_vistoria] ?? data.status_vistoria}`,
    16,
    36,
  );

  y = 54;
  y = adicionarSecaoPdf(
    doc,
    "Locador",
    [
      ["Nome", data.proprietario],
      ["Profissão", data.proprietario_profissao],
      ["Estado civil", data.proprietario_estado_civil],
      ["RG", data.proprietario_rg],
      ["Órgão expedidor", data.proprietario_orgao_expedidor],
      ["CPF", data.proprietario_cpf],
      ["E-mail", data.proprietario_email],
      ["Celular", data.proprietario_celular],
      ["Contato de referência", data.proprietario_contato_referencia],
    ],
    y,
  );

  y = adicionarSecaoPdf(
    doc,
    "Locatário",
    data.locatario_tipo_pessoa === "juridica"
      ? [
          ["Tipo de pessoa", "Jurídica"],
          ["Razão social", data.empresa_nome],
          ["CNPJ", data.empresa_cnpj],
          ["Inscrição estadual", data.empresa_insc_estadual],
          ["Endereço", data.empresa_endereco],
          ["Bairro", data.empresa_bairro],
          ["Cidade", data.empresa_cidade],
          ["Estado", data.empresa_estado],
          ["Responsável legal", data.resp_nome],
          ["Estado civil do responsável", data.resp_estado_civil],
          ["Profissão do responsável", data.resp_profissao],
          ["RG do responsável", data.resp_rg],
          ["Órgão expedidor", data.resp_orgao_expedidor],
          ["CPF do responsável", data.resp_cpf],
          ["E-mail do responsável", data.resp_email],
          ["Celular do responsável", data.resp_celular],
          ["Contato de referência", data.resp_contato_referencia],
        ]
      : [
          ["Tipo de pessoa", "Física"],
          ["Nome", data.locatario],
          ["Profissão", data.locatario_profissao],
          ["Estado civil", data.locatario_estado_civil],
          ["RG", data.locatario_rg],
          ["Órgão expedidor", data.locatario_orgao_expedidor],
          ["CPF", data.locatario_cpf],
          ["E-mail", data.locatario_email],
          ["Celular", data.locatario_celular],
          ["Contato de referência", data.locatario_contato_referencia],
        ],
    y,
  );

  y = adicionarSecaoPdf(
    doc,
    "Dados do imóvel",
    [
      ["Endereço", enderecoCompleto(data)],
      ["Imóvel", data.imovel],
      ["Descrição", data.descricao_imovel],
    ],
    y,
  );

  y = adicionarSecaoPdf(
    doc,
    "Dados da negociação",
    [
      ["Corretor responsável", data.corretor],
      ["Tipo de locação", data.tipo_locacao === "comercial" ? "Comercial" : "Residencial"],
      ["Prazo", data.prazo],
      ["Valor do aluguel", formatarMoeda(Number(data.valor_aluguel))],
      ["Garantia", data.garantia],
      ["Valor do caução", data.garantia_caucao ? formatarMoeda(Number(data.valor_caucao)) : ""],
      ["Início do contrato", data.inicio_contrato ? formatarData(data.inicio_contrato) : ""],
      ["Data de pagamento", data.data_pagamento ? formatarData(data.data_pagamento) : ""],
      ["Dia de vencimento", data.vencimento_dia ? `Dia ${data.vencimento_dia}` : ""],
      ["Administração", data.administracao],
    ],
    y,
  );

  adicionarSecaoPdf(
    doc,
    "Histórico e observações",
    [["Observações", data.observacoes || "Nenhuma observação registrada até o momento."]],
    y,
  );

  doc.save(`${data.codigo || "locacao"}-contrato.pdf`);
}

function textoLocatarioChecklist(data: LocacaoPublica) {
  if (data.locatario_tipo_pessoa === "juridica") {
    return {
      nome: data.empresa_nome || data.resp_nome || data.locatario,
      documento: data.empresa_cnpj || data.resp_cpf || data.locatario_cpf,
    };
  }

  return {
    nome: data.locatario,
    documento: data.locatario_cpf,
  };
}

async function carregarImagemDataUrl(src: string) {
  const response = await fetch(src);
  if (!response.ok) {
    throw new Error("Logo não encontrada");
  }

  const blob = await response.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Não foi possível carregar a logo"));
    reader.readAsDataURL(blob);
  });
}

function adicionarCabecalhoChecklist(doc: jsPDF, logoDataUrl: string) {
  doc.setFillColor(6, 42, 111);
  doc.roundedRect(0, 6, 110, 18, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("TERMO DE VISTORIA", 30, 13.5);
  doc.setFontSize(8);
  doc.text("LOCAÇÃO DE IMÓVEL COM ADMINISTRAÇÃO", 30, 20);

  doc.addImage(logoDataUrl, "PNG", 150, 8, 44, 18);
}

function adicionarRodapeChecklist(doc: jsPDF, pagina: number) {
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.5);
  doc.text("Termo De Vistoria", 105, 283, { align: "center" });
  doc.text("BRIGIDO IMÓVEIS CRECI-PA 1158J", 105, 286, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.text(
    "Rua J2, QD 275, LT 01B, Cidade Jardim - Parauapebas - PA | CEP 68.515-000 - Brasil",
    105,
    289,
    {
      align: "center",
    },
  );
  doc.text(
    "Contatos: 94- 98111-0462 (WhatsApp); 94 98437-8638; e-mail: brigidoimoveis@outlook.com",
    105,
    292,
    {
      align: "center",
    },
  );
  doc.setFont("helvetica", "bold");
  doc.text(`Página ${pagina} de 2`, 176, 286, { align: "center" });
}

function adicionarTituloSecaoChecklist(doc: jsPDF, titulo: string, y: number) {
  doc.setFillColor(210, 208, 208);
  doc.rect(30, y, 160, 5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(titulo, 31, y + 3.8);
  return y + 8;
}

function adicionarTextoChecklist(doc: jsPDF, texto: string, y: number, bold = false) {
  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(texto, 31, y);
  return y + 4.8;
}

function adicionarObsChecklist(doc: jsPDF, y: number, linhas = 1) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Obs:", 31, y);
  doc.line(38, y + 0.7, 190, y + 0.7);
  y += 5.5;
  for (let i = 1; i < linhas; i += 1) {
    doc.line(31, y + 0.7, 190, y + 0.7);
    y += 5.5;
  }
  return y + 2;
}

function adicionarLinhaChecklist(doc: jsPDF, y: number) {
  doc.line(31, y, 190, y);
  return y + 6;
}

async function baixarChecklistLocacao(data: LocacaoPublica) {
  let logoDataUrl = "";
  try {
    logoDataUrl = await carregarImagemDataUrl("/brigido-logo.png");
  } catch {
    toast.error("Logo não encontrada", {
      description: "Adicione o PNG original em public/brigido-logo.png.",
    });
    return;
  }

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const locatario = textoLocatarioChecklist(data);
  const endereco = enderecoCompleto(data);
  const tipoImovel = data.tipo_locacao === "comercial" ? "Comercial" : "Residencial";

  adicionarCabecalhoChecklist(doc, logoDataUrl);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text("LAUDO DE VISTORIA DE IMÓVEL – LOCAÇÃO (VISTORIA INICIAL)", 105, 38, {
    align: "center",
  });

  let y = 48;
  y = adicionarTituloSecaoChecklist(doc, "1. IDENTIFICAÇÃO DO LAUDO", y);
  y = adicionarTextoChecklist(
    doc,
    `Data da vistoria: ${formatarData(new Date().toISOString())}`,
    y,
  );
  y = adicionarTextoChecklist(doc, `Tipo de imóvel: ${tipoImovel}`, y);
  y = adicionarTextoChecklist(doc, `Endereço completo: ${valorPdf(endereco)}`, y);
  y = adicionarTextoChecklist(doc, "Finalidade: vistoria inicial para locação", y);

  y += 3;
  y = adicionarTituloSecaoChecklist(doc, "2. IDENTIFICAÇÃO DAS PARTES", y);
  y = adicionarTextoChecklist(doc, "LOCADOR:", y);
  y = adicionarTextoChecklist(doc, "Nome: BRIGIDO IMÓVEIS", y);
  y = adicionarTextoChecklist(doc, "CPF/CNPJ: 47.263.424/0001-02", y);
  y = adicionarTextoChecklist(doc, "LOCATÁRIO:", y);
  y = adicionarTextoChecklist(doc, `Nome/Razão Social: ${valorPdf(locatario.nome)}`, y);
  y = adicionarTextoChecklist(doc, `CPF/CNPJ: ${valorPdf(locatario.documento)}`, y);
  y = adicionarTextoChecklist(doc, `Corretor Responsável: ${valorPdf(data.corretor)}`, y);

  y += 3;
  y = adicionarTituloSecaoChecklist(doc, "3. METODOLOGIA DA VISTORIA", y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    doc.splitTextToSize(
      "Vistoria visual, técnica e descritiva, limitada ao estado aparente do imóvel, com registro fotográfico integrante do laudo.",
      160,
    ),
    31,
    y,
  );
  y += 11;

  y = adicionarTituloSecaoChecklist(doc, "4. ESTADO GERAL DO IMÓVEL", y);
  y = adicionarTextoChecklist(doc, "4.1 PINTURA", y, true);
  y = adicionarTextoChecklist(
    doc,
    "( ) Nova    ( ) Usada em bom estado    ( ) Necessita reparos",
    y,
  );
  y = adicionarObsChecklist(doc, y, 2);
  y = adicionarTextoChecklist(doc, "4.2 PARTE ELÉTRICA", y, true);
  y = adicionarTextoChecklist(doc, "( ) Tomadas e interruptores funcionando", y);
  y = adicionarTextoChecklist(doc, "( ) Quadro de energia testado e sem falhas", y);
  y = adicionarTextoChecklist(doc, "( ) Lâmpadas e bocais em ordem", y);
  y = adicionarObsChecklist(doc, y, 2);
  y = adicionarTextoChecklist(doc, "4.3 PARTE HIDRÁULICA", y, true);
  y = adicionarTextoChecklist(doc, "( ) Torneiras e registros sem vazamentos", y);
  y = adicionarTextoChecklist(doc, "( ) Vasos sanitários e descargas funcionando", y);
  y = adicionarTextoChecklist(doc, "( ) Escoamento de pias e ralos livre", y);
  y = adicionarObsChecklist(doc, y, 2);
  y = adicionarTextoChecklist(doc, "4.4 PORTÃO ELETRÔNICO E CERCA ELÉTRICA", y, true);
  y = adicionarTextoChecklist(doc, "( ) Portão funcionando (Qtd. controles: ___)", y);
  y += 4;
  y = adicionarTextoChecklist(doc, "( ) Cerca elétrica ativada e com hastes íntegras", y);
  adicionarObsChecklist(doc, y, 2);
  adicionarRodapeChecklist(doc, 1);

  doc.addPage();
  adicionarCabecalhoChecklist(doc, logoDataUrl);
  y = 45;
  y = adicionarTextoChecklist(doc, "4.5 PORTAS E JANELAS", y, true);
  y = adicionarTextoChecklist(doc, "( ) Vidros íntegros, sem trincas", y);
  y = adicionarTextoChecklist(doc, "( ) Fechaduras e trincos funcionando (Qtd. chaves: ___)", y);
  y = adicionarObsChecklist(doc, y, 2);
  y = adicionarTextoChecklist(doc, "4.6 TELHADO", y, true);
  y = adicionarTextoChecklist(doc, "( ) Sem telhas quebradas ou infiltrações visíveis", y);
  y = adicionarTextoChecklist(doc, "( ) Calhas limpas", y);
  y = adicionarObsChecklist(doc, y, 2);
  y = adicionarTextoChecklist(doc, "4.7 AR CONDICIONADO", y, true);
  y = adicionarTextoChecklist(
    doc,
    "( ) Aparelho higienizado e funcionando (Qtd. controles: ___)",
    y,
  );
  y = adicionarTextoChecklist(doc, "( ) Dreno sem vazamentos para o interior", y);
  y = adicionarObsChecklist(doc, y, 2);
  y = adicionarTextoChecklist(doc, "4.8 LIMPEZA", y, true);
  y = adicionarTextoChecklist(doc, "( ) Realizada limpeza completa    ( ) Faltou limpar", y);
  y = adicionarObsChecklist(doc, y, 2);
  y = adicionarTextoChecklist(doc, "4.9 CHAVES, CONTROLES E SENHAS", y, true);
  y = adicionarTextoChecklist(doc, "( ) Entregue    ( ) Falta entregar", y);
  y = adicionarObsChecklist(doc, y, 2);

  y += 4;
  y = adicionarTituloSecaoChecklist(doc, "5. OBSERVAÇÕES FINAIS", y);
  y = adicionarLinhaChecklist(doc, y);
  y = adicionarLinhaChecklist(doc, y);

  y += 12;
  y = adicionarTituloSecaoChecklist(doc, "6. DECLARAÇÃO DO LOCATÁRIO", y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    doc.splitTextToSize(
      "Declaro que vistorei o imóvel e concordo com as condições descritas neste laudo, que servirá como base para a vistoria de devolução.",
      160,
    ),
    31,
    y,
  );

  y += 18;
  y = adicionarTituloSecaoChecklist(doc, "7. ASSINATURAS", y);
  y += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.line(38, y, 92, y);
  doc.text("Locatário(a)", 65, y + 5, { align: "center" });
  doc.line(114, y, 168, y);
  doc.text("Corretor(a) Responsável:", 141, y + 5, { align: "center" });
  adicionarRodapeChecklist(doc, 2);

  doc.save(`${data.codigo || "locacao"}-checklist.pdf`);
}

export const Route = createFileRoute("/l/$codigo")({
  head: ({ params }) => ({
    meta: [
      { title: `Locação ${params.codigo} — ImobFácil` },
      {
        name: "description",
        content: `Consulta pública da locação ${params.codigo}.`,
      },
      { property: "og:title", content: `Locação ${params.codigo} — ImobFácil` },
      {
        property: "og:description",
        content: "Consulta pública do cadastro de locação imobiliária.",
      },
    ],
  }),
  component: ConsultaLocacao,
});

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-eyebrow text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium break-words">{valor || "—"}</dd>
    </div>
  );
}

function ConsultaLocacao() {
  const { codigo } = Route.useParams();
  const [senhaAberta, setSenhaAberta] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["locacao-publica", codigo],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("consultar_locacao", { p_codigo: codigo });
      if (error) throw error;
      return ((data as unknown as LocacaoPublica[] | null) ?? [])[0] ?? null;
    },
  });

  return (
    <div className="min-h-screen">
      <header className="mx-auto grid max-w-4xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 sm:px-6 sm:py-5">
        <Wordmark subtitle="Consulta pública" />
        <Button asChild variant="ghost" size="sm" className="shrink-0">
          <Link to="/">
            <ArrowLeft className="size-4" />
            Nova consulta
          </Link>
        </Button>
      </header>

      <main className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 sm:pb-20">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-28 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
          </div>
        ) : !data || isError ? (
          <div className="shadow-soft rounded-3xl border bg-card px-6 py-14 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
              <Building2 className="size-6" />
            </span>
            <h1 className="mt-5 text-xl font-semibold">Locação não encontrada</h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Não localizamos nenhum cadastro para <span className="font-medium">{codigo}</span>.
              Confira o código informado e tente novamente.
            </p>
            <Button asChild className="mt-6">
              <Link to="/">Tentar outro código</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <section className="bg-brand-gradient shadow-panel rounded-3xl px-5 py-6 text-primary-foreground sm:px-10 sm:py-8">
              <p className="text-eyebrow text-primary-foreground/70">Locação</p>
              <div className="mt-2 flex flex-col items-start gap-3 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-4">
                <h1 className="font-display text-2xl font-bold break-all sm:truncate sm:break-normal sm:text-3xl lg:text-4xl">
                  {data.codigo}
                </h1>
                <div className="flex w-full max-w-[180px] flex-col items-stretch gap-2 sm:w-[176px]">
                  <span className="inline-flex h-9 items-center justify-center rounded-full bg-card px-4 text-center text-sm font-semibold whitespace-nowrap text-foreground shadow-sm">
                    {STATUS_VISTORIA_LABEL[data.status_vistoria] ?? data.status_vistoria}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-9 w-full justify-center rounded-full border border-white/15 bg-white/14 px-4 text-xs font-semibold whitespace-nowrap text-primary-foreground shadow-sm backdrop-blur-sm hover:bg-white/24"
                    onClick={() => setSenhaAberta(true)}
                  >
                    <FileDown className="size-4 shrink-0" />
                    Baixar PDF
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-9 w-full justify-center rounded-full border border-white/15 bg-white/14 px-4 text-xs font-semibold whitespace-nowrap text-primary-foreground shadow-sm backdrop-blur-sm hover:bg-white/24"
                    onClick={() => void baixarChecklistLocacao(data)}
                  >
                    <FileDown className="size-4 shrink-0" />
                    Baixar Checklist
                  </Button>
                </div>
              </div>
              <p className="mt-3 text-sm text-primary-foreground/75">
                Aberta em {formatarDataHora(data.created_at)} • atualizada em{" "}
                {formatarDataHora(data.updated_at)}
              </p>
            </section>

            <SenhaPdfDialog
              open={senhaAberta}
              onOpenChange={setSenhaAberta}
              onConfirmado={() => baixarPdfLocacao(data)}
            />

            <section className="shadow-soft rounded-3xl border bg-card p-5 sm:p-8">
              <h2 className="text-center text-sm font-bold tracking-wide uppercase">Locador</h2>
              <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Campo label="Nome" valor={data.proprietario} />
                <Campo label="Profissão" valor={data.proprietario_profissao} />
                <Campo label="Estado civil" valor={data.proprietario_estado_civil} />
                <Campo label="RG" valor={data.proprietario_rg} />
                <Campo label="Órgão expedidor" valor={data.proprietario_orgao_expedidor} />
                <Campo label="CPF" valor={mascararUltimos(data.proprietario_cpf)} />
                <Campo label="E-mail" valor={data.proprietario_email} />
                <Campo label="Celular" valor={mascararUltimos(data.proprietario_celular)} />
                <Campo
                  label="Contato de referência"
                  valor={mascararUltimos(data.proprietario_contato_referencia)}
                />
              </dl>
            </section>

            <section className="shadow-soft rounded-3xl border bg-card p-5 sm:p-8">
              <h2 className="text-center text-sm font-bold tracking-wide uppercase">Locatário</h2>
              {data.locatario_tipo_pessoa === "juridica" ? (
                <div className="mt-5 space-y-6">
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Campo label="Razão social" valor={data.empresa_nome} />
                    <Campo label="CNPJ" valor={data.empresa_cnpj} />
                    <Campo label="Inscrição estadual" valor={data.empresa_insc_estadual} />
                    <Campo label="Endereço" valor={data.empresa_endereco} />
                    <Campo label="Bairro" valor={data.empresa_bairro} />
                    <Campo label="Cidade" valor={data.empresa_cidade} />
                    <Campo label="Estado" valor={data.empresa_estado} />
                  </dl>
                  <div className="border-t pt-5">
                    <h3 className="text-eyebrow text-muted-foreground">Responsável legal</h3>
                    <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <Campo label="Nome" valor={data.resp_nome} />
                      <Campo label="Estado civil" valor={data.resp_estado_civil} />
                      <Campo label="Profissão" valor={data.resp_profissao} />
                      <Campo label="RG" valor={data.resp_rg} />
                      <Campo label="Órgão expedidor" valor={data.resp_orgao_expedidor} />
                      <Campo label="CPF" valor={mascararUltimos(data.resp_cpf)} />
                      <Campo label="E-mail" valor={data.resp_email} />
                      <Campo label="Celular" valor={mascararUltimos(data.resp_celular)} />
                      <Campo
                        label="Contato de referência"
                        valor={mascararUltimos(data.resp_contato_referencia)}
                      />
                    </dl>
                  </div>
                </div>
              ) : (
                <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Campo label="Nome" valor={data.locatario} />
                  <Campo label="Profissão" valor={data.locatario_profissao} />
                  <Campo label="Estado civil" valor={data.locatario_estado_civil} />
                  <Campo label="RG" valor={data.locatario_rg} />
                  <Campo label="Órgão expedidor" valor={data.locatario_orgao_expedidor} />
                  <Campo label="CPF" valor={mascararUltimos(data.locatario_cpf)} />
                  <Campo label="E-mail" valor={data.locatario_email} />
                  <Campo label="Celular" valor={mascararUltimos(data.locatario_celular)} />
                  <Campo
                    label="Contato de referência"
                    valor={mascararUltimos(data.locatario_contato_referencia)}
                  />
                </dl>
              )}
            </section>

            <section className="shadow-soft rounded-3xl border bg-card p-5 sm:p-8">
              <h2 className="text-base font-semibold">Dados do imóvel</h2>
              <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Campo label="Endereço" valor={enderecoCompleto(data)} />
                <Campo label="Imóvel" valor={data.imovel} />
                <Campo label="Descrição" valor={data.descricao_imovel} />
              </dl>
            </section>

            <section className="shadow-soft rounded-3xl border bg-card p-5 sm:p-8">
              <h2 className="text-base font-semibold">Dados da negociação</h2>
              <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Campo label="Corretor responsável" valor={data.corretor} />
                <Campo
                  label="Tipo de locação"
                  valor={data.tipo_locacao === "comercial" ? "Comercial" : "Residencial"}
                />
                <Campo label="Prazo" valor={data.prazo} />
                <Campo label="Valor do aluguel" valor={formatarMoeda(Number(data.valor_aluguel))} />
                <Campo label="Garantia" valor={data.garantia} />
                {data.garantia_caucao && (
                  <Campo label="Valor do caução" valor={formatarMoeda(Number(data.valor_caucao))} />
                )}
                <Campo
                  label="Início do contrato"
                  valor={data.inicio_contrato ? formatarData(data.inicio_contrato) : ""}
                />
                <Campo
                  label="Data de pagamento"
                  valor={data.data_pagamento ? formatarData(data.data_pagamento) : ""}
                />
                <Campo label="Dia de vencimento" valor={`Dia ${data.vencimento_dia}`} />
                <Campo label="Administração" valor={data.administracao ? "Sim" : "Não"} />
              </dl>
            </section>

            {(data.doc_negociacao_nome || data.doc_negociacao_url) && (
              <section className="shadow-soft rounded-3xl border bg-card p-5 sm:p-8">
                <h2 className="text-base font-semibold">Documento da negociação</h2>
                <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-medium">{data.doc_negociacao_nome || "Documento"}</p>
                  {data.doc_negociacao_url ? (
                    <Button size="sm" onClick={() => void baixarDocumento(data.doc_negociacao_url)}>
                      <Download className="size-4" />
                      Baixar documento
                    </Button>
                  ) : null}
                </div>
              </section>
            )}

            <section className="shadow-soft rounded-3xl border bg-card p-5 sm:p-8">
              <h2 className="text-base font-semibold">Histórico e observações</h2>
              <p className="mt-3 text-sm whitespace-pre-line text-muted-foreground">
                {data.observacoes || "Nenhuma observação registrada até o momento."}
              </p>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
