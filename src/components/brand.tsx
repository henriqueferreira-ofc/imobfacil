import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { STATUS_LABEL } from "@/lib/protocolos";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/icon-512.png";

export function Logo({ className }: { className?: string }) {
  const [hasImageError, setHasImageError] = useState(false);

  return (
    <span
      className={cn(
        "shadow-soft flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-card sm:size-14",
        className,
      )}
    >
      {hasImageError ? (
        <span className="font-display text-sm font-bold text-brand-deep sm:text-base">
          Imob<span className="text-brand-bright">F</span>
        </span>
      ) : (
        <img
          src={LOGO_SRC}
          alt="ImobFácil"
          className="h-full w-full object-cover"
          loading="eager"
          onError={() => setHasImageError(true)}
        />
      )}
    </span>
  );
}

export function Wordmark({ subtitle }: { subtitle?: string }) {
  return (
    <Link to="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
      <Logo />
      <span className="min-w-0">
        <span className="block truncate font-display text-base leading-none font-bold sm:text-lg">
          Imob<span className="text-brand-bright">Fácil</span>
        </span>
        <span className="block truncate text-[10px] tracking-wide text-muted-foreground sm:text-[11px]">
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
