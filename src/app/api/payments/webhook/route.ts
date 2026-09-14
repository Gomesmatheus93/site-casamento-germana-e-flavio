import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMpPaymentClient } from "@/lib/mercadopago";
import type { PaymentStatus } from "@prisma/client";

function mapStatus(mpStatus: string | undefined): PaymentStatus {
  switch (mpStatus) {
    case "approved":
      return "APROVADO";
    case "rejected":
      return "RECUSADO";
    case "cancelled":
      return "CANCELADO";
    default:
      return "PENDENTE";
  }
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const body = await req.json().catch(() => ({}) as Record<string, unknown>);

  const type = url.searchParams.get("type") || (body as { type?: string }).type;
  const dataId =
    url.searchParams.get("data.id") ||
    url.searchParams.get("id") ||
    (body as { data?: { id?: string } }).data?.id;

  if (type !== "payment" || !dataId) {
    return NextResponse.json({ ok: true });
  }

  try {
    const mpPayment = getMpPaymentClient();
    const result = await mpPayment.get({ id: dataId });

    const externalRef = result.external_reference;
    if (!externalRef) return NextResponse.json({ ok: true });

    const paymentRecord = await prisma.payment.findUnique({ where: { id: externalRef } });
    if (!paymentRecord) return NextResponse.json({ ok: true });

    const status = mapStatus(result.status);

    await prisma.payment.update({
      where: { id: paymentRecord.id },
      data: {
        status,
        mpPaymentId: String(result.id),
        mpStatusDetail: result.status_detail || null,
      },
    });

    if (status === "APROVADO") {
      await prisma.gift.update({
        where: { id: paymentRecord.giftId },
        data: { status: "COMPRADO" },
      });
    } else if (status === "RECUSADO" || status === "CANCELADO") {
      const gift = await prisma.gift.findUnique({ where: { id: paymentRecord.giftId } });
      if (gift?.status === "RESERVADO") {
        await prisma.gift.update({
          where: { id: paymentRecord.giftId },
          data: { status: "DISPONIVEL" },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro ao processar webhook do Mercado Pago", err);
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
