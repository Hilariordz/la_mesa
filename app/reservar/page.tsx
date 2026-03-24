"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import toast from "react-hot-toast";
import Link from "next/link";

type Status = "idle" | "loading" | "done";

export default function ReservarPage() {
  const [form, setForm] = useState({
    customer_name: "", customer_phone: "",
    party_size: "2", date: "", time: "", notes: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [reservationId, setReservationId] = useState<string | null>(null);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name || !form.date || !form.time)
      return toast.error("Completa los campos requeridos");
    setStatus("loading");
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, party_size: Number(form.party_size) }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message);
      setReservationId(data.reservationId);
      setStatus("done");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al reservar");
      setStatus("idle");
    }
  };

  /* ── Confirmación ── */
  if (status === "done") {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center px-6 pt-14">
          <div className="max-w-sm w-full text-center animate-fade-up">
            {/* Ícono */}
            <div className="w-20 h-20 rounded-full border border-[var(--accent)] bg-[var(--accent-dim)] flex items-center justify-center text-4xl mx-auto mb-8">
              🎉
            </div>
            <p className="text-[11px] text-[var(--accent-light)] tracking-[0.2em] uppercase font-medium mb-2">
              Solicitud enviada
            </p>
            <h1 className="font-display text-3xl font-bold italic text-[var(--text)] mb-4">
              ¡Reserva recibida!
            </h1>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-2">
              Tu reserva está{" "}
              <span className="text-[var(--yellow)] font-semibold">pendiente de aprobación</span>.
              Te confirmaremos pronto.
            </p>
            <p className="text-xs text-[var(--text-subtle)] font-mono mb-10">
              #{reservationId?.slice(0, 8).toUpperCase()}
            </p>
            <Link href={`/reservas/${reservationId}`} className="btn-primary text-sm w-full">
              Ver estado de reserva
            </Link>
            <Link href="/" className="block text-xs text-[var(--text-subtle)] mt-4 hover:text-[var(--text-muted)] transition-colors">
              Volver al inicio
            </Link>
          </div>
        </main>
      </>
    );
  }

  /* ── Formulario ── */
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-14 grid md:grid-cols-[1fr_1.2fr]">

        {/* Panel izquierdo — imagen + info */}
        <div className="hidden md:flex relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=1200&q=90"
            alt="mesa"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-black/70" />
          <div className="relative z-10 flex flex-col justify-between p-12 w-full">
            <div>
              <p className="text-[11px] text-[var(--accent-light)] tracking-[0.2em] uppercase font-medium mb-3">
                Reservaciones
              </p>
              <h2 className="font-display text-4xl font-bold italic text-white leading-tight">
                Reserva tu<br />mesa ideal
              </h2>
            </div>

            {/* Info del restaurante */}
            <div className="flex flex-col gap-5">
              {[
                { icon: "🕐", label: "Horario", value: "Lun–Dom · 1pm – 11pm" },
                { icon: "📍", label: "Ubicación", value: "Centro Histórico, Ciudad" },
                { icon: "📞", label: "Teléfono", value: "+52 55 0000 0000" },
              ].map((info) => (
                <div key={info.label} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg flex-shrink-0">
                    {info.icon}
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">{info.label}</p>
                    <p className="text-sm text-white/80 font-medium">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel derecho — formulario */}
        <div className="flex flex-col justify-center px-6 md:px-14 py-10 bg-[var(--bg)]">
          <div className="max-w-md w-full mx-auto">
            <p className="text-[11px] text-[var(--accent-light)] tracking-[0.2em] uppercase font-medium mb-2">
              Nueva reserva
            </p>
            <h1 className="font-display text-3xl font-bold italic text-[var(--text)] mb-1">
              Reservar Mesa
            </h1>
            <p className="text-sm text-[var(--text-muted)] mb-8">
              Confirmaremos tu reserva en menos de 24 horas.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Nombre y teléfono */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nombre completo *">
                  <input type="text" value={form.customer_name}
                    onChange={(e) => set("customer_name", e.target.value)}
                    placeholder="Tu nombre" required className="input" />
                </Field>
                <Field label="Teléfono">
                  <input type="tel" value={form.customer_phone}
                    onChange={(e) => set("customer_phone", e.target.value)}
                    placeholder="+52 000 000 0000" className="input" />
                </Field>
              </div>

              {/* Fecha, hora y personas */}
              <div className="grid grid-cols-3 gap-3">
                <Field label="Fecha *">
                  <input type="date" value={form.date}
                    onChange={(e) => set("date", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required className="input" />
                </Field>
                <Field label="Hora *">
                  <input type="time" value={form.time}
                    onChange={(e) => set("time", e.target.value)}
                    required className="input" />
                </Field>
                <Field label="Personas *">
                  <select value={form.party_size}
                    onChange={(e) => set("party_size", e.target.value)}
                    className="input">
                    {[1,2,3,4,5,6,7,8].map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? "pers." : "pers."}</option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Notas */}
              <Field label="Notas especiales">
                <textarea value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Alergias, ocasión especial, preferencias de mesa..."
                  rows={3} className="input resize-none" />
              </Field>

              <button type="submit" disabled={status === "loading"} className="btn-primary w-full mt-1">
                {status === "loading" ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : "Solicitar reserva"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-[var(--text-muted)] font-medium tracking-wide">{label}</label>
      {children}
    </div>
  );
}
