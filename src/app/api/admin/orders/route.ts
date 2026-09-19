import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { docToObject } from "@/lib/firestore-utils";
import { requireAdmin } from "@/lib/require-admin";
import type { Payment } from "@/types/payment";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const snap = await db.collection("payments").orderBy("createdAt", "desc").get();
  const payments = snap.docs.map((d) => docToObject<Payment>(d));

  return NextResponse.json(payments);
}
