import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { db } from "@/lib/firebase-admin";
import { docToObject } from "@/lib/firestore-utils";
import Countdown from "@/components/Countdown";
import HeroSlideshow from "@/components/HeroSlideshow";
import PresentesSection from "@/components/sections/PresentesSection";
import FotosSection from "@/components/sections/FotosSection";
import BelezaSection from "@/components/sections/BelezaSection";
import HospedagemSection from "@/components/sections/HospedagemSection";
import LocalSection from "@/components/sections/LocalSection";
import { PHOTOS_UNLOCK_DATE, WEDDING } from "@/lib/wedding-config";
import type { Gift } from "@/types/gift";

export const dynamic = "force-dynamic";

export default async function Home() {
  // eslint-disable-next-line react-hooks/purity -- server component, avaliado a cada request
  const photosUnlocked = Date.now() >= new Date(PHOTOS_UNLOCK_DATE).getTime();

  const [giftsSnap, guestPhotos] = await Promise.all([
    db.collection("gifts").orderBy("status", "asc").orderBy("createdAt", "desc").get(),
    photosUnlocked
      ? prisma.guestPhoto.findMany({ where: { approved: true }, orderBy: { createdAt: "desc" } })
      : Promise.resolve([]),
  ]);
  const gifts = giftsSnap.docs.map((d) => docToObject<Gift>(d));

  return (
    <div>
      <section className="relative flex h-screen w-full items-center justify-center overflow-hidden px-5 text-center">
        <HeroSlideshow alt={`${WEDDING.noivos.ela} e ${WEDDING.noivos.ele}`} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/65" />

        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center text-white drop-shadow-md">
          <p
            className="animate-fade-up text-xs font-semibold uppercase tracking-[0.28em] text-white"
            style={{ animationDelay: "0.1s" }}
          >
            Vamos nos casar
          </p>
          <h1
            className="animate-fade-up font-serif-minimal mt-6 flex w-full flex-col items-center justify-center text-center text-6xl leading-[0.95] sm:flex-row sm:gap-x-4 sm:text-[clamp(3.5rem,9vw,6rem)]"
            style={{ animationDelay: "0.3s" }}
          >
            <span>{WEDDING.noivos.ela}</span>
            <span className="text-[#f4d6aa]">&amp;</span>
            <span>{WEDDING.noivos.ele}</span>
          </h1>
          <p
            className="animate-fade-up mx-auto mt-7 max-w-xl text-center text-sm leading-relaxed text-white"
            style={{ animationDelay: "0.55s" }}
          >
            {WEDDING.dataFormatada} · {WEDDING.horario}
            <br />
            {WEDDING.cerimonia.nome}, Mossoró · RN
          </p>
        </div>
      </section>

      <section className="bg-[var(--color-wine)] px-5 py-20 text-center">
        <Countdown targetISO={WEDDING.dataISO} light />

        <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
          <Link href="#presentes" className="btn-solid-light">
            Lista de presentes
          </Link>
          <Link href="#local" className="btn-outline-light">
            Local da cerimônia
          </Link>
        </div>
      </section>

      <section className="bg-[var(--color-surface)] px-5 py-24">
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

      <PresentesSection gifts={gifts} />

      <FotosSection
        unlocked={photosUnlocked}
        photos={guestPhotos.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() }))}
      />

      <BelezaSection />

      <HospedagemSection />

      <LocalSection />
    </div>
  );
}
