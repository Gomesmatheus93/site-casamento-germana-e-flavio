"use client";

import { useMemo, useState } from "react";
import type { Gift } from "@/types/gift";
import GiftCard from "./GiftCard";
import GiftPaymentModal from "./GiftPaymentModal";

export default function GiftList({ initialGifts }: { initialGifts: Gift[] }) {
  const [gifts, setGifts] = useState(initialGifts);
  const [selected, setSelected] = useState<Gift | null>(null);
  const [categoria, setCategoria] = useState("Todas");
  const [somenteDisponiveis, setSomenteDisponiveis] = useState(false);

  const categorias = useMemo(
    () => ["Todas", ...Array.from(new Set(gifts.map((g) => g.categoria)))],
    [gifts]
  );

  const filtered = useMemo(
    () =>
      gifts.filter((g) => {
        if (categoria !== "Todas" && g.categoria !== categoria) return false;
        if (somenteDisponiveis && g.status !== "DISPONIVEL") return false;
        return true;
      }),
    [gifts, categoria, somenteDisponiveis]
  );

  function handleGiftUpdated(updated: Gift) {
    setGifts((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    setSelected((prev) => (prev && prev.id === updated.id ? updated : prev));
  }

  return (
    <div>
      <div className="mb-14 flex flex-wrap items-center justify-center gap-6 border-y border-[var(--color-border)] py-5">
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="border-0 bg-transparent text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--foreground)]/80 outline-none"
        >
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--foreground)]/80">
          <input
            type="checkbox"
            checked={somenteDisponiveis}
            onChange={(e) => setSomenteDisponiveis(e.target.checked)}
          />
          Somente disponíveis
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-[var(--color-muted)]">
          Nenhum presente encontrado com esse filtro.
        </p>
      ) : (
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((gift) => (
            <GiftCard key={gift.id} gift={gift} onSelect={setSelected} />
          ))}
        </div>
      )}

      {selected && (
        <GiftPaymentModal
          gift={selected}
          onClose={() => setSelected(null)}
          onGiftUpdated={handleGiftUpdated}
        />
      )}
    </div>
  );
}
