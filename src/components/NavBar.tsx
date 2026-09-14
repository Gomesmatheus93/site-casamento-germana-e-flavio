"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { WEDDING } from "@/lib/wedding-config";

type NavLink =
  | { kind: "route"; href: string; label: string }
  | { kind: "anchor"; id: string; href: string; label: string };

const LINKS: NavLink[] = [
  { kind: "route", href: "/", label: "Início" },
  { kind: "route", href: "/convite", label: "Convite" },
  { kind: "anchor", id: "presentes", href: "/#presentes", label: "Presentes" },
  { kind: "anchor", id: "fotos", href: "/#fotos", label: "Fotos" },
  { kind: "anchor", id: "hospedagem", href: "/#hospedagem", label: "Hospedagem" },
  { kind: "anchor", id: "local", href: "/#local", label: "Local" },
];

const SECTION_IDS = ["presentes", "fotos", "hospedagem", "local"];

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    if (!isHome) return;
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  useEffect(() => {
    if (!isHome) return;
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) {
          setActiveId(visible[0].target.id);
          return;
        }

        // Nenhuma seção está na faixa observada: se ainda estamos acima da
        // primeira ("presentes"), voltamos para "Início" em vez de manter
        // o último item ativo (senão fica preso em "Presentes" ao rolar
        // de volta para o topo).
        const first = sections[0];
        if (first && first.getBoundingClientRect().top > 0) {
          setActiveId(null);
        }
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isHome]);

  function isActive(link: NavLink) {
    if (link.kind === "route") {
      if (link.href === "/") return pathname === "/" && activeId === null;
      return pathname === link.href;
    }
    return isHome && activeId === link.id;
  }

  const transparent = isHome && !scrolled && !open;

  return (
    <header
      className={`z-40 w-full transition-colors duration-500 ${
        isHome ? "fixed top-0" : "sticky top-0"
      } ${
        transparent
          ? "border-b border-transparent bg-transparent"
          : "border-b border-[var(--color-border)] bg-[var(--background)]/95 backdrop-blur"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:py-6">
        <Link
          href="/"
          className={`font-serif-display text-2xl italic transition-colors duration-500 ${
            transparent ? "text-white" : "text-[var(--foreground)]"
          }`}
          onClick={() => setOpen(false)}
        >
          {WEDDING.noivos.ela[0]}
          <span className="mx-1 not-italic text-[var(--color-primary)]">|</span>
          {WEDDING.noivos.ele[0]}
        </Link>

        <button
          type="button"
          className={`transition-colors duration-500 md:hidden ${
            transparent ? "text-white" : "text-[var(--foreground)]"
          }`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <ul className="hidden items-center gap-9 md:flex">
          {LINKS.map((link) => {
            const active = isActive(link);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`border-b pb-0.5 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors duration-500 ${
                    active
                      ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                      : transparent
                        ? "border-transparent text-white/80 hover:border-white/50 hover:text-white"
                        : "border-transparent text-[var(--foreground)]/70 hover:border-[var(--foreground)]/40 hover:text-[var(--foreground)]"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {open && (
        <ul className="flex flex-col gap-1 border-t border-[var(--color-border)] bg-[var(--background)] px-5 py-4 md:hidden">
          {LINKS.map((link) => {
            const active = isActive(link);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block py-2 text-xs font-medium uppercase tracking-[0.18em] ${
                    active ? "text-[var(--color-primary)]" : "text-[var(--foreground)]/70"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </header>
  );
}
