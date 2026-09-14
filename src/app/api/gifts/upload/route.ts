import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { saveUploadedImage } from "@/lib/upload";

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  try {
    const url = await saveUploadedImage(file, "presentes");
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao salvar imagem.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
