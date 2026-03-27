"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { usePushSubscription } from "@/lib/use-push";

type Reservation = {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  party_size: number;
  date: string;
  time: string;
  status: string;
  notes: string | null;
  created_at: string;
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pendiente",  color: "text-[var(--yellow)]",     bg: "bg-[var(--yellow-dim)] border-[var(--yellow)]" },
  approved:  { label: "Aprobada",   color: "text-[var(--green)]",      bg: "bg-[var(--green-dim)] border-[var(--green)]" },
  rejected:  { label: "Rechazada",  color: "text-[var(--red)]",        bg: "bg-[var(--red-dim)] border-[var(--red)]" },
  cancelled: { label: "Cancelada",  color: "text-[var(--text-muted)]", bg: "bg-[var(--surface2)] border-[var(--border)]" },
};

const FILTERS = [
  { key: "pending",  label: "Pendientes" },
  { key: "approved", label: "Aprobadas" },
  { key: "rejected", label: "Rechazadas" },
  { key: "all",      label: "Todas" },
];

export default function AdminReservations() {
  usePushSubscription(true); // suscribir admin a push
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const knownIdsRef = useRef<Set<string>>(new Set());
  const hasLoadedRef = useRef(false);
  const connectionErrorShownRef = useRef(false);

  const playAlertSound = useCallback(() => {
    try {
      const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.value = 0.02;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
      void ctx.close();
    } catch { /* no-op */ }
  }, []);

  const fetchReservations = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/reservations?status=${encodeURIComponent(filter)}`);
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? "Error al cargar");
      const next = (data.data as Reservation[]) ?? [];
      if (hasLoadedRef.current) {
        const newOnes = next.filter((r) => !knownIdsRef.current.has(r.id));
        if (newOnes.length > 0) {
          toast.success(`${newOnes.length} nueva${newOnes.length > 1 ? "s" : ""} reserva${newOnes.length > 1 ? "s" : ""}`);
          playAlertSound();
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        }
      }
      knownIdsRef.current = new Set(next.map((r) => r.id));
      hasLoadedRef.current = true;
      connectionErrorShownRef.current = false;
      setReservations(next);
    } catch (err: unknown) {
      if (!connectionErrorShownRef.current) {
        toast.error(err instanceof Error ? err.message : "Error al cargar reservas");
        connectionErrorShownRef.current = true;
      }
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, [filter, playAlertSound]);

  useEffect(() => {
    setLoading(true);
    fetchReservations();
    const interval = setInterval(fetchReservations, 10000);
    return () => clearInterval(interval);
  }, [fetchReservations]);

  const updateStatus = async (id: string, status: string) => {
    // Actualización optimista — quitar de la lista si el filtro activo no la incluye
    setReservations((prev) =>
      filter === "all"
        ? prev.map((r) => r.id === id ? { ...r, status } : r)
        : prev.filter((r) => r.id !== id)
    );

    const res = await fetch("/api/admin/reservations/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const data = await res.json();
    if (data.ok) {
      toast.success(status === "approved" ? "Reserva aprobada" : "Reserva rechazada");
    } else {
      toast.error(data.message);
      // Revertir si falló
      fetchReservations();
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-lg font-bold italic text-[var(--text)]">Reservas</h2>
          <p className="text-xs text-[var(--text-muted)]">{reservations.length} {reservations.length === 1 ? "reserva" : "reservas"}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              filter === f.key
                ? "bg-[var(--accent)] text-white shadow-[0_4px_12px_rgba(200,146,42,0.3)]"
                : "bg-[var(--surface2)] text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      )}

      {!loading && reservations.length === 0 && (
        <div className="text-center py-16">
          <p className="text-3xl mb-3">🪑</p>
          <p className="text-[var(--text-muted)] text-sm">No hay reservas {filter !== "all" ? `${FILTERS.find(f => f.key === filter)?.label.toLowerCase()}` : ""}</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {reservations.map((r) => {
          const s = STATUS_MAP[r.status] ?? STATUS_MAP.pending;
          const dateStr = new Date(r.date + "T12:00:00").toLocaleDateString("es-MX", {
            weekday: "short", day: "2-digit", month: "short",
          });

          return (
            <div key={r.id} className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-4">
              {/* Top row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[var(--text)]">{r.customer_name}</p>
                  {r.customer_phone && (
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{r.customer_phone}</p>
                  )}
                </div>
                <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-semibold uppercase tracking-wide flex-shrink-0 ${s.bg} ${s.color}`}>
                  {s.label}
                </span>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <InfoBox label="Fecha" value={dateStr} />
                <InfoBox label="Hora" value={r.time} />
                <InfoBox label="Personas" value={`${r.party_size}`} />
              </div>

              {r.notes && (
                <p className="text-xs text-[var(--text-subtle)] italic mb-3 px-1">📝 {r.notes}</p>
              )}

              {/* Actions */}
              {r.status === "pending" && (
                <div className="flex gap-2 pt-3 border-t border-[var(--border)]">
                  <button
                    onClick={() => updateStatus(r.id, "approved")}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-[var(--green-dim)] text-[var(--green)] border border-[var(--green)] hover:bg-[var(--green)] hover:text-white transition-all"
                  >
                    ✓ Aprobar
                  </button>
                  <button
                    onClick={() => updateStatus(r.id, "rejected")}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-[var(--red-dim)] text-[var(--red)] border border-[var(--red)] hover:bg-[var(--red)] hover:text-white transition-all"
                  >
                    ✕ Rechazar
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--surface2)] rounded-xl p-2.5 text-center">
      <p className="text-[9px] text-[var(--text-subtle)] uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-xs font-semibold text-[var(--text)]">{value}</p>
    </div>
  );
}
