"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Check, Gift, Heart, Loader2 } from "lucide-react";

type Status = "idle" | "sending" | "done" | "error";

const inputClass =
  "w-full border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--color-muted)]/70 focus:border-[var(--color-primary)]";

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function RsvpForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [withCompanions, setWithCompanions] = useState<boolean | null>(null);
  const [companions, setCompanions] = useState<string[]>([""]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (attending === null) {
      setError("Conte para nós se poderá comparecer.");
      setStatus("error");
      return;
    }
    if (attending && withCompanions === null) {
      setError("Conte para nós se irá sozinho(a) ou acompanhado(a).");
      setStatus("error");
      return;
    }

    const companionList = attending && withCompanions ? companions.map((n) => n.trim()) : [];

    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          attending,
          guestCount: attending ? 1 + companionList.length : 0,
          companionNames: companionList.length ? companionList.join("\n") : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível enviar agora. Tente novamente.");
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar agora. Tente novamente.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="flex flex-col items-center border border-[var(--color-border)] bg-white px-6 py-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-secondary)]/12 text-[var(--color-secondary)]">
          {attending ? <Check className="h-6 w-6" strokeWidth={1.5} /> : <Heart className="h-5 w-5" strokeWidth={1.5} />}
        </span>
        <h2 className="mt-5 font-serif-display text-3xl italic text-[var(--foreground)]">
          {attending ? "Presença confirmada!" : "Obrigado por nos avisar"}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[var(--foreground)]/70">
          {attending
            ? "Que alegria saber que você estará conosco nesse dia tão especial. Mal podemos esperar para celebrar juntos!"
            : "Sentiremos sua falta, mas agradecemos de coração pelo carinho de responder."}
        </p>
        <p className="mt-4 text-xs text-[var(--color-muted)]">
          Se precisar alterar sua resposta, basta enviar de novo usando o mesmo telefone.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/#presentes" className="btn-outline">
            <Gift className="h-3.5 w-3.5" strokeWidth={1.5} />
            Lista de presentes
          </Link>
          <Link href="/" className="tracked-link">
            Voltar ao site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 border border-[var(--color-border)] bg-white px-6 py-8 sm:px-10 sm:py-10">
      <label className="flex flex-col gap-2">
        <span className="eyebrow">Nome completo</span>
        <input
          required
          minLength={2}
          maxLength={120}
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="Como está no convite"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="eyebrow">Telefone / WhatsApp</span>
        <input
          required
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          className={inputClass}
          placeholder="(84) 99999-9999"
        />
      </label>

      <fieldset className="flex flex-col gap-3">
        <legend className="eyebrow mb-2">Você poderá comparecer?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { value: true, label: "Sim, estarei lá" },
            { value: false, label: "Infelizmente não poderei ir" },
          ].map((option) => {
            const selected = attending === option.value;
            return (
              <button
                key={String(option.value)}
                type="button"
                aria-pressed={selected}
                onClick={() => setAttending(option.value)}
                className={`border px-4 py-3.5 text-sm transition-colors ${
                  selected
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                    : "border-[var(--color-border)] text-[var(--foreground)]/80 hover:border-[var(--color-primary)]/60"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {attending && (
        <>
          <fieldset className="flex flex-col gap-3">
            <legend className="eyebrow mb-2">Você irá sozinho(a) ou acompanhado(a)?</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { value: false, label: "Irei sozinho(a)" },
                { value: true, label: "Irei acompanhado(a)" },
              ].map((option) => {
                const selected = withCompanions === option.value;
                return (
                  <button
                    key={String(option.value)}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setWithCompanions(option.value)}
                    className={`border px-4 py-3.5 text-sm transition-colors ${
                      selected
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                        : "border-[var(--color-border)] text-[var(--foreground)]/80 hover:border-[var(--color-primary)]/60"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {withCompanions && (
            <>
              <label className="flex flex-col gap-2">
                <span className="eyebrow">Quantidade de acompanhantes</span>
                <select
                  value={companions.length}
                  onChange={(e) => {
                    const count = Number(e.target.value);
                    setCompanions((prev) => Array.from({ length: count }, (_, i) => prev[i] ?? ""));
                  }}
                  className={inputClass}
                >
                  {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n === 1 ? "1 acompanhante" : `${n} acompanhantes`}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-col gap-3">
                <span className="eyebrow">
                  {companions.length === 1 ? "Nome do acompanhante" : "Nome dos acompanhantes"}
                </span>
                {companions.map((value, i) => (
                  <input
                    key={i}
                    required
                    minLength={2}
                    maxLength={50}
                    aria-label={`Nome do acompanhante ${i + 1}`}
                    value={value}
                    onChange={(e) =>
                      setCompanions((prev) => prev.map((name, j) => (j === i ? e.target.value : name)))
                    }
                    className={inputClass}
                    placeholder={companions.length === 1 ? "Nome completo" : `Acompanhante ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {status === "error" && error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={status === "sending"} className="btn-solid mt-2 w-full">
        {status === "sending" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {status === "sending" ? "Enviando..." : "Enviar resposta"}
      </button>
    </form>
  );
}
