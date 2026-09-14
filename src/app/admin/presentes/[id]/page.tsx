import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/AdminShell";
import GiftForm from "@/components/admin/GiftForm";

export default async function EditarPresentePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const gift = await prisma.gift.findUnique({ where: { id } });
  if (!gift) notFound();

  return (
    <AdminShell>
      <h1 className="font-serif-display text-2xl text-[var(--color-primary-dark)]">
        Editar presente
      </h1>
      <div className="mt-6 max-w-2xl rounded-2xl border border-[var(--color-border)] bg-white p-6">
        <GiftForm
          gift={{
            ...gift,
            createdAt: gift.createdAt.toISOString(),
            updatedAt: gift.updatedAt.toISOString(),
          }}
        />
      </div>
    </AdminShell>
  );
}
