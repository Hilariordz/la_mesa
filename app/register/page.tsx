"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message);
      toast.success("Cuenta creada. Ahora inicia sesión.");
      router.push("/login");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid md:grid-cols-2">
      {/* Panel izquierdo — imagen */}
      <div className="hidden md:block relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=90"
          alt="restaurante"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/45 to-black/65" />
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <Link href="/" className="font-display text-2xl font-bold italic text-white">
            La Mesa
          </Link>
          <div>
            <div className="w-8 h-px bg-[var(--accent)] mb-4" />
            <p className="font-display text-3xl font-bold italic text-white leading-tight mb-3">
              Únete a nuestra<br />comunidad
            </p>
            <p className="text-white/50 text-sm">
              Reserva mesas · Sigue tus pedidos · Vive la experiencia
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
            Crear cuenta
          </p>
          <h1 className="font-display text-3xl font-bold italic text-[var(--text)] mb-1">
            Regístrate
          </h1>
          <p className="text-sm text-[var(--text-muted)] mb-10">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-[var(--accent-light)] hover:underline">
              Inicia sesión
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-[var(--text-muted)] font-medium tracking-wide">
                Nombre completo
              </label>
              <input
                type="text"
                placeholder="Tu nombre"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                className="input"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-[var(--text-muted)] font-medium tracking-wide">
                Correo electrónico
              </label>
              <input
                type="email"
                placeholder="tu@correo.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
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
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                minLength={6}
                className="input"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Crear cuenta"
              )}
            </button>
          </form>

          <p className="text-[11px] text-[var(--text-subtle)] text-center mt-8 leading-relaxed">
            Al registrarte aceptas nuestros términos de uso y política de privacidad.
          </p>
        </div>
      </div>
    </main>
  );
}
