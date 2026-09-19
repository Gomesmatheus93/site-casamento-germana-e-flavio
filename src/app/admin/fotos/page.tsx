import { db } from "@/lib/firebase-admin";
import { docToObject } from "@/lib/firestore-utils";
import AdminShell from "@/components/admin/AdminShell";
import AdminPhotoGrid from "@/components/admin/AdminPhotoGrid";
import type { GuestPhoto } from "@/types/guest-photo";

export const dynamic = "force-dynamic";

export default async function AdminFotosPage() {
  const snap = await db.collection("guestPhotos").orderBy("createdAt", "desc").get();
  const photos = snap.docs.map((d) => docToObject<GuestPhoto>(d));

  return (
    <AdminShell>
      <h1 className="font-serif-display text-2xl text-[var(--color-primary-dark)]">
        Fotos dos convidados
      </h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Remova fotos duplicadas ou inadequadas do álbum público.
      </p>

      <div className="mt-6">
        <AdminPhotoGrid initialPhotos={photos} />
      </div>
    </AdminShell>
  );
}
