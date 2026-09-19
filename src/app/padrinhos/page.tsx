import type { Metadata } from "next";
import PadrinhosSection from "@/components/sections/PadrinhosSection";
import { WEDDING } from "@/lib/wedding-config";

export const metadata: Metadata = {
  title: "Padrinhos | Germana & Flávio",
  description: `Orientações de traje para os padrinhos e madrinhas do casamento de Germana & Flávio — ${WEDDING.dataFormatada}, em Mossoró - RN.`,
};

export default function PadrinhosPage() {
  return <PadrinhosSection />;
}
