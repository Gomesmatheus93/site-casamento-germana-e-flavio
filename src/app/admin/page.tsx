import Link from "next/link";
import { Gift, ReceiptText, Images, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/AdminShell";
import { formatBRL } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [totalGifts, disponiveis, comprados, aprovados, photosCount] = await Promise.all([
    prisma.gift.count(),
    prisma.gift.count({ where: { status: "DISPONIVEL" } }),
    prisma.gift.count({ where: { status: "COMPRADO" } }),
    prisma.payment.findMany({ where: { status: "APROVADO" } }),
    prisma.guestPhoto.count(),
  ]);

  const totalArrecadado = aprovados.reduce((sum, p) => sum + p.amount, 0);

  const cards = [
    { label: "Presentes cadastrados", value: totalGifts, icon: Gift },
    { label: "Disponíveis", value: disponiveis, icon: Gift },
    { label: "Presenteados", value: comprados, icon: ReceiptText },
    { label: "Fotos enviadas", value: photosCount, icon: Images },
  ];

  return (
    <AdminShell>
      <h1 className="font-serif-display text-3xl italic text-[var(--foreground)]">
        Visão geral
      </h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-[var(--color-border)] bg-white p-5"
          >
            <c.icon className="h-5 w-5 text-[var(--color-primary)]" />
            <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
              {c.value}
            </p>
            <p className="text-sm text-[var(--color-muted)]">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-[var(--color-border)] bg-white p-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[var(--color-secondary)]" />
          <h2 className="font-serif-display text-lg text-[var(--foreground)]">
            Total arrecadado (pagamentos aprovados)
          </h2>
        </div>
        <p className="mt-2 font-serif-display text-3xl text-[var(--foreground)]">
          {formatBRL(totalArrecadado)}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/admin/presentes/novo" className="btn-solid">
          Cadastrar novo presente
        </Link>
        <Link href="/admin/pedidos" className="btn-outline">
          Ver pedidos
        </Link>
      </div>
    </AdminShell>
  );
}
