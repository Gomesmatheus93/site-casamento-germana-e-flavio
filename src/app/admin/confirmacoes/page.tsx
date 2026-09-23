import { Download } from "lucide-react";
import { db } from "@/lib/firebase-admin";
import { docToObject } from "@/lib/firestore-utils";
import AdminShell from "@/components/admin/AdminShell";
import type { Rsvp } from "@/types/rsvp";

export const dynamic = "force-dynamic";

function formatPhone(digits: string) {
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return digits;
}

export default async function AdminConfirmacoesPage() {
  const snap = await db.collection("rsvps").orderBy("updatedAt", "desc").get();
  const rsvps = snap.docs.map((d) => docToObject<Rsvp>(d));

  const confirmed = rsvps.filter((r) => r.attending);
  const totalPeople = confirmed.reduce((sum, r) => sum + r.guestCount, 0);
  const declined = rsvps.length - confirmed.length;

  const cards = [
    { label: "Pessoas confirmadas", value: totalPeople },
    { label: "Respostas \"sim\"", value: confirmed.length },
    { label: "Não poderão ir", value: declined },
  ];

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="font-serif-display text-2xl text-[var(--color-primary-dark)]">
          Confirmações de presença
        </h1>
        <div className="flex gap-2">
          <a href="/api/admin/rsvps/export?format=csv" className="btn-outline">
            <Download className="h-3.5 w-3.5" />
            Exportar CSV
          </a>
          <a href="/api/admin/rsvps/export?format=xlsx" className="btn-solid">
            <Download className="h-3.5 w-3.5" />
            Exportar Excel
          </a>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-[var(--color-border)] bg-white p-5">
            <p className="text-2xl font-semibold text-[var(--foreground)]">{c.value}</p>
            <p className="text-sm text-[var(--color-muted)]">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-white">
        {rsvps.length === 0 ? (
          <p className="p-6 text-sm text-[var(--color-muted)]">Nenhuma resposta ainda.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border)] text-xs uppercase tracking-wider text-[var(--color-muted)]">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3">Resposta</th>
                <th className="px-4 py-3">Pessoas</th>
                <th className="px-4 py-3">Acompanhantes</th>
                <th className="px-4 py-3">Atualizado em</th>
              </tr>
            </thead>
            <tbody>
              {rsvps.map((r) => (
                <tr key={r.id} className="border-b border-[var(--color-border)] last:border-0 align-top">
                  <td className="px-4 py-3 font-medium text-[var(--foreground)]">{r.name}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <a href={`https://wa.me/55${r.phone}`} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline">
                      {formatPhone(r.phone)}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs ${
                        r.attending
                          ? "bg-[var(--color-secondary)]/15 text-[var(--color-secondary)]"
                          : "bg-black/10 text-[var(--foreground)]/70"
                      }`}
                    >
                      {r.attending ? "Vai" : "Não vai"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{r.attending ? r.guestCount : "—"}</td>
                  <td className="whitespace-pre-line px-4 py-3 text-[var(--foreground)]/80">
                    {r.companionNames || "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[var(--color-muted)]">
                    {new Date(r.updatedAt).toLocaleString("pt-BR", { timeZone: "America/Fortaleza", dateStyle: "short", timeStyle: "short" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminShell>
  );
}
