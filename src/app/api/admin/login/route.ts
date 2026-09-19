import { NextRequest, NextResponse } from "next/server";
import { createAdminSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const idToken = typeof body?.idToken === "string" ? body.idToken : null;

  if (!idToken) {
    return NextResponse.json({ error: "Token inválido." }, { status: 400 });
  }

  try {
    await createAdminSession(idToken);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Não foi possível entrar." }, { status: 401 });
  }
}
