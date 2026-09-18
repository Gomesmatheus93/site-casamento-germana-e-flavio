"use client";

import { useState } from "react";
import type { Gift } from "@/types/gift";
import GiftCard from "./GiftCard";
import GiftPaymentModal from "./GiftPaymentModal";

export default function GiftList({ initialGifts }: { initialGifts: Gift[] }) {
  const [gifts, setGifts] = useState(initialGifts);
  const [selected, setSelected] = useState<Gift | null>(null);

  function handleGiftUpdated(updated: Gift) {
    setGifts((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    setSelected((prev) => (prev && prev.id === updated.id ? updated : prev));
  }

  return (
    <div>
      {gifts.length === 0 ? (
        <p className="text-center text-sm text-[var(--color-muted)]">
          Nenhum presente encontrado.
        </p>
      ) : (
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {gifts.map((gift) => (
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
