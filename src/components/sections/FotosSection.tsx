import PhotosPageClient from "@/components/photos/PhotosPageClient";
import type { GuestPhoto } from "@/types/guest-photo";

export default function FotosSection({
  unlocked,
  photos,
}: {
  unlocked: boolean;
  photos: GuestPhoto[];
}) {
  return (
    <section id="fotos" className="border-t border-[var(--color-border)] px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <header className="mb-16 text-center">
          <p className="eyebrow">Registrado por quem estava lá</p>
          <h2 className="mt-4 font-serif-display text-5xl italic text-[var(--foreground)]">
            Álbum dos Convidados
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-[var(--foreground)]/70">
            Depois da festa, compartilhe aqui as fotos que você tirou! Elas ficam
            disponíveis para todos os convidados relembrarem o grande dia.
          </p>
        </header>

        <PhotosPageClient unlocked={unlocked} initialPhotos={photos} />
      </div>
    </section>
  );
}
