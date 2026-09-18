import { BedDouble, ExternalLink, MapPin, UtensilsCrossed } from "lucide-react";
import { HOTEIS, RESTAURANTES, type Hotel, type Restaurante } from "@/lib/wedding-config";

function HotelCard({ hotel }: { hotel: Hotel }) {
  return (
    <div className="flex flex-col gap-3 border border-[var(--color-border)] bg-[var(--color-card)] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_-18px_rgba(34,42,31,0.35)]">
      <span className="w-fit rounded-full bg-[var(--color-gold)]/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--color-gold-dark)]">
        {hotel.categoria}
      </span>
      <h4 className="font-serif-display text-xl text-[var(--foreground)]">{hotel.nome}</h4>
      <p className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
        <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
        {hotel.distanciaCentro}
      </p>
      <p className="text-sm leading-relaxed text-[var(--foreground)]/80">{hotel.destaque}</p>
      <a
        href={hotel.bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="tracked-link mt-1 flex w-fit items-center gap-1.5 !text-[var(--color-gold-dark)]"
      >
        Ver preço atual
        <ExternalLink className="h-3 w-3" strokeWidth={2} />
      </a>
    </div>
  );
}

function RestauranteCard({ r }: { r: Restaurante }) {
  return (
    <div className="flex flex-col gap-3 border border-[var(--color-border)] bg-[var(--color-card)] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_-18px_rgba(34,42,31,0.35)]">
      <span className="w-fit rounded-full bg-[var(--color-wine)]/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--color-wine)]">
        {r.tipo}
      </span>
      <h4 className="font-serif-display text-xl text-[var(--foreground)]">{r.nome}</h4>
      <p className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
        <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
        {r.local}
      </p>
      <p className="text-sm leading-relaxed text-[var(--foreground)]/80">{r.destaque}</p>
    </div>
  );
}

export default function HospedagemSection() {
  return (
    <section id="hospedagem" className="px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <header className="text-center">
          <p className="eyebrow">Para quem vem de fora</p>
          <h2 className="mt-4 font-serif-display text-5xl italic text-[var(--foreground)]">
            Hospedagem &amp; Gastronomia
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-[var(--foreground)]/70">
            Selecionamos algumas opções de hotéis e restaurantes em Mossoró - RN para
            ajudar os convidados que virão de outras cidades a se organizar. Recomendamos
            reservar com antecedência, pois a cidade recebe eventos o ano todo.
          </p>
        </header>

        <div className="mt-20">
          <div className="flex items-center justify-center gap-2.5">
            <BedDouble className="h-5 w-5 text-[var(--color-gold-dark)]" strokeWidth={1.5} />
            <h3 className="font-serif-display text-2xl italic text-[var(--color-wine)]">
              Hotéis sugeridos
            </h3>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {HOTEIS.map((hotel: Hotel) => (
              <HotelCard key={hotel.nome} hotel={hotel} />
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-[var(--color-muted)]">
            O botão &ldquo;Ver preço atual&rdquo; leva direto ao Booking.com com as datas do
            casamento preenchidas, para você sempre ver disponibilidade e valores
            atualizados.
          </p>
        </div>

        <div className="mt-24">
          <div className="flex items-center justify-center gap-2.5">
            <UtensilsCrossed className="h-5 w-5 text-[var(--color-wine)]" strokeWidth={1.5} />
            <h3 className="font-serif-display text-2xl italic text-[var(--color-wine)]">
              Restaurantes recomendados
            </h3>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {RESTAURANTES.map((r: Restaurante) => (
              <RestauranteCard key={r.nome} r={r} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
