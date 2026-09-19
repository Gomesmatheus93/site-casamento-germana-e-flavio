"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { clientAuth } from "@/lib/firebase-client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const credential = await signInWithEmailAndPassword(clientAuth, email, password);
      const idToken = await credential.user.getIdToken();

      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Não foi possível entrar.");
        return;
      }
      router.push(searchParams.get("next") || "/admin");
      router.refresh();
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        setError("Email ou senha inválidos.");
      } else {
        setError("Erro de conexão.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border border-[var(--color-border)] p-9"
      >
        <div className="mb-8 text-center">
          <p className="eyebrow">Germana &amp; Flávio</p>
          <h1 className="mt-2 font-serif-display text-3xl italic text-[var(--foreground)]">
            Área administrativa
          </h1>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-muted)]">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full border-0 border-b border-[var(--color-border)] bg-transparent px-0 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-muted)]">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full border-0 border-b border-[var(--color-border)] bg-transparent px-0 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-solid mt-2">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Entrar
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
