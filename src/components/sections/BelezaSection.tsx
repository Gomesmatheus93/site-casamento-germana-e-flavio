import Image from "next/image";
import { ExternalLink, MapPin } from "lucide-react";
import { SALOES, type Salao } from "@/lib/wedding-config";

function SalaoBlock({ salao }: { salao: Salao }) {
  const mapsEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    salao.mapsQuery
  )}&output=embed`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    salao.mapsQuery
  )}`;

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="flex flex-col justify-center gap-4 border border-[var(--color-border)] bg-white p-8 lg:col-span-2">
        <Image
          src="/vanessa-marinho-logo.png"
          alt={salao.nome}
          width={886}
          height={242}
          className="-ml-1 h-12 w-auto object-contain object-left"
        />
        <p className="eyebrow">Salão de beleza</p>
        <h3 className="-mt-2 font-serif-display text-2xl text-[var(--foreground)]">
          {salao.nome}
        </h3>
        <p className="flex items-center gap-1.5 text-sm text-[var(--color-muted)]">
          <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
          {salao.endereco}
        </p>
        <p className="text-sm text-[var(--foreground)]/80">{salao.destaque}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3">
          <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="btn-outline w-fit">
            Abrir no Google Maps
          </a>
          {salao.instagramUrl && (
            <a
              href={salao.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tracked-link flex w-fit items-center gap-1.5 !text-[var(--color-gold-dark)]"
            >
              Instagram
              <ExternalLink className="h-3 w-3" strokeWidth={2} />
            </a>
          )}
        </div>
      </div>

      <div className="overflow-hidden border border-[var(--color-border)] lg:col-span-3">
        <iframe
          title={`Mapa - ${salao.nome}`}
          src={mapsEmbedSrc}
          className="h-[320px] w-full border-0 grayscale-[15%] sm:h-full sm:min-h-[380px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}

export default function BelezaSection() {
  return (
    <section id="beleza" className="border-t border-[var(--color-border)] px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <header className="text-center">
          <p className="eyebrow">Sugestão para as convidadas</p>
          <h2 className="mt-4 font-serif-display text-5xl italic text-[var(--foreground)]">
            Sua produção para o grande dia!
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-[var(--foreground)]/70">
            Deixamos essa sugestão de salão em Mossoró - RN para quem quiser fazer cabelo,
            maquiagem ou estética antes da cerimônia.
          </p>
        </header>

        <div className="mt-16 flex flex-col gap-10">
          {SALOES.map((salao: Salao) => (
            <SalaoBlock key={salao.nome} salao={salao} />
          ))}
        </div>
      </div>
    </section>
  );
}
