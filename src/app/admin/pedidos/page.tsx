import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/AdminShell";
import { formatBRL } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: "Pendente",
  APROVADO: "Aprovado",
  RECUSADO: "Recusado",
  CANCELADO: "Cancelado",
};

const STATUS_CLASS: Record<string, string> = {
  PENDENTE: "bg-[var(--color-gold)]/15 text-[var(--color-gold)]",
  APROVADO: "bg-[var(--color-secondary)]/15 text-[var(--color-secondary)]",
  RECUSADO: "bg-red-100 text-red-700",
  CANCELADO: "bg-black/10 text-[var(--foreground)]/70",
};

export default async function AdminPedidosPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: { gift: { select: { nome: true } } },
  });

  return (
    <AdminShell>
      <h1 className="font-serif-display text-2xl text-[var(--color-primary-dark)]">
        Pedidos
      </h1>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
            <tr>
              <th className="px-4 py-3">Presente</th>
              <th className="px-4 py-3">Convidado</th>
              <th className="px-4 py-3">Método</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Data</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-[var(--color-border)] last:border-0 align-top">
                <td className="px-4 py-3 font-medium">{p.gift.nome}</td>
                <td className="px-4 py-3">
                  {p.guestName}
                  {p.guestMessage && (
                    <p className="mt-1 max-w-xs text-xs text-[var(--color-muted)]">
                      &ldquo;{p.guestMessage}&rdquo;
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">{p.method === "PIX" ? "Pix" : "Cartão"}</td>
                <td className="px-4 py-3">{formatBRL(p.amount)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[p.status]}`}
                  >
                    {STATUS_LABEL[p.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--color-muted)]">
                  {p.createdAt.toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--color-muted)]">
                  Nenhum pedido registrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
