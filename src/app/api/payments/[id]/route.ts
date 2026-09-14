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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) {
    return NextResponse.json({ error: "Pagamento não encontrado." }, { status: 404 });
  }

  // Em ambientes sem webhook público (ex.: desenvolvimento local), consulta o
  // Mercado Pago diretamente enquanto o pagamento seguir pendente, para que
  // o convidado veja a confirmação mesmo sem a notificação automática.
  if (payment.status === "PENDENTE" && payment.mpPaymentId) {
    try {
      const mpPayment = getMpPaymentClient();
      const result = await mpPayment.get({ id: payment.mpPaymentId });
      const status = mapStatus(result.status);

      if (status !== payment.status) {
        payment = await prisma.payment.update({
          where: { id: payment.id },
          data: { status, mpStatusDetail: result.status_detail || null },
        });

        if (status === "APROVADO") {
          await prisma.gift.update({
            where: { id: payment.giftId },
            data: { status: "COMPRADO" },
          });
        } else if (status === "RECUSADO" || status === "CANCELADO") {
          const gift = await prisma.gift.findUnique({ where: { id: payment.giftId } });
          if (gift?.status === "RESERVADO") {
            await prisma.gift.update({
              where: { id: payment.giftId },
              data: { status: "DISPONIVEL" },
            });
          }
        }
      }
    } catch {
      // Se a consulta falhar, seguimos com o status já salvo no banco.
    }
  }

  return NextResponse.json({ status: payment.status, method: payment.method });
}
