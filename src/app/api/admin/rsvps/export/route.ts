import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { db } from "@/lib/firebase-admin";
import { docToObject } from "@/lib/firestore-utils";
import { requireAdmin } from "@/lib/require-admin";
import type { Rsvp } from "@/types/rsvp";

function csvField(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatPhone(digits: string) {
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return digits;
}

export async function GET(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const format = req.nextUrl.searchParams.get("format") === "xlsx" ? "xlsx" : "csv";

  const snap = await db.collection("rsvps").orderBy("updatedAt", "desc").get();
  const rsvps = snap.docs.map((d) => docToObject<Rsvp>(d));

  const header = ["Nome", "Telefone", "Resposta", "Pessoas", "Acompanhantes", "Atualizado em"];
  const rows = rsvps.map((r) => [
    r.name,
    formatPhone(r.phone),
    r.attending ? "Vai" : "Não vai",
    r.attending ? String(r.guestCount) : "-",
    r.companionNames ?? "",
    new Date(r.updatedAt).toLocaleString("pt-BR", { timeZone: "America/Fortaleza", dateStyle: "short", timeStyle: "short" }),
  ]);

  if (format === "xlsx") {
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Convidados");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="convidados.xlsx"`,
      },
    });
  }

  const csv = [header, ...rows].map((row) => row.map(csvField).join(";")).join("\r\n");

  // BOM garante que o Excel no Windows reconheça UTF-8 e exiba acentos corretamente.
  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="convidados.csv"`,
    },
  });
}
