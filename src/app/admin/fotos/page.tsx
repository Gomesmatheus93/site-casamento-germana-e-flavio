import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/AdminShell";
import AdminPhotoGrid from "@/components/admin/AdminPhotoGrid";

export const dynamic = "force-dynamic";

export default async function AdminFotosPage() {
  const photos = await prisma.guestPhoto.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <AdminShell>
      <h1 className="font-serif-display text-2xl text-[var(--color-primary-dark)]">
        Fotos dos convidados
      </h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Remova fotos duplicadas ou inadequadas do álbum público.
      </p>

      <div className="mt-6">
        <AdminPhotoGrid
          initialPhotos={photos.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() }))}
        />
      </div>
    </AdminShell>
  );
}
