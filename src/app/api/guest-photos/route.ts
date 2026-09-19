import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import { docToObject } from "@/lib/firestore-utils";
import { saveUploadedImage } from "@/lib/upload";
import { PHOTOS_UNLOCK_DATE } from "@/lib/wedding-config";
import type { GuestPhoto } from "@/types/guest-photo";

export async function GET() {
  const snap = await db
    .collection("guestPhotos")
    .where("approved", "==", true)
    .orderBy("createdAt", "desc")
    .get();
  const photos = snap.docs.map((d) => docToObject<GuestPhoto>(d));
  return NextResponse.json(photos);
}

export async function POST(req: NextRequest) {
  if (Date.now() < new Date(PHOTOS_UNLOCK_DATE).getTime()) {
    return NextResponse.json(
      { error: "O álbum de fotos só abre para envios após o dia do casamento." },
      { status: 403 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const guestName = formData.get("guestName");
  const caption = formData.get("caption");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  try {
    const url = await saveUploadedImage(file, "fotos");
    const ref = await db.collection("guestPhotos").add({
      url,
      guestName: typeof guestName === "string" && guestName.trim() ? guestName.trim().slice(0, 80) : null,
      caption: typeof caption === "string" && caption.trim() ? caption.trim().slice(0, 300) : null,
      approved: true,
      createdAt: FieldValue.serverTimestamp(),
    });
    const snap = await ref.get();
    return NextResponse.json(docToObject<GuestPhoto>(snap), { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao salvar imagem.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
