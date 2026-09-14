"use client";

import type { Gift } from "@/types/gift";
import { formatBRL } from "@/lib/format";

const STATUS_LABEL: Record<Gift["status"], string> = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  COMPRADO: "Presenteado",
};

export default function GiftCard({
  gift,
  onSelect,
}: {
  gift: Gift;
  onSelect: (gift: Gift) => void;
}) {
  const disabled = gift.status === "COMPRADO";

  return (
    <div className="flex flex-col">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--color-primary)]/5">
        {gift.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={gift.fotoUrl}
            alt={gift.nome}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-serif-display text-3xl italic text-[var(--color-primary)]/30">
              {gift.nome.charAt(0)}
            </span>
          </div>
        )}
        {gift.status !== "DISPONIVEL" && (
          <span className="absolute left-0 top-0 bg-[var(--foreground)] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--background)]">
            {STATUS_LABEL[gift.status]}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 border-t border-[var(--foreground)]/20 pt-4">
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
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelect(gift)}
            className="btn-outline !px-4 !py-2"
          >
            {disabled ? "Presenteado" : "Presentear"}
          </button>
        </div>
      </div>
    </div>
  );
}
