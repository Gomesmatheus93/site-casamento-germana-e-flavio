import type { Metadata } from "next";
import Link from "next/link";
import RsvpForm from "@/components/RsvpForm";
import { WEDDING } from "@/lib/wedding-config";

export const metadata: Metadata = {
  title: "Confirmar presença | Germana & Flávio",
  description: `Confirme sua presença no casamento de Germana & Flávio — ${WEDDING.dataFormatada}, às ${WEDDING.horario}, em Mossoró - RN.`,
};

export default function ConfirmarPresencaPage() {
  return (
    <section className="bg-[var(--color-surface)] px-5 py-20 sm:py-24">
      <div className="mx-auto max-w-xl">
        <header className="text-center">
          <p className="eyebrow">Com carinho</p>
          <h1 className="mt-4 font-serif-display text-4xl italic text-[var(--foreground)] sm:text-5xl">
            Confirme sua presença
          </h1>
          <p className="mt-4 text-sm tracking-[0.14em] text-[var(--color-muted)] uppercase">
            {WEDDING.dataFormatada} · às {WEDDING.horario}
          </p>
          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-[var(--foreground)]/70">
            Para prepararmos tudo com muito cuidado, pedimos que confirme se poderá
            celebrar esse dia conosco. Sua resposta nos ajuda muito!
          </p>
        </header>

        <div className="mt-12">
          <RsvpForm />
        </div>

        <p className="mx-auto mt-12 max-w-md text-center text-sm leading-relaxed text-[var(--foreground)]/70">
          Sua presença é o nosso maior presente. Se ainda assim desejar nos
          presentear, preparamos uma{" "}
          <Link href="/#presentes" className="text-[var(--color-primary)] underline underline-offset-4">
            lista com muito carinho
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
