"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-client";
import toast from "react-hot-toast";

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

const STATUS_STYLE: Record<string, string> = {
  pending:   "bg-yellow-500/20 text-yellow-400",
  approved:  "bg-green-500/20 text-green-400",
  rejected:  "bg-red-500/20 text-red-400",
  cancelled: "bg-[var(--surface2)] text-[var(--text-muted)]",
};

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  const fetchReservations = useCallback(async () => {
    const supabase = createClient();
    const query = supabase
      .from("reservations")
      .select("*")
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (filter !== "all") query.eq("status", filter);

    const { data } = await query;
    setReservations((data as Reservation[]) ?? []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchReservations();
    const supabase = createClient();
    const channel = supabase
      .channel("admin-reservations")
      .on("postgres_changes", { event: "*", schema: "public", table: "reservations" }, fetchReservations)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchReservations]);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch("/api/admin/reservations/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const data = await res.json();
    if (data.ok) {
      toast.success(`Reserva ${status === "approved" ? "aprobada" : "rechazada"}`);
      setReservations((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    } else {
      toast.error(data.message);
    }
  };

  const FILTERS = ["pending", "approved", "rejected", "all"];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[var(--text)]">Reservas</h2>
        <div className="flex gap-1 flex-wrap justify-end">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                filter === f ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "border-[var(--border)] text-[var(--text-muted)]"
              }`}
            >
              {f === "all" ? "Todas" : f === "pending" ? "Pendientes" : f === "approved" ? "Aprobadas" : "Rechazadas"}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-[var(--text-muted)] text-sm animate-pulse">Cargando...</p>}
      {!loading && reservations.length === 0 && (
        <p className="text-[var(--text-muted)] text-sm text-center py-12">No hay reservas</p>
      )}

      <div className="flex flex-col gap-3">
        {reservations.map((r) => (
          <div key={r.id} className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)]">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-sm text-[var(--text)]">{r.customer_name}</p>
                {r.customer_phone && <p className="text-xs text-[var(--text-muted)]">{r.customer_phone}</p>}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLE[r.status] ?? ""}`}>
                {r.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <Info label="Fecha" value={new Date(r.date + "T12:00:00").toLocaleDateString("es-MX", { day: "2-digit", month: "short" })} />
              <Info label="Hora" value={r.time} />
              <Info label="Personas" value={String(r.party_size)} />
            </div>

            {r.notes && <p className="text-xs text-[var(--text-subtle)] italic mb-3">"{r.notes}"</p>}

            {r.status === "pending" && (
              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(r.id, "approved")}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                >
                  ✓ Aprobar
                </button>
                <button
                  onClick={() => updateStatus(r.id, "rejected")}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  ✕ Rechazar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--surface2)] rounded-xl p-2 text-center">
      <p className="text-[10px] text-[var(--text-subtle)]">{label}</p>
      <p className="text-xs font-semibold text-[var(--text)]">{value}</p>
    </div>
  );
}
