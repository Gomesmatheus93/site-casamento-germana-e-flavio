"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { GuestPhoto } from "@/types/guest-photo";

export default function PhotoGallery({ photos }: { photos: GuestPhoto[] }) {
  const [active, setActive] = useState<GuestPhoto | null>(null);

  if (photos.length === 0) {
    return (
      <p className="text-center text-sm text-[var(--color-muted)]">
        Ainda não há fotos por aqui. Seja o primeiro a compartilhar um momento!
      </p>
    );
  }

  return (
    <>
      <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setActive(photo)}
            className="block w-full overflow-hidden border border-[var(--color-border)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt={photo.caption || "Foto do casamento"} className="w-full" />
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            className="absolute right-5 top-5 text-white"
            onClick={() => setActive(null)}
            aria-label="Fechar"
          >
            <X className="h-7 w-7" />
          </button>
          <div className="max-h-[85vh] max-w-3xl" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.url}
              alt={active.caption || "Foto do casamento"}
              className="max-h-[75vh] w-auto rounded-lg"
            />
            {(active.caption || active.guestName) && (
              <p className="mt-3 text-center text-sm text-white/90">
                {active.caption}
                {active.caption && active.guestName ? " — " : ""}
                {active.guestName}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
