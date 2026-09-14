import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Countdown from "@/components/Countdown";
import HeroSlideshow from "@/components/HeroSlideshow";
import PresentesSection from "@/components/sections/PresentesSection";
import FotosSection from "@/components/sections/FotosSection";
import HospedagemSection from "@/components/sections/HospedagemSection";
import LocalSection from "@/components/sections/LocalSection";
import { PHOTOS_UNLOCK_DATE, WEDDING } from "@/lib/wedding-config";

export const dynamic = "force-dynamic";

export default async function Home() {
  // eslint-disable-next-line react-hooks/purity -- server component, avaliado a cada request
  const photosUnlocked = Date.now() >= new Date(PHOTOS_UNLOCK_DATE).getTime();

  const [gifts, guestPhotos] = await Promise.all([
    prisma.gift.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }] }),
    photosUnlocked
      ? prisma.guestPhoto.findMany({ where: { approved: true }, orderBy: { createdAt: "desc" } })
      : Promise.resolve([]),
  ]);

  return (
    <div>
      <section className="relative flex h-screen w-full items-center justify-center overflow-hidden px-5 text-center">
        <HeroSlideshow alt={`${WEDDING.noivos.ela} e ${WEDDING.noivos.ele}`} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/55" />

        <div className="relative z-10">
          <p className="eyebrow animate-fade-up text-white/80" style={{ animationDelay: "0.1s" }}>
            Vamos nos casar
          </p>
          <h1
            className="animate-fade-up font-serif-minimal mx-auto mt-6 max-w-4xl text-6xl leading-[1.05] text-white sm:text-8xl"
            style={{ animationDelay: "0.3s" }}
          >
            {WEDDING.noivos.ela} <span className="text-[var(--color-primary)]">&amp;</span>{" "}
            {WEDDING.noivos.ele}
          </h1>
          <p
            className="animate-fade-up mx-auto mt-7 max-w-xl text-sm leading-relaxed text-white/85"
            style={{ animationDelay: "0.55s" }}
          >
            {WEDDING.dataFormatada} · {WEDDING.horario}
            <br />
            {WEDDING.cerimonia.nome}, Mossoró · RN
          </p>
        </div>
      </section>

      <section className="px-5 py-20 text-center">
        <Countdown targetISO={WEDDING.dataISO} />

        <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
          <Link href="#presentes" className="btn-solid">
            Lista de presentes
          </Link>
          <Link href="#local" className="btn-outline">
            Local da cerimônia
          </Link>
        </div>
      </section>

      <section className="border-t border-[var(--color-border)] px-5 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Com carinho</p>
          <h2 className="mt-4 font-serif-display text-4xl italic text-[var(--foreground)]">
            Contamos com a sua presença
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-[var(--foreground)]/70">
            Mais do que presentes, o que mais desejamos é celebrar esse dia ao lado de
            quem amamos. Sua presença é o maior presente — mas se quiser nos ajudar a
            construir esse novo capítulo, preparamos uma lista com carinho.
          </p>
        </div>
      </section>

      <PresentesSection
        gifts={gifts.map((g) => ({
          ...g,
          createdAt: g.createdAt.toISOString(),
          updatedAt: g.updatedAt.toISOString(),
        }))}
      />

      <FotosSection
        unlocked={photosUnlocked}
        photos={guestPhotos.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() }))}
      />

      <HospedagemSection />

      <LocalSection />
    </div>
  );
}
