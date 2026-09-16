import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const rsvpSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(10).max(30),
  attending: z.boolean(),
  guestCount: z.number().int().min(0).max(20),
  companionNames: z.string().trim().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = rsvpSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Confira os dados e tente novamente." }, { status: 400 });
  }

  const { name, attending, guestCount, companionNames } = parsed.data;
  const phone = parsed.data.phone.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");

  if (!/^\d{10,11}$/.test(phone)) {
    return NextResponse.json({ error: "Informe um telefone válido com DDD." }, { status: 400 });
  }

  if ((attending && guestCount < 1) || (!attending && guestCount !== 0)) {
    return NextResponse.json({ error: "Confira a quantidade de pessoas." }, { status: 400 });
  }

  const data = {
    name,
    attending,
    guestCount,
    companionNames: attending ? companionNames || null : null,
  };

  try {
    await prisma.rsvp.upsert({
      where: { phone },
      create: { phone, ...data },
      update: data,
    });
    return NextResponse.json({ message: "Resposta registrada com sucesso." });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível registrar sua resposta. Tente novamente." },
      { status: 500 }
    );
  }
}
