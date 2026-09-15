import Link from "next/link";
import { Lock } from "lucide-react";
import { WEDDING } from "@/lib/wedding-config";

export default function Footer() {
  return (
    <footer className="relative mt-auto border-t border-[var(--color-border)]">
      <div className="mx-auto max-w-6xl px-5 py-14 text-center">
        <p className="font-serif-display text-2xl italic text-[var(--foreground)]">
          {WEDDING.noivos.ela} &amp; {WEDDING.noivos.ele}
        </p>
        <p className="eyebrow mt-4">
          {WEDDING.dataFormatada} · {WEDDING.horario}
        </p>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          {WEDDING.cerimonia.nome}, Mossoró · RN
        </p>
      </div>
      <Link
        href="/admin/login"
        aria-label="Acesso administrativo"
        title="Acesso administrativo"
        className="absolute bottom-4 right-5 text-[var(--color-muted)]/50 transition-colors hover:text-[var(--color-primary)] sm:right-8"
      >
        <Lock className="h-4 w-4" />
      </Link>
    </footer>
  );
}
