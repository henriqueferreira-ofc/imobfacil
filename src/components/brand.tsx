import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/imobfacil-logo.png.asset.json";
import { STATUS_LABEL } from "@/lib/protocolos";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <img
      src={logoAsset.url}
      alt="ImobFácil"
      className={cn("h-10 w-10 rounded-xl object-cover shadow-soft", className)}
      loading="eager"
    />
  );
}

export function Wordmark({ subtitle }: { subtitle?: string }) {
  return (
    <Link to="/" className="flex min-w-0 items-center gap-3">
      <Logo />
      <span className="min-w-0">
        <span className="block truncate font-display text-lg leading-none font-bold">
          Imob<span className="text-brand-bright">Fácil</span>
        </span>
        <span className="block truncate text-[11px] tracking-wide text-muted-foreground">
          {subtitle ?? "Cadastre • Gerencie • Venda"}
        </span>
      </span>
    </Link>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "concluido"
      ? "bg-success/12 text-success"
      : status === "cancelado"
        ? "bg-destructive/12 text-destructive"
        : status === "em_analise"
          ? "bg-warning/18 text-warning-foreground"
          : "bg-brand-bright/12 text-brand-bright";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        tone,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
