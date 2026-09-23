import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import { docToObject } from "@/lib/firestore-utils";
import { getMpPaymentClient } from "@/lib/mercadopago";
import type { Payment, PaymentStatus } from "@/types/payment";

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
  const paymentRef = db.collection("payments").doc(id);
  let snap = await paymentRef.get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Pagamento não encontrado." }, { status: 404 });
  }
  let payment = docToObject<Payment>(snap);

  // Em ambientes sem webhook público (ex.: desenvolvimento local), consulta o
  // Mercado Pago diretamente enquanto o pagamento seguir pendente, para que
  // o convidado veja a confirmação mesmo sem a notificação automática.
  if (payment.status === "PENDENTE" && payment.mpPaymentId) {
    try {
      const mpPayment = getMpPaymentClient();
      const result = await mpPayment.get({ id: payment.mpPaymentId });
      const status = mapStatus(result.status);

      if (status !== payment.status) {
        // O presente permanece disponível mesmo após a compra, para que
        // outras pessoas também possam presenteá-lo.
        await paymentRef.update({
          status,
          mpStatusDetail: result.status_detail || null,
          updatedAt: FieldValue.serverTimestamp(),
        });

        snap = await paymentRef.get();
        payment = docToObject<Payment>(snap);
      }
    } catch {
      // Se a consulta falhar, seguimos com o status já salvo no banco.
    }
  }

  return NextResponse.json({ status: payment.status, method: payment.method });
}
