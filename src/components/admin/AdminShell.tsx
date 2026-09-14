import Link from "next/link";
import { LayoutDashboard, Gift, Images, ReceiptText, ExternalLink } from "lucide-react";
import AdminLogoutButton from "./AdminLogoutButton";

const LINKS = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/presentes", label: "Presentes", icon: Gift },
  { href: "/admin/pedidos", label: "Pedidos", icon: ReceiptText },
  { href: "/admin/fotos", label: "Fotos dos convidados", icon: Images },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-8 md:flex-row">
      <aside className="shrink-0 md:w-56">
        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
          <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm text-[var(--foreground)]/80 hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary-dark)]"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 border-t border-[var(--color-border)] pt-3">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--foreground)]/70 hover:bg-black/5"
            >
              <ExternalLink className="h-4 w-4" />
              Ver site
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </aside>

      <div className="flex-1">{children}</div>
    </div>
  );
}
