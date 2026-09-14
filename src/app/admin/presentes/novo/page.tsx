import AdminShell from "@/components/admin/AdminShell";
import GiftForm from "@/components/admin/GiftForm";

export default function NovoPresentePage() {
  return (
    <AdminShell>
      <h1 className="font-serif-display text-2xl text-[var(--color-primary-dark)]">
        Novo presente
      </h1>
      <div className="mt-6 max-w-2xl rounded-2xl border border-[var(--color-border)] bg-white p-6">
        <GiftForm />
      </div>
    </AdminShell>
  );
}
