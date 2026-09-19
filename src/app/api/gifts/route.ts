import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import { docToObject } from "@/lib/firestore-utils";
import { requireAdmin } from "@/lib/require-admin";
import type { Gift } from "@/types/gift";

const giftSchema = z.object({
  nome: z.string().min(2).max(120),
  valor: z.number().positive(),
  categoria: z.string().min(2).max(60),
  descricao: z.string().max(2000).optional().nullable(),
  fotoUrl: z.string().max(2000).optional().nullable(),
  linkExterno: z.string().max(2000).optional().nullable(),
  status: z.enum(["DISPONIVEL", "RESERVADO", "COMPRADO"]).optional(),
});

export async function GET() {
  const snap = await db
    .collection("gifts")
    .orderBy("status", "asc")
    .orderBy("createdAt", "desc")
    .get();
  const gifts = snap.docs.map((d) => docToObject<Gift>(d));
  return NextResponse.json(gifts);
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  const parsed = giftSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const ref = await db.collection("gifts").add({
    ...parsed.data,
    status: parsed.data.status ?? "DISPONIVEL",
    descricao: parsed.data.descricao || null,
    fotoUrl: parsed.data.fotoUrl || null,
    linkExterno: parsed.data.linkExterno || null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const snap = await ref.get();
  return NextResponse.json(docToObject<Gift>(snap), { status: 201 });
}
