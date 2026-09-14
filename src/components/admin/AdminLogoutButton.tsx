"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function AdminLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--foreground)]/70 hover:bg-black/5"
    >
      <LogOut className="h-4 w-4" />
      Sair
    </button>
  );
}
