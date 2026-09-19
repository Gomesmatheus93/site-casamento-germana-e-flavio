import Image from "next/image";
import { Info } from "lucide-react";

export default function PadrinhosSection() {
  return (
    <section id="padrinhos" className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <header className="text-center">
          <p className="eyebrow">Para os padrinhos e madrinhas</p>
          <h2 className="mt-4 font-serif-display text-5xl italic text-[var(--foreground)]">
            Orientações para o traje
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-[var(--foreground)]/70">
            Queridos padrinhos, é uma alegria ter vocês ao nosso lado em um dia tão
            importante para nós. Para que tudo esteja em harmonia, deixamos aqui algumas
            orientações sobre o traje.
          </p>
        </header>

        <div className="mt-16 grid gap-10 lg:grid-cols-2">
          <div className="flex flex-col overflow-hidden border border-[var(--color-border)] bg-white">
            <div className="relative h-72 w-full sm:h-96">
              <Image
                src="/padrinhos/madrinhas.jpg"
                alt="Madrinhas em vestido longo na cor Marsala"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-8">
              <p className="eyebrow">Madrinhas</p>
              <h3 className="font-serif-display text-2xl text-[var(--foreground)]">
                Vestido longo Marsala
              </h3>
              <p className="text-sm leading-relaxed text-[var(--foreground)]/80">
                O modelo fica livre para que cada uma escolha aquele que melhor
                represente seu estilo.
              </p>
              <div className="mt-2 flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-8 w-8 shrink-0 rounded-full border border-[var(--color-border)]"
                  style={{ backgroundColor: "#6d1f2e" }}
                />
                <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                  Marsala — cor de referência
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col overflow-hidden border border-[var(--color-border)] bg-white">
            <div className="grid grid-cols-3 gap-0.5">
              <div className="relative col-span-2 h-72 sm:h-96">
                <Image
                  src="/padrinhos/padrinhos-grupo.jpg"
                  alt="Padrinhos em terno cinza, camisa branca e gravata"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-72 sm:h-96">
                <Image
                  src="/padrinhos/padrinhos-detalhe.jpg"
                  alt="Detalhe do terno cinza com gravata"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-3 p-8">
              <p className="eyebrow">Padrinhos</p>
              <h3 className="font-serif-display text-2xl text-[var(--foreground)]">
                Terno cinza + gravata prata
              </h3>
              <p className="text-sm leading-relaxed text-[var(--foreground)]/80">
                Terno cinza, camisa branca e gravata prata (disponibilizada pelos
                noivos).
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 flex max-w-3xl items-start gap-3 border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 p-6 text-left">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-gold-dark)]" strokeWidth={1.5} />
          <p className="text-sm leading-relaxed text-[var(--foreground)]/80">
            <strong className="font-medium text-[var(--foreground)]">Importante:</strong>{" "}
            As cores e combinações de trajes escolhidas são exclusivas dos padrinhos.
            Pedimos, por gentileza, que os demais convidados evitem o uso do Marsala
            pelas mulheres e da combinação cinza + gravata prata pelos homens.
          </p>
        </div>
      </div>
    </section>
  );
}
