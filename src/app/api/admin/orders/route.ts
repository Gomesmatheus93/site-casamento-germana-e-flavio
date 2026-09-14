import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: { gift: { select: { nome: true } } },
  });

  return NextResponse.json(payments);
}
