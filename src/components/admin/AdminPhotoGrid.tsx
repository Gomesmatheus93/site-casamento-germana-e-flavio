"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { GuestPhoto } from "@/types/guest-photo";

export default function AdminPhotoGrid({ initialPhotos }: { initialPhotos: GuestPhoto[] }) {
  const [photos, setPhotos] = useState(initialPhotos);

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta foto?")) return;
    await fetch(`/api/guest-photos/${id}`, { method: "DELETE" });
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  if (photos.length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted)]">Nenhuma foto enviada ainda.</p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="group relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-white"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.url} alt={photo.caption || ""} className="aspect-square w-full object-cover" />
          <button
            type="button"
            onClick={() => handleDelete(photo.id)}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
            aria-label="Excluir foto"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          {(photo.guestName || photo.caption) && (
            <p className="p-2 text-xs text-[var(--color-muted)]">
              {photo.guestName}
              {photo.guestName && photo.caption ? " — " : ""}
              {photo.caption}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
