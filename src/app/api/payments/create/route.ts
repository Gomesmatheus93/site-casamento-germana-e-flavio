import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import { docToObject } from "@/lib/firestore-utils";
import { getMpPaymentClient } from "@/lib/mercadopago";
import type { Gift } from "@/types/gift";
import type { Payment, PaymentMethod, PaymentStatus } from "@/types/payment";

const bodySchema = z.object({
  giftId: z.string().min(1),
  guestName: z.string().min(2).max(120),
  guestMessage: z.string().max(500).optional().nullable(),
  deviceId: z.string().max(200).optional().nullable(),
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
  const { giftId, guestName, guestMessage, deviceId, formData } = parsed.data;

  const giftSnap = await db.collection("gifts").doc(giftId).get();
  if (!giftSnap.exists) {
    return NextResponse.json({ error: "Presente não encontrado." }, { status: 404 });
  }
  const gift = docToObject<Gift>(giftSnap);

  const isPix = formData.payment_method_id === "pix";
  const method: PaymentMethod = isPix ? "PIX" : "CARTAO";

  const paymentRef = await db.collection("payments").add({
    giftId: gift.id,
    giftNome: gift.nome,
    guestName,
    guestMessage: guestMessage || null,
    method,
    status: "PENDENTE" as PaymentStatus,
    amount: gift.valor,
    mpPaymentId: null,
    mpStatusDetail: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  try {
    const mpPayment = getMpPaymentClient();
    const notificationUrl = publicNotificationUrl(process.env.NEXT_PUBLIC_SITE_URL);

    // Dados extras para o antifraude do Mercado Pago. Sem eles (e sem o
    // device id), pagamentos com cartão são recusados como "high risk".
    const [nameFirst, ...nameRest] = guestName.trim().split(/\s+/);
    const firstName = formData.payer?.first_name || nameFirst;
    const lastName = formData.payer?.last_name || nameRest.join(" ") || undefined;
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      undefined;

    const result = await mpPayment.create({
      requestOptions: deviceId ? { meliSessionId: deviceId } : undefined,
      body: {
        transaction_amount: gift.valor,
        description: `Presente de casamento: ${gift.nome}`,
        payment_method_id: formData.payment_method_id,
        token: formData.token,
        issuer_id: formData.issuer_id ? Number(formData.issuer_id) : undefined,
        installments: formData.installments ?? 1,
        payer: {
          email: formData.payer?.email || "convidado@example.com",
          first_name: firstName,
          last_name: lastName,
          identification: formData.payer?.identification,
        },
        additional_info: {
          ip_address: ipAddress,
          items: [
            {
              id: gift.id,
              title: gift.nome,
              description: `Presente de casamento: ${gift.nome}`,
              category_id: "others",
              quantity: 1,
              unit_price: gift.valor,
            },
          ],
          payer: { first_name: firstName, last_name: lastName },
        },
        external_reference: paymentRef.id,
        notification_url: notificationUrl,
        metadata: { giftId: gift.id, paymentRecordId: paymentRef.id },
      },
    });

    const status = mapStatus(result.status);

    await paymentRef.update({
      status,
      mpPaymentId: result.id ? String(result.id) : null,
      mpStatusDetail: result.status_detail || null,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // O presente permanece disponível mesmo após a compra, para que outras
    // pessoas também possam presenteá-lo.

    const updatedSnap = await paymentRef.get();
    const updated = docToObject<Payment>(updatedSnap);

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
    await paymentRef.update({
      status: "RECUSADO" as PaymentStatus,
      mpStatusDetail: err instanceof Error ? err.message : "erro",
      updatedAt: FieldValue.serverTimestamp(),
    });
    const message = err instanceof Error ? err.message : "Erro ao processar pagamento.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
