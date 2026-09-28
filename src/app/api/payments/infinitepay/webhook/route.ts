import { NextRequest, NextResponse } from "next/server";
import { syncInfinitePayPayment } from "@/lib/infinitepay";

// Notificação de pagamento do InfinitePay. O corpo não é assinado, então não
// confiamos nele: syncInfinitePayPayment confirma o pagamento na API do
// InfinitePay antes de atualizar o pedido. Responder 400 faz o InfinitePay
// tentar de novo.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    order_nsu?: string;
    transaction_nsu?: string;
    invoice_slug?: string;
  } | null;

  if (!body?.order_nsu || !body.transaction_nsu || !body.invoice_slug) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    await syncInfinitePayPayment({
      orderNsu: body.order_nsu,
      transactionNsu: body.transaction_nsu,
      slug: body.invoice_slug,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro ao processar webhook do InfinitePay", err);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
