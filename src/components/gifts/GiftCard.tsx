"use client";

import type { Gift } from "@/types/gift";
import { formatBRL } from "@/lib/format";

export default function GiftCard({
  gift,
  onSelect,
}: {
  gift: Gift;
  onSelect: (gift: Gift) => void;
}) {
  return (
    <div className="flex flex-col border border-[var(--color-border)] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_-18px_rgba(34,42,31,0.35)]">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--color-primary)]/5">
        {gift.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={gift.fotoUrl}
            alt={gift.nome}
            className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-serif-display text-3xl italic text-[var(--color-primary)]/30">
              {gift.nome.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-secondary)]">
          {gift.categoria}
        </span>
        <h3 className="font-serif-display text-xl text-[var(--foreground)]">{gift.nome}</h3>
        {gift.descricao && (
          <p className="line-clamp-2 text-sm text-[var(--color-muted)]">{gift.descricao}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="font-serif-display text-lg text-[var(--foreground)]">
            {formatBRL(gift.valor)}
          </span>
          <button type="button" onClick={() => onSelect(gift)} className="btn-outline !px-4 !py-2">
            Presentear
          </button>
        </div>
      </div>
    </div>
  );
}
