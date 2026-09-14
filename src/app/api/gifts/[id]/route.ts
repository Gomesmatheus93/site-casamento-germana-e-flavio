import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

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
  const gift = await prisma.gift.findUnique({ where: { id } });
  if (!gift) {
    return NextResponse.json({ error: "Presente não encontrado." }, { status: 404 });
  }
  return NextResponse.json(gift);
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

  try {
    const gift = await prisma.gift.update({ where: { id }, data: parsed.data });
    return NextResponse.json(gift);
  } catch {
    return NextResponse.json({ error: "Presente não encontrado." }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  try {
    await prisma.payment.deleteMany({ where: { giftId: id } });
    await prisma.gift.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Presente não encontrado." }, { status: 404 });
  }
}
