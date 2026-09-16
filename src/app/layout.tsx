import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Sacramento, Beau_Rivage } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const sacramento = Sacramento({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400"],
});

const beauRivage = Beau_Rivage({
  variable: "--font-monogram",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Germana & Flávio | 01.11.2026",
  description:
    "Casamento de Germana & Flávio — 01 de novembro de 2026, às 16h, na Igreja Sagrado Coração de Jesus, Mossoró - RN. Lista de presentes, fotos, hospedagem e informações do evento.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${cormorant.variable} ${inter.variable} ${sacramento.variable} ${beauRivage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
