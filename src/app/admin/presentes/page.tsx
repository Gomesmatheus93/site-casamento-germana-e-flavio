import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/AdminShell";
import { formatBRL } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  COMPRADO: "Presenteado",
};

export default async function AdminPresentesPage() {
  const gifts = await prisma.gift.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="font-serif-display text-3xl italic text-[var(--foreground)]">
          Presentes
        </h1>
        <Link href="/admin/presentes/novo" className="btn-solid">
          <Plus className="h-3.5 w-3.5" />
          Novo presente
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
            <tr>
              <th className="px-4 py-3">Presente</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {gifts.map((gift) => (
              <tr key={gift.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-4 py-3 font-medium">{gift.nome}</td>
                <td className="px-4 py-3 text-[var(--color-muted)]">{gift.categoria}</td>
                <td className="px-4 py-3">{formatBRL(gift.valor)}</td>
                <td className="px-4 py-3">{STATUS_LABEL[gift.status]}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/presentes/${gift.id}`}
                    className="text-[var(--color-primary)] hover:underline"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {gifts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--color-muted)]">
                  Nenhum presente cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
