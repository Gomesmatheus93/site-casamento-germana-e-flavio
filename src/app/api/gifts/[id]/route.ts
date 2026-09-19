import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import { docToObject } from "@/lib/firestore-utils";
import { requireAdmin } from "@/lib/require-admin";
import type { Gift } from "@/types/gift";

const giftUpdateSchema = z.object({
  nome: z.string().min(2).max(120).optional(),
  valor: z.number().positive().optional(),
  categoria: z.string().min(2).max(60).optional(),
  descricao: z.string().max(2000).optional().nullable(),
  fotoUrl: z.string().max(2000).optional().nullable(),
  linkExterno: z.string().max(2000).optional().nullable(),
  status: z.enum(["DISPONIVEL", "RESERVADO", "COMPRADO"]).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const snap = await db.collection("gifts").doc(id).get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Presente não encontrado." }, { status: 404 });
  }
  return NextResponse.json(docToObject<Gift>(snap));
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = giftUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const ref = db.collection("gifts").doc(id);
  const existing = await ref.get();
  if (!existing.exists) {
    return NextResponse.json({ error: "Presente não encontrado." }, { status: 404 });
  }

  await ref.update({ ...parsed.data, updatedAt: FieldValue.serverTimestamp() });
  const snap = await ref.get();
  return NextResponse.json(docToObject<Gift>(snap));
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const ref = db.collection("gifts").doc(id);
  const existing = await ref.get();
  if (!existing.exists) {
    return NextResponse.json({ error: "Presente não encontrado." }, { status: 404 });
  }

  const paymentsSnap = await db.collection("payments").where("giftId", "==", id).get();
  const batch = db.batch();
  paymentsSnap.docs.forEach((doc) => batch.delete(doc.ref));
  batch.delete(ref);
  await batch.commit();

  return NextResponse.json({ ok: true });
}
