import { notFound } from "next/navigation";
import { db } from "@/lib/firebase-admin";
import { docToObject } from "@/lib/firestore-utils";
import AdminShell from "@/components/admin/AdminShell";
import GiftForm from "@/components/admin/GiftForm";
import type { Gift } from "@/types/gift";

export default async function EditarPresentePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const snap = await db.collection("gifts").doc(id).get();
  if (!snap.exists) notFound();

  return (
    <AdminShell>
      <h1 className="font-serif-display text-2xl text-[var(--color-primary-dark)]">
        Editar presente
      </h1>
      <div className="mt-6 max-w-2xl rounded-2xl border border-[var(--color-border)] bg-white p-6">
        <GiftForm gift={docToObject<Gift>(snap)} />
      </div>
    </AdminShell>
  );
}
