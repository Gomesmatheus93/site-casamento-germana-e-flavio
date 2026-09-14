"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, UploadCloud, Trash2 } from "lucide-react";
import type { Gift } from "@/types/gift";
import { CATEGORIAS_PRESENTE } from "@/lib/wedding-config";

export default function GiftForm({ gift }: { gift?: Gift }) {
  const router = useRouter();
  const isEdit = Boolean(gift);

  const [nome, setNome] = useState(gift?.nome ?? "");
  const [valor, setValor] = useState(gift?.valor?.toString() ?? "");
  const [categoria, setCategoria] = useState(gift?.categoria ?? CATEGORIAS_PRESENTE[0]);
  const [status, setStatus] = useState<Gift["status"]>(gift?.status ?? "DISPONIVEL");
  const [descricao, setDescricao] = useState(gift?.descricao ?? "");
  const [fotoUrl, setFotoUrl] = useState(gift?.fotoUrl ?? "");
  const [linkExterno, setLinkExterno] = useState(gift?.linkExterno ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/gifts/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao enviar imagem.");
        return;
      }
      setFotoUrl(data.url);
    } catch {
      setError("Erro de conexão ao enviar imagem.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      nome,
      valor: Number(valor),
      categoria,
      descricao: descricao || null,
      fotoUrl: fotoUrl || null,
      linkExterno: linkExterno || null,
      ...(isEdit ? { status } : {}),
    };

    try {
      const res = await fetch(isEdit ? `/api/gifts/${gift!.id}` : "/api/gifts", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao salvar presente.");
        return;
      }
      router.push("/admin/presentes");
      router.refresh();
    } catch {
      setError("Erro de conexão ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!gift) return;
    if (!confirm(`Excluir "${gift.nome}"? Essa ação não pode ser desfeita.`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/gifts/${gift.id}`, { method: "DELETE" });
      router.push("/admin/presentes");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Nome do presente</label>
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Valor (R$)</label>
          <input
            required
            type="number"
            min="0.01"
            step="0.01"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Categoria</label>
          <input
            required
            list="categorias"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          />
          <datalist id="categorias">
            {CATEGORIAS_PRESENTE.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        {isEdit && (
          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Gift["status"])}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
            >
              <option value="DISPONIVEL">Disponível</option>
              <option value="RESERVADO">Reservado</option>
              <option value="COMPRADO">Presenteado</option>
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Descrição</label>
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Foto do presente</label>
        <div className="flex flex-wrap items-center gap-4">
          {fotoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fotoUrl}
              alt="Prévia"
              className="h-20 w-20 rounded-lg border border-[var(--color-border)] object-cover"
            />
          )}
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm hover:bg-black/5">
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="h-4 w-4" />
            )}
            Enviar imagem
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        </div>
        <input
          value={fotoUrl}
          onChange={(e) => setFotoUrl(e.target.value)}
          placeholder="ou cole a URL de uma imagem"
          className="mt-2 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Link de loja parceira (opcional)
        </label>
        <input
          value={linkExterno}
          onChange={(e) => setLinkExterno(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
        />
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Exibido como opção alternativa para quem preferir comprar diretamente em um
          site parceiro.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-between pt-2">
        <button type="submit" disabled={saving || uploading} className="btn-solid">
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {isEdit ? "Salvar alterações" : "Cadastrar presente"}
        </button>

        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 border border-red-200 px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Excluir
          </button>
        )}
      </div>
    </form>
  );
}
