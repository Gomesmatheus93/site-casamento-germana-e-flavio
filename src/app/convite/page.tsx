import type { Metadata } from "next";
import InviteOpening from "@/components/InviteOpening";

export const metadata: Metadata = {
  title: "Convite | Germana & Flávio",
  description:
    "Convite de casamento de Germana & Flávio — 01 de novembro de 2026, às 16h, na Igreja Sagrado Coração de Jesus, Mossoró - RN.",
};

export default function ConvitePage() {
  return <InviteOpening />;
}
