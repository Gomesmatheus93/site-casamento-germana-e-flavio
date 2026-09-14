import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getMpPaymentClient } from "@/lib/mercadopago";
import type { PaymentMethod, PaymentStatus } from "@prisma/client";

const bodySchema = z.object({
  giftId: z.string().min(1),
  guestName: z.string().min(2).max(120),
  guestMessage: z.string().max(500).optional().nullable(),
  formData: z.object({
    payment_method_id: z.string(),
    token: z.string().optional(),
    issuer_id: z.union([z.string(), z.number()]).optional(),
    installments: z.number().optional(),
    payer: z
      .object({
        email: z.string().optional(),
        identification: z
          .object({ type: z.string().optional(), number: z.string().optional() })
          .optional(),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
      })
      .passthrough()
      .optional(),
  }).passthrough(),
});

function publicNotificationUrl(siteUrl: string | undefined) {
  if (!siteUrl) return undefined;
  try {
    const { hostname, protocol } = new URL(siteUrl);
    const isLocal =
      hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".local");
    // O Mercado Pago rejeita notification_url que não seja um host público
    // em HTTPS (ele precisa alcançar essa URL para enviar as notificações).
    if (isLocal || protocol !== "https:") return undefined;
    return `${siteUrl}/api/payments/webhook`;
  } catch {
    return undefined;
  }
}

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
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados de pagamento inválidos.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { giftId, guestName, guestMessage, formData } = parsed.data;

  const gift = await prisma.gift.findUnique({ where: { id: giftId } });
  if (!gift) {
    return NextResponse.json({ error: "Presente não encontrado." }, { status: 404 });
  }
  if (gift.status === "COMPRADO") {
    return NextResponse.json(
      { error: "Este presente já foi comprado por outra pessoa." },
      { status: 409 }
    );
  }

  const isPix = formData.payment_method_id === "pix";
  const method: PaymentMethod = isPix ? "PIX" : "CARTAO";

  const paymentRecord = await prisma.payment.create({
    data: {
      giftId: gift.id,
      guestName,
      guestMessage: guestMessage || null,
      method,
      status: "PENDENTE",
      amount: gift.valor,
    },
  });

  try {
    const mpPayment = getMpPaymentClient();
    const notificationUrl = publicNotificationUrl(process.env.NEXT_PUBLIC_SITE_URL);

    const result = await mpPayment.create({
      body: {
        transaction_amount: gift.valor,
        description: `Presente de casamento: ${gift.nome}`,
        payment_method_id: formData.payment_method_id,
        token: formData.token,
        issuer_id: formData.issuer_id ? Number(formData.issuer_id) : undefined,
        installments: formData.installments ?? 1,
        payer: {
          email: formData.payer?.email || "convidado@example.com",
          first_name: formData.payer?.first_name,
          last_name: formData.payer?.last_name,
          identification: formData.payer?.identification,
        },
        external_reference: paymentRecord.id,
        notification_url: notificationUrl,
        metadata: { giftId: gift.id, paymentRecordId: paymentRecord.id },
      },
    });

    const status = mapStatus(result.status);

    const updated = await prisma.payment.update({
      where: { id: paymentRecord.id },
      data: {
        status,
        mpPaymentId: result.id ? String(result.id) : null,
        mpStatusDetail: result.status_detail || null,
      },
    });

    if (status === "APROVADO") {
      await prisma.gift.update({ where: { id: gift.id }, data: { status: "COMPRADO" } });
    } else if (status === "PENDENTE") {
      await prisma.gift.update({ where: { id: gift.id }, data: { status: "RESERVADO" } });
    }

    const poi = result.point_of_interaction?.transaction_data;

    return NextResponse.json({
      paymentId: updated.id,
      mpPaymentId: updated.mpPaymentId,
      status: updated.status,
      statusDetail: updated.mpStatusDetail,
      pix: isPix && poi
        ? {
            qrCodeBase64: poi.qr_code_base64,
            qrCode: poi.qr_code,
            ticketUrl: poi.ticket_url,
          }
        : null,
    });
  } catch (err) {
    await prisma.payment.update({
      where: { id: paymentRecord.id },
      data: { status: "RECUSADO", mpStatusDetail: err instanceof Error ? err.message : "erro" },
    });
    const message = err instanceof Error ? err.message : "Erro ao processar pagamento.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
