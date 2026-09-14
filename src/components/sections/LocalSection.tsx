import type { ReactNode } from "react";
import { Bus, Car, MapPin, PartyPopper, Plane } from "lucide-react";
import { WEDDING, LOGISTICA } from "@/lib/wedding-config";

function comoChegarIcon(texto: string) {
  const t = texto.toLowerCase();
  if (t.includes("avião")) return Plane;
  if (t.includes("ônibus")) return Bus;
  return Car;
}

type Venue = {
  titulo: string;
  nome: string;
  endereco: string;
  mapsQuery: string;
  detalhe: ReactNode;
  icon: typeof MapPin;
};

function VenueBlock({ venue }: { venue: Venue }) {
  const mapsEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    venue.mapsQuery
  )}&output=embed`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    venue.mapsQuery
  )}`;
  const Icon = venue.icon;

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="flex flex-col justify-center gap-4 border border-[var(--color-border)] bg-[var(--color-card)] p-8 lg:col-span-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-secondary)]/12 text-[var(--color-secondary)]">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </span>
        <p className="eyebrow">{venue.titulo}</p>
        <h3 className="-mt-2 font-serif-display text-2xl text-[var(--foreground)]">
          {venue.nome}
        </h3>
        <p className="text-sm text-[var(--color-muted)]">{venue.endereco}</p>
        <p className="text-sm text-[var(--foreground)]/80">{venue.detalhe}</p>
        <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="btn-outline mt-2 w-fit">
          Abrir no Google Maps
        </a>
      </div>

      <div className="overflow-hidden border border-[var(--color-border)] lg:col-span-3">
        <iframe
          title={`Mapa - ${venue.nome}`}
          src={mapsEmbedSrc}
          className="h-[320px] w-full border-0 grayscale-[15%] sm:h-full sm:min-h-[380px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}

export default function LocalSection() {
  const venues: Venue[] = [
    {
      titulo: "Cerimônia",
      nome: WEDDING.cerimonia.nome,
      endereco: WEDDING.cerimonia.endereco,
      mapsQuery: WEDDING.cerimonia.mapsQuery,
      detalhe: (
        <>
          <strong>{WEDDING.dataFormatada}</strong>, às <strong>{WEDDING.horario}</strong>.
        </>
      ),
      icon: MapPin,
    },
    {
      titulo: "Festa",
      nome: WEDDING.recepcao.nome,
      endereco: WEDDING.recepcao.endereco,
      mapsQuery: WEDDING.recepcao.mapsQuery,
      detalhe: "Recepção e festa logo após a cerimônia.",
      icon: PartyPopper,
    },
  ];

  return (
    <section id="local" className="border-t border-[var(--color-border)] px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <header className="text-center">
          <p className="eyebrow">Onde tudo vai acontecer</p>
          <h2 className="mt-4 font-serif-display text-5xl italic text-[var(--foreground)]">
            Local &amp; Logística
          </h2>
        </header>

        <div className="mt-16 flex flex-col gap-10">
          {venues.map((venue) => (
            <VenueBlock key={venue.nome} venue={venue} />
          ))}
        </div>

        <div className="mt-24 border-t border-[var(--color-border)] pt-16">
          <p className="eyebrow text-center">Chegando a Mossoró</p>
          <h3 className="mt-4 text-center font-serif-display text-3xl italic text-[var(--foreground)]">
            Distâncias e acessos
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-[var(--foreground)]/70">
            {LOGISTICA.resumo}
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {LOGISTICA.distancias.map((d) => (
              <div
                key={d.cidade}
                className="flex flex-col gap-3 border border-[var(--color-border)] bg-[var(--color-card)] p-7"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-secondary)]/12 text-[var(--color-secondary)]">
                  <Plane className="h-4 w-4" strokeWidth={1.5} />
                </span>
                <h4 className="font-serif-display text-xl text-[var(--foreground)]">
                  {d.cidade}
                </h4>
                <p className="font-serif-display text-lg text-[var(--foreground)]">
                  {d.distanciaEstrada}
                  <span className="ml-2 text-sm font-sans text-[var(--color-muted)]">
                    · {d.tempoCarro}
                  </span>
                </p>
                <p className="text-sm text-[var(--color-muted)]">{d.obs}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/5 p-7 sm:flex-row sm:items-center">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <Plane className="h-4 w-4" strokeWidth={1.5} />
            </span>
            <div>
              <h4 className="font-serif-display text-lg text-[var(--foreground)]">
                {LOGISTICA.aeroportoLocal.nome}
              </h4>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {LOGISTICA.aeroportoLocal.obs}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-24 border-t border-[var(--color-border)] pt-16">
          <p className="eyebrow text-center">Como chegar</p>
          <div className="mx-auto mt-10 grid max-w-3xl gap-4">
            {LOGISTICA.comoChegar.map((item, idx) => {
              const Icon = comoChegarIcon(item);
              return (
                <div
                  key={idx}
                  className="flex items-center gap-4 border border-[var(--color-border)] bg-[var(--color-card)] px-6 py-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary)]/12 text-[var(--color-secondary)]">
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                  <span className="text-sm leading-relaxed text-[var(--foreground)]/80">
                    {item}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
