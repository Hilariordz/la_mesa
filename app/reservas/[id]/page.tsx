"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import Navbar from "@/components/Navbar";
import Link from "next/link";

type Reservation = {
  id: string;
  customer_name: string;
  party_size: number;
  date: string;
  time: string;
  status: string;
  notes: string | null;
};

const STATUS_INFO: Record<string, { label: string; icon: string; color: string; bg: string; desc: string }> = {
  pending:   { label: "Pendiente",  icon: "⏳", color: "text-[var(--yellow)]",      bg: "bg-[var(--yellow-dim)] border-[var(--yellow)]",  desc: "Tu reserva está en revisión." },
  approved:  { label: "Aprobada",   icon: "✅", color: "text-[var(--green)]",       bg: "bg-[var(--green-dim)] border-[var(--green)]",    desc: "¡Tu mesa está confirmada! Te esperamos." },
  rejected:  { label: "Rechazada",  icon: "❌", color: "text-[var(--red)]",         bg: "bg-[var(--red-dim)] border-[var(--red)]",        desc: "No pudimos confirmar tu reserva en esa fecha." },
  cancelled: { label: "Cancelada",  icon: "🚫", color: "text-[var(--text-muted)]",  bg: "bg-[var(--surface2)] border-[var(--border)]",    desc: "Esta reserva fue cancelada." },
};

export default function ReservationStatusPage() {
  const { id } = useParams<{ id: string }>();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReservation = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from("reservations").select("*").eq("id", id).single();
    if (data) setReservation(data as Reservation);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchReservation();
    const supabase = createClient();
    const channel = supabase
      .channel(`reservation-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "reservations", filter: `id=eq.${id}` },
        (payload) => setReservation((prev) => prev ? { ...prev, status: payload.new.status } : prev)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, fetchReservation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-4xl">🔍</p>
        <p className="text-[var(--text-muted)]">Reserva no encontrada</p>
        <Link href="/reservar" className="btn-primary text-sm">Hacer una reserva</Link>
      </div>
    );
  }

  const info = STATUS_INFO[reservation.status] ?? STATUS_INFO.pending;

  return (
    <>
      <Navbar />
      <main className="pt-14 pb-28 max-w-lg mx-auto px-4">
        <div className="mt-8 mb-6 animate-fade-up">
          <p className="text-[11px] text-[var(--text-subtle)] tracking-widest uppercase mb-1 font-mono">
            Reserva #{reservation.id.slice(0, 8).toUpperCase()}
          </p>
          <h1 className="font-display text-2xl font-bold italic text-[var(--text)]">
            {reservation.customer_name}
          </h1>
        </div>

        {/* Estado */}
        <div className={`card p-5 mb-5 border animate-fade-up ${info.bg}`} style={{ animationDelay: "0.05s" }}>
          <div className="flex items-center gap-4">
            <span className="text-3xl">{info.icon}</span>
            <div>
              <p className={`font-semibold text-base ${info.color}`}>{info.label}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{info.desc}</p>
            </div>
          </div>
        </div>

        {/* Detalles */}
        <div className="card p-5 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-medium mb-4">
            Detalles de la reserva
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <InfoBox label="Fecha" value={
              new Date(reservation.date + "T12:00:00").toLocaleDateString("es-MX", {
                weekday: "short", day: "2-digit", month: "long"
              })
            } />
            <InfoBox label="Hora" value={reservation.time} />
            <InfoBox label="Personas" value={`${reservation.party_size} persona${reservation.party_size > 1 ? "s" : ""}`} />
            <InfoBox label="Estado" value={info.label} />
          </div>
          {reservation.notes && (
            <>
              <div className="divider my-4" />
              <p className="text-xs text-[var(--text-muted)] italic">📝 {reservation.notes}</p>
            </>
          )}
        </div>

        <Link href="/reservar" className="block text-center text-xs text-[var(--text-subtle)] mt-6 hover:text-[var(--accent-light)] transition-colors">
          ← Hacer otra reserva
        </Link>
      </main>
    </>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--surface2)] rounded-2xl p-3">
      <p className="text-[10px] text-[var(--text-subtle)] uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-semibold text-[var(--text)]">{value}</p>
    </div>
  );
}
