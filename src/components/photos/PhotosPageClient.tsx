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
        <div className="mx-auto mb-12 max-w-xl border border-[var(--color-wine)] bg-[var(--color-wine)]/5 p-8 text-center">
          <p className="text-sm font-medium text-[var(--color-wine)]">
            Registre os momentos que você viver com a gente e compartilhe
            suas fotos da nossa celebração neste álbum.
          </p>
        </div>
      )}

      <PhotoGallery photos={photos} />
    </div>
  );
}
