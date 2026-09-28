import type { Metadata } from "next";
import Link from "next/link";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import { getMpPaymentClient, mapMpStatus } from "@/lib/mercadopago";
import { syncInfinitePayPayment } from "@/lib/infinitepay";
import type { PaymentStatus } from "@/types/payment";

export const metadata: Metadata = {
  title: "Pagamento | Germana & Flávio",
  robots: { index: false },
};

// Página de retorno dos checkouts externos (InfinitePay e Checkout Pro do
// Mercado Pago). Confirmamos o status direto na API do provedor em vez de
// confiar nos parâmetros da URL.
async function syncPayment(
  mpPaymentId: string | undefined,
  recordId: string | undefined
): Promise<PaymentStatus | null> {
  if (!mpPaymentId || mpPaymentId === "null" || !recordId) return null;
  try {
    const result = await getMpPaymentClient().get({ id: mpPaymentId });
    if (result.external_reference !== recordId) return null;

    const status = mapMpStatus(result.status);
    await db.collection("payments").doc(recordId).update({
      status,
      mpPaymentId: String(result.id),
      mpStatusDetail: result.status_detail || null,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return status;
  } catch {
    return null;
  }
}

const CONTENT: Record<PaymentStatus | "NONE", { eyebrow: string; title: string; text: string }> = {
  APROVADO: {
    eyebrow: "Obrigado",
    title: "Muito obrigado pelo presente!",
    text: "Seu pagamento foi confirmado com sucesso. Os noivos agradecem o carinho.",
  },
  PENDENTE: {
    eyebrow: "Quase lá",
    title: "Pagamento em análise",
    text: "O Mercado Pago está analisando o pagamento. Assim que for aprovado, o presente é confirmado automaticamente — você não precisa fazer nada.",
  },
  RECUSADO: {
    eyebrow: "Ops",
    title: "Pagamento não aprovado",
    text: "O pagamento não foi aprovado. Você pode tentar novamente com outro cartão ou presentear via Pix.",
  },
  CANCELADO: {
    eyebrow: "Ops",
    title: "Pagamento cancelado",
    text: "O pagamento foi cancelado. Você pode tentar novamente quando quiser.",
  },
  NONE: {
    eyebrow: "Ops",
    title: "Pagamento não concluído",
    text: "Não identificamos um pagamento concluído. Você pode tentar novamente ou presentear via Pix.",
  },
};

export default async function PagamentoRetornoPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const get = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  // InfinitePay volta com order_nsu/transaction_nsu/slug; Mercado Pago com
  // payment_id/external_reference.
  const orderNsu = get("order_nsu");
  const transactionNsu = get("transaction_nsu");
  const slug = get("slug");
  const status =
    orderNsu && transactionNsu && slug
      ? await syncInfinitePayPayment({ orderNsu, transactionNsu, slug }).catch(() => null)
      : await syncPayment(get("payment_id") || get("collection_id"), get("external_reference"));
  const content = CONTENT[status ?? "NONE"];

  return (
    <section className="bg-[var(--color-surface)] px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-xl text-center">
        <p className="eyebrow">{content.eyebrow}</p>
        <h1 className="mt-4 font-serif-display text-4xl italic text-[var(--foreground)] sm:text-5xl">
          {content.title}
        </h1>
        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-[var(--foreground)]/70">
          {content.text}
        </p>
        <Link href="/#presentes" className="btn-solid mt-10 inline-flex">
          Voltar para a lista de presentes
        </Link>
      </div>
    </section>
  );
}
