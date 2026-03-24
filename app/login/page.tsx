"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message);
      toast.success("¡Bienvenido!");
      router.push("/menu");
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al ingresar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid md:grid-cols-2">
      {/* Panel izquierdo — imagen */}
      <div className="hidden md:block relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=90"
          alt="restaurante"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/60" />
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <Link href="/" className="font-display text-2xl font-bold italic text-white">
            La Mesa
          </Link>
          <div>
            <div className="w-8 h-px bg-[var(--accent)] mb-4" />
            <p className="font-display text-3xl font-bold italic text-white leading-tight mb-3">
              Una experiencia<br />gastronómica única
            </p>
            <p className="text-white/50 text-sm">
              Ingredientes frescos · Chefs expertos · Ambiente inigualable
            </p>
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex flex-col justify-center px-8 md:px-16 py-12 bg-[var(--bg)]">
        {/* Mobile logo */}
        <Link href="/" className="font-display text-2xl font-bold italic text-[var(--text)] mb-10 md:hidden">
          La Mesa
        </Link>

        <div className="max-w-sm w-full mx-auto">
          <p className="text-[11px] text-[var(--accent-light)] tracking-[0.2em] uppercase font-medium mb-2">
            Bienvenido de vuelta
          </p>
          <h1 className="font-display text-3xl font-bold italic text-[var(--text)] mb-1">
            Inicia sesión
          </h1>
          <p className="text-sm text-[var(--text-muted)] mb-10">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-[var(--accent-light)] hover:underline">
              Regístrate
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-[var(--text-muted)] font-medium tracking-wide">
                Correo electrónico
              </label>
              <input
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-[var(--text-muted)] font-medium tracking-wide">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Ingresar"
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--text-subtle)] text-center">
              ¿Eres administrador?{" "}
              <Link href="/admin" className="text-[var(--text-muted)] hover:text-[var(--accent-light)] transition-colors">
                Acceso admin
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
