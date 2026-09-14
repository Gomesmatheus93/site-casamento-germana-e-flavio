"use client";

import { useRef, useState } from "react";
import { UploadCloud, Loader2, Check } from "lucide-react";
import type { GuestPhoto } from "@/types/guest-photo";

export default function PhotoUploadForm({
  onUploaded,
}: {
  onUploaded: (photo: GuestPhoto) => void;
}) {
  const [guestName, setGuestName] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Selecione uma foto para enviar.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData();
    formData.append("file", file);
    if (guestName) formData.append("guestName", guestName);
    if (caption) formData.append("caption", caption);

    try {
      const res = await fetch("/api/guest-photos", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Não foi possível enviar a foto.");
        return;
      }
      onUploaded(data);
      setSuccess(true);
      setFile(null);
      setCaption("");
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      setError("Erro de conexão ao enviar a foto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex max-w-xl flex-col gap-6 border border-[var(--color-border)] p-8"
    >
      <div>
        <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-muted)]">
          Seu nome (opcional)
        </label>
        <input
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className="mt-2 w-full border-0 border-b border-[var(--color-border)] bg-transparent px-0 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          placeholder="Quem está enviando"
        />
      </div>
      <div>
        <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-muted)]">
          Legenda (opcional)
        </label>
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="mt-2 w-full border-0 border-b border-[var(--color-border)] bg-transparent px-0 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          placeholder="Um momento especial..."
        />
      </div>
      <div>
        <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-muted)]">
          Foto
        </label>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mt-2 w-full text-sm file:mr-4 file:border file:border-[var(--foreground)] file:bg-transparent file:px-3 file:py-1.5 file:text-[11px] file:uppercase file:tracking-[0.14em]"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && (
        <p className="flex items-center gap-1 text-sm text-[var(--color-secondary)]">
          <Check className="h-4 w-4" /> Foto enviada com sucesso!
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-solid">
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <UploadCloud className="h-3.5 w-3.5" />
        )}
        Enviar foto
      </button>
    </form>
  );
}
