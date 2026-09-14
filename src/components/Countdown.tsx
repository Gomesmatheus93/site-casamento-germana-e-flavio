"use client";

import { Fragment, useEffect, useState } from "react";

function getTimeLeft(target: Date) {
  const diff = target.getTime() - Date.now();
  const clamped = Math.max(diff, 0);
  return {
    dias: Math.floor(clamped / (1000 * 60 * 60 * 24)),
    horas: Math.floor((clamped / (1000 * 60 * 60)) % 24),
    minutos: Math.floor((clamped / (1000 * 60)) % 60),
    segundos: Math.floor((clamped / 1000) % 60),
    acabou: diff <= 0,
  };
}

export default function Countdown({
  targetISO,
  light = false,
}: {
  targetISO: string;
  light?: boolean;
}) {
  const target = new Date(targetISO);
  const [time, setTime] = useState<ReturnType<typeof getTimeLeft> | null>(null);

  useEffect(() => {
    // Roda só no cliente para evitar mismatch de hidratação (servidor e
    // cliente calculam Date.now() em instantes diferentes).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTime(getTimeLeft(target));
    const interval = setInterval(() => setTime(getTimeLeft(target)), 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetISO]);

  if (!time) {
    return <div className="h-[92px]" aria-hidden />;
  }

  if (time.acabou) {
    return (
      <p
        className={`font-serif-display text-2xl italic ${light ? "text-white" : "text-[var(--foreground)]"}`}
      >
        Já estamos casados
      </p>
    );
  }

  const items = [
    { label: "dias", value: time.dias },
    { label: "horas", value: time.horas },
    { label: "min", value: time.minutos },
    { label: "seg", value: time.segundos },
  ];

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-7">
      {items.map((item, idx) => (
        <Fragment key={item.label}>
          {idx > 0 && (
            <span
              className={`font-serif-display text-xl ${light ? "text-white/40" : "text-[var(--color-border)]"}`}
            >
              /
            </span>
          )}
          <div
            className={`flex w-16 flex-col items-center border-t pt-3 sm:w-20 ${light ? "border-white/40" : "border-[var(--foreground)]/30"}`}
          >
            <span
              className={`font-serif-display text-3xl sm:text-4xl ${light ? "text-white" : "text-[var(--foreground)]"}`}
            >
              {String(item.value).padStart(2, "0")}
            </span>
            <span
              className={`mt-1 text-[10px] uppercase tracking-[0.22em] ${light ? "text-white/70" : "text-[var(--color-muted)]"}`}
            >
              {item.label}
            </span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
