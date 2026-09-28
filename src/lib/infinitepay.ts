import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import type { PaymentStatus } from "@/types/payment";

// Checkout do InfinitePay (https://www.infinitepay.io/checkout-documentacao).
// A API não usa token: identifica a conta pela InfiniteTag (handle).
// As notificações não são assinadas, então todo pagamento é confirmado
// com checkInfinitePayPayment antes de ser marcado como pago.

const API_URL = "https://api.checkout.infinitepay.io";

function getHandle() {
  const handle = process.env.INFINITEPAY_HANDLE?.trim().replace(/^\$/, "");
  if (!handle) {
    throw new Error("INFINITEPAY_HANDLE não configurado no .env");
  }
  return handle;
}

export async function createInfinitePayLink(input: {
  orderNsu: string;
  description: string;
  amount: number;
  customerName?: string;
  redirectUrl: string;
  webhookUrl?: string;
}): Promise<string> {
  const res = await fetch(`${API_URL}/links`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      handle: getHandle(),
      order_nsu: input.orderNsu,
      redirect_url: input.redirectUrl,
      webhook_url: input.webhookUrl,
      customer: input.customerName ? { name: input.customerName } : undefined,
      items: [
        {
          quantity: 1,
          // A API trabalha em centavos.
          price: Math.round(input.amount * 100),
          description: input.description,
        },
      ],
    }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.url) {
    const detail = data?.message || data?.error || `HTTP ${res.status}`;
    throw new Error(`InfinitePay não gerou o link de pagamento (${detail}).`);
  }
  return data.url as string;
}

export type InfinitePayCheck = {
  paid: boolean;
  amount?: number;
  paidAmount?: number;
  installments?: number;
  captureMethod?: string;
};

export async function checkInfinitePayPayment(input: {
  orderNsu: string;
  transactionNsu: string;
  slug: string;
}): Promise<InfinitePayCheck> {
  const res = await fetch(`${API_URL}/payment_check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      handle: getHandle(),
      order_nsu: input.orderNsu,
      transaction_nsu: input.transactionNsu,
      slug: input.slug,
    }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success) {
    throw new Error(`Falha ao consultar pagamento no InfinitePay (HTTP ${res.status}).`);
  }
  return {
    paid: data.paid === true,
    amount: data.amount,
    paidAmount: data.paid_amount,
    installments: data.installments,
    captureMethod: data.capture_method,
  };
}

// Confirma um pagamento no InfinitePay e atualiza o pedido no Firestore.
// Usado pela página de retorno e pelo webhook. order_nsu é o id do pedido.
export async function syncInfinitePayPayment(input: {
  orderNsu: string;
  transactionNsu: string;
  slug: string;
}): Promise<PaymentStatus | null> {
  const ref = db.collection("payments").doc(input.orderNsu);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const record = snap.data() as { status: PaymentStatus; amount: number };
  if (record.status === "APROVADO") return "APROVADO";

  const check = await checkInfinitePayPayment(input);
  // Só aprova se o valor pago corresponde ao do presente.
  const amountMatches = check.amount === Math.round(record.amount * 100);
  const status: PaymentStatus = check.paid && amountMatches ? "APROVADO" : "PENDENTE";

  await ref.update({
    status,
    mpPaymentId: input.transactionNsu,
    mpStatusDetail: check.paid
      ? `infinitepay:${check.captureMethod ?? "pago"}:${check.installments ?? 1}x`
      : "infinitepay:aguardando",
    updatedAt: FieldValue.serverTimestamp(),
  });
  return status;
}
