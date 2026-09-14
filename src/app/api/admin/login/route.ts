import { NextRequest, NextResponse } from "next/server";
import { createAdminSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return NextResponse.json(
      { error: "Credenciais administrativas não configuradas no servidor." },
      { status: 500 }
    );
  }

  if (email.toLowerCase() !== adminEmail.toLowerCase() || password !== adminPassword) {
    return NextResponse.json({ error: "Email ou senha inválidos." }, { status: 401 });
  }

  await createAdminSession(email);
  return NextResponse.json({ ok: true });
}
