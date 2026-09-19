export type PaymentMethod = "PIX" | "CARTAO" | "EXTERNO";
export type PaymentStatus = "PENDENTE" | "APROVADO" | "RECUSADO" | "CANCELADO";

export type Payment = {
  id: string;
  giftId: string;
  giftNome: string;
  guestName: string;
  guestMessage: string | null;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  mpPaymentId: string | null;
  mpStatusDetail: string | null;
  createdAt: string;
  updatedAt: string;
};
