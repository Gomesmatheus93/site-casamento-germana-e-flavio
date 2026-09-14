"use client";

import { useState } from "react";
import type { GuestPhoto } from "@/types/guest-photo";
import PhotoUploadForm from "./PhotoUploadForm";
import PhotoGallery from "./PhotoGallery";

export default function PhotosPageClient({
  initialPhotos,
  unlocked,
}: {
  initialPhotos: GuestPhoto[];
  unlocked: boolean;
}) {
  const [photos, setPhotos] = useState(initialPhotos);

  return (
    <div>
      {unlocked ? (
        <div className="mb-12">
          <PhotoUploadForm onUploaded={(photo) => setPhotos((prev) => [photo, ...prev])} />
        </div>
      ) : (
        <div className="mx-auto mb-12 max-w-xl border border-[var(--color-border)] p-8 text-center">
          <p className="text-sm text-[var(--foreground)]/80">
            O envio de fotos abre para todos os convidados logo após a cerimônia. Volte
            aqui após o dia 01/11/2026 para compartilhar seus registros do grande dia!
          </p>
        </div>
      )}

      <PhotoGallery photos={photos} />
    </div>
  );
}
