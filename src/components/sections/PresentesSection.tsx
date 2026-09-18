import GiftList from "@/components/gifts/GiftList";
import type { Gift } from "@/types/gift";

export default function PresentesSection({ gifts }: { gifts: Gift[] }) {
  return (
    <section id="presentes" className="border-t border-[var(--color-border)] px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <header className="mb-16 text-center">
          <p className="eyebrow"></p>
          <h2 className="mt-4 font-serif-display text-5xl italic text-[var(--foreground)]">
            Lista de Presentes
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-[var(--foreground)]/70">
            Sua presença já é o maior presente. Mas, se desejar nos ajudar a começar essa
            nova fase, preparamos esta lista com carinho. Você pode presentear via Pix,
            cartão de crédito/débito ou pelo link de uma loja parceira.
          </p>
        </header>

        <GiftList initialGifts={gifts} />
      </div>
    </section>
  );
}
