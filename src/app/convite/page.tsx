import type { Metadata } from "next";
import Link from "next/link";
import InviteOpening from "@/components/InviteOpening";
import { WEDDING } from "@/lib/wedding-config";

export const metadata: Metadata = {
  title: "Convite | Germana & Flávio",
  description:
    "Convite de casamento de Germana & Flávio — 01 de novembro de 2026, às 16h, na Igreja Sagrado Coração de Jesus, Mossoró - RN.",
};

export default function ConvitePage() {
  return (
    <div>
      <InviteOpening />

      <section className="border-t border-[var(--color-border)] px-5 py-24 text-center">
        <p className="eyebrow">Com muito amor</p>
        <h2 className="mt-4 font-serif-display text-3xl italic text-[var(--foreground)]">
          Esperamos por você
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-[var(--foreground)]/70">
          {WEDDING.dataFormatada}, às {WEDDING.horario}, na {WEDDING.cerimonia.nome}, em
          Mossoró - RN. Sua presença é o que vai tornar esse dia inesquecível.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/#presentes" className="btn-solid">
            Lista de presentes
          </Link>
          <Link href="/#local" className="btn-outline">
            Local & logística
          </Link>
        </div>
      </section>
    </div>
  );
}
