import Link from "next/link";
import { WEDDING } from "@/lib/wedding-config";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)]">
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
        <p className="mt-8 text-[11px] tracking-[0.1em] text-[var(--color-muted)]/70">
          <Link href="/admin/login" className="hover:text-[var(--color-primary)]">
            Acesso administrativo
          </Link>
        </p>
      </div>
    </footer>
  );
}
