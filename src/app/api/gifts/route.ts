import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

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
  const gifts = await prisma.gift.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
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

  const gift = await prisma.gift.create({
    data: {
      ...parsed.data,
      descricao: parsed.data.descricao || null,
      fotoUrl: parsed.data.fotoUrl || null,
      linkExterno: parsed.data.linkExterno || null,
    },
  });

  return NextResponse.json(gift, { status: 201 });
}
