import { MercadoPagoConfig, Payment } from "mercadopago";
import type { PaymentStatus } from "@/types/payment";

let client: MercadoPagoConfig | null = null;

export function getMpClient() {
  if (!client) {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error("MP_ACCESS_TOKEN não configurado no .env");
    }
    client = new MercadoPagoConfig({ accessToken });
  }
  return client;
}

export function getMpPaymentClient() {
  return new Payment(getMpClient());
}

export function mapMpStatus(mpStatus: string | undefined): PaymentStatus {
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
