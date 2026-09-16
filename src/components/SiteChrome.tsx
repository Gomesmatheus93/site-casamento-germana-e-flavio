"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

// Routes that render as a standalone page, with no site nav/footer around them.
const CHROMELESS_PREFIXES = ["/convite"];

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const chromeless = CHROMELESS_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (chromeless) return <>{children}</>;

  return (
    <>
      <NavBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
