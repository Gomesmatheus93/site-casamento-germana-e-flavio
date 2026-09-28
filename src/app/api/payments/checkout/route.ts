import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import { docToObject } from "@/lib/firestore-utils";
import { getMpPreferenceClient } from "@/lib/mercadopago";
import type { Gift } from "@/types/gift";
import type { PaymentStatus } from "@/types/payment";

// Pagamento com cartão via Checkout Pro: o convidado paga na página do
// próprio Mercado Pago e volta para /pagamento/retorno. Lá o Mercado Pago
// cuida de login, 3DS e antifraude, o que aprova mais cartões do que o
// formulário embutido no site.

const bodySchema = z.object({
  giftId: z.string().min(1),
  guestName: z.string().min(2).max(120),
  guestMessage: z.string().max(500).optional().nullable(),
});

// Endereço público do site, a partir do request (funciona atrás de proxy
// e em localhost), com NEXT_PUBLIC_SITE_URL como alternativa.
function siteOrigin(req: NextRequest) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (host) {
    const proto =
      req.headers.get("x-forwarded-proto")?.split(",")[0].trim() ||
      (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
    return `${proto}://${host}`;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
}

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { giftId, guestName, guestMessage } = parsed.data;

  const giftSnap = await db.collection("gifts").doc(giftId).get();
  if (!giftSnap.exists) {
    return NextResponse.json({ error: "Presente não encontrado." }, { status: 404 });
  }
  const gift = docToObject<Gift>(giftSnap);

  const paymentRef = await db.collection("payments").add({
    giftId: gift.id,
    giftNome: gift.nome,
    guestName,
    guestMessage: guestMessage || null,
    method: "CARTAO",
    status: "PENDENTE" as PaymentStatus,
    amount: gift.valor,
    mpPaymentId: null,
    mpStatusDetail: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  try {
    const origin = siteOrigin(req);
    const isHttps = origin.startsWith("https://");
    const returnUrl = `${origin}/pagamento/retorno`;
    const [firstName, ...rest] = guestName.trim().split(/\s+/);

    const preference = await getMpPreferenceClient().create({
      body: {
        items: [
          {
            id: gift.id,
            title: gift.nome,
            description: `Presente de casamento: ${gift.nome}`,
            category_id: "others",
            quantity: 1,
            currency_id: "BRL",
            unit_price: gift.valor,
          },
        ],
        payer: { name: firstName, surname: rest.join(" ") || undefined },
        payment_methods: {
          // Boleto demora dias para compensar; o Pix já existe no próprio site.
          excluded_payment_types: [{ id: "ticket" }],
          installments: 3,
        },
        back_urls: { success: returnUrl, failure: returnUrl, pending: returnUrl },
        // O Mercado Pago só aceita retorno automático para endereços HTTPS.
        auto_return: isHttps ? "approved" : undefined,
        notification_url: isHttps ? `${origin}/api/payments/webhook` : undefined,
        external_reference: paymentRef.id,
        statement_descriptor: "CASAMENTO",
        metadata: { giftId: gift.id, paymentRecordId: paymentRef.id },
      },
    });

    const checkoutUrl = preference.init_point;
    if (!checkoutUrl) throw new Error("O Mercado Pago não retornou o link de pagamento.");

    return NextResponse.json({ paymentId: paymentRef.id, checkoutUrl });
  } catch (err) {
    await paymentRef.update({
      status: "CANCELADO" as PaymentStatus,
      mpStatusDetail: err instanceof Error ? err.message : "erro",
      updatedAt: FieldValue.serverTimestamp(),
    });
    const message = err instanceof Error ? err.message : "Erro ao iniciar o pagamento.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
