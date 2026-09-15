import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: "Pendente",
  APROVADO: "Aprovado",
  RECUSADO: "Recusado",
  CANCELADO: "Cancelado",
};

const METHOD_LABEL: Record<string, string> = {
  PIX: "Pix",
  CARTAO: "Cartão",
  EXTERNO: "Externo",
};

function csvField(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: { gift: { select: { nome: true } } },
  });

  const header = ["Convidado", "Mensagem", "Presente", "Método", "Valor", "Status", "Data"];
  const rows = payments.map((p) => [
    p.guestName,
    p.guestMessage ?? "",
    p.gift.nome,
    METHOD_LABEL[p.method] ?? p.method,
    p.amount.toFixed(2).replace(".", ","),
    STATUS_LABEL[p.status] ?? p.status,
    p.createdAt.toLocaleDateString("pt-BR"),
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map(csvField).join(";"))
    .join("\r\n");

  // BOM garante que o Excel no Windows reconheça UTF-8 e exiba acentos corretamente.
  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="convidados.csv"`,
    },
  });
}
