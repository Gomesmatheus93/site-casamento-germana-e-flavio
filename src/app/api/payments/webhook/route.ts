import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import { getMpPaymentClient } from "@/lib/mercadopago";
import type { PaymentStatus } from "@/types/payment";

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

    const status = mapStatus(result.status);

    await db.runTransaction(async (tx) => {
      const paymentRef = db.collection("payments").doc(externalRef);
      const paymentSnap = await tx.get(paymentRef);
      if (!paymentSnap.exists) return;
      const payment = paymentSnap.data()!;

      const giftRef = db.collection("gifts").doc(payment.giftId as string);
      const giftSnap = await tx.get(giftRef);

      tx.update(paymentRef, {
        status,
        mpPaymentId: String(result.id),
        mpStatusDetail: result.status_detail || null,
        updatedAt: FieldValue.serverTimestamp(),
      });

      if (status === "APROVADO") {
        tx.update(giftRef, { status: "COMPRADO", updatedAt: FieldValue.serverTimestamp() });
      } else if (status === "RECUSADO" || status === "CANCELADO") {
        if (giftSnap.exists && giftSnap.data()?.status === "RESERVADO") {
          tx.update(giftRef, { status: "DISPONIVEL", updatedAt: FieldValue.serverTimestamp() });
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro ao processar webhook do Mercado Pago", err);
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
