import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  return null;
}
