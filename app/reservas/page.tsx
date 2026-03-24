"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

type Reservation = {
  id: string;
  customer_name: string;
  party_size: number;
  date: string;
  time: string;
  status: string;
  notes: string | null;
};

const STATUS_MAP: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  pending:   { label: "Pendiente",  icon: "⏳", color: "text-[var(--yellow)]",     bg: "bg-[var(--yellow-dim)]" },
  approved:  { label: "Aprobada",   icon: "✓",  color: "text-[var(--green)]",      bg: "bg-[var(--green-dim)]" },
  rejected:  { label: "Rechazada",  icon: "✕",  color: "text-[var(--red)]",        bg: "bg-[var(--red-dim)]" },
  cancelled: { label: "Cancelada",  icon: "—",  color: "text-[var(--text-muted)]", bg: "bg-[var(--surface2)]" },
};

export default function ReservasPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    fetch("/api/reservations")
      .then((r) => {
        if (r.status === 401) { setUnauthorized(true); return null; }
        return r.json();
      })
      .then((data) => { if (data?.ok) setReservations(data.data); })
      .finally(() => setLoading(false));
  }, []);

  const upcoming = reservations.filter((r) => ["pending", "approved"].includes(r.status));
  const past     = reservations.filter((r) => ["rejected", "cancelled"].includes(r.status));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
      </div>
    );
  }

  if (unauthorized) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center pt-14">
          <p className="text-4xl">🔒</p>
          <p className="text-[var(--text-muted)] text-sm">Inicia sesión para ver tus reservas</p>
          <Link href="/login" className="btn-primary text-sm">Iniciar sesión</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-14 pb-28 max-w-lg mx-auto px-4">

        {/* Header */}
        <div className="mt-8 mb-6 animate-fade-up">
          <p className="text-[11px] text-[var(--text-subtle)] tracking-widest uppercase mb-1 font-mono">
            Mi cuenta
          </p>
          <h1 className="font-display text-2xl font-bold italic text-[var(--text)]">
            Mis Reservas
          </h1>
        </div>

        {reservations.length === 0 ? (
          <div className="card p-12 text-center animate-fade-up">
            <p className="text-4xl mb-4">🪑</p>
            <p className="text-[var(--text-muted)] text-sm mb-6">Aún no tienes reservas</p>
            <Link href="/reservar" className="btn-primary text-sm">Hacer una reserva</Link>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <section className="mb-6 animate-fade-up">
                <p className="text-[10px] text-[var(--text-subtle)] uppercase tracking-widest font-medium mb-3">
                  Próximas · {upcoming.length}
                </p>
                <div className="flex flex-col gap-2">
                  {upcoming.map((r, i) => (
                    <ReservationCard key={r.id} reservation={r} delay={i * 0.04} />
                  ))}
                </div>
              </section>
            )}

            {past.length > 0 && (
              <section className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
                <p className="text-[10px] text-[var(--text-subtle)] uppercase tracking-widest font-medium mb-3">
                  Historial
                </p>
                <div className="flex flex-col gap-2">
                  {past.map((r, i) => (
                    <ReservationCard key={r.id} reservation={r} delay={i * 0.04} muted />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <Link href="/reservar" className="block text-center text-xs text-[var(--text-subtle)] mt-6 hover:text-[var(--accent-light)] transition-colors">
          + Nueva reserva
        </Link>
      </main>
    </>
  );
}

function ReservationCard({ reservation: r, delay = 0, muted = false }: { reservation: Reservation; delay?: number; muted?: boolean }) {
  const s = STATUS_MAP[r.status] ?? STATUS_MAP.pending;
  const dateStr = new Date(r.date + "T12:00:00").toLocaleDateString("es-MX", {
    weekday: "short", day: "2-digit", month: "short",
  });

  return (
    <Link
      href={`/reservas/${r.id}`}
      className={`card p-4 flex items-center gap-4 transition-all animate-fade-up ${muted ? "opacity-60 hover:opacity-100" : "hover:border-[var(--border-hover)]"}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Status icon */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold ${s.bg} ${s.color}`}>
        {s.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[var(--text)] truncate">{r.customer_name}</p>
          <span className={`text-[10px] font-semibold uppercase tracking-wide flex-shrink-0 ${s.color}`}>
            {s.label}
          </span>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          {dateStr} · {r.time} · {r.party_size} {r.party_size === 1 ? "persona" : "personas"}
        </p>
      </div>

      <span className="text-[var(--text-subtle)] text-sm flex-shrink-0">›</span>
    </Link>
  );
}
