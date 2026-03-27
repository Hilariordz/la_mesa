"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { usePushSubscription } from "@/lib/use-push";
import toast from "react-hot-toast";
import { fetchWithOfflineFallback } from "@/lib/offline-data";

type Reservation = {
  id: string;
  customer_name: string;
  party_size: number;
  date: string;
  time: string;
  status: string;
  notes: string | null;
  created_at: string;
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pendiente",  color: "text-[var(--yellow)]",     bg: "bg-[var(--yellow-dim)]" },
  approved:  { label: "Aprobada",   color: "text-[var(--green)]",      bg: "bg-[var(--green-dim)]" },
  rejected:  { label: "Rechazada",  color: "text-[var(--red)]",        bg: "bg-[var(--red-dim)]" },
  cancelled: { label: "Cancelada",  color: "text-[var(--text-muted)]", bg: "bg-[var(--surface2)]" },
};

function canEdit(createdAt: string) {
  return Date.now() - new Date(createdAt).getTime() < 60 * 60 * 1000;
}

function minutesLeft(createdAt: string) {
  const ms = 60 * 60 * 1000 - (Date.now() - new Date(createdAt).getTime());
  return Math.max(0, Math.ceil(ms / 60000));
}

export default function ReservasPage() {
  usePushSubscription(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ date: "", time: "", party_size: "2", notes: "" });
  const [saving, setSaving] = useState(false);

  const load = (forceRefresh = false) => {
    fetchWithOfflineFallback<{ ok: boolean; data: Reservation[] }>(
      "user-reservations",
      () => fetch("/api/reservations").then((r) => {
        if (r.status === 401) { setUnauthorized(true); return { ok: false, data: [] }; }
        return r.json();
      }),
      { cacheTime: 2 * 60 * 1000, forceRefresh }
    ).then(({ data }) => {
      if (data?.ok) setReservations(data.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openModal = (r: Reservation) => {
    setSelected(r);
    setEditing(false);
    setEditForm({ date: r.date, time: r.time, party_size: String(r.party_size), notes: r.notes ?? "" });
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/reservations/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, party_size: Number(editForm.party_size) }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message);
      toast.success("Reserva actualizada");
      setSelected(null);
      load(true);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al guardar");
    } finally { setSaving(false); }
  };

  const handleCancel = async () => {
    if (!selected) return;
    if (!confirm("¿Cancelar esta reserva?")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/reservations/${selected.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message);
      toast.success("Reserva cancelada");
      setSelected(null);
      load(true);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al cancelar");
    } finally { setSaving(false); }
  };

  const upcoming = reservations.filter((r) => ["pending", "approved"].includes(r.status));
  const past     = reservations.filter((r) => ["rejected", "cancelled"].includes(r.status));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
    </div>
  );

  if (unauthorized) return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center pt-14">
        <p className="text-4xl">🔒</p>
        <p className="text-[var(--text-muted)] text-sm">Inicia sesión para ver tus reservas</p>
        <Link href="/login" className="btn-primary text-sm">Iniciar sesión</Link>
      </main>
    </>
  );

  return (
    <>
      <Navbar />
      <main className="pt-14 pb-28 max-w-lg mx-auto px-4">
        <div className="mt-8 mb-6 animate-fade-up">
          <p className="text-[11px] text-[var(--text-subtle)] tracking-widest uppercase mb-1 font-mono">Mi cuenta</p>
          <h1 className="font-display text-2xl font-bold italic text-[var(--text)]">Mis Reservas</h1>
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
                    <ReservationCard key={r.id} reservation={r} delay={i * 0.04} onClick={() => openModal(r)} />
                  ))}
                </div>
              </section>
            )}
            {past.length > 0 && (
              <section className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
                <p className="text-[10px] text-[var(--text-subtle)] uppercase tracking-widest font-medium mb-3">Historial</p>
                <div className="flex flex-col gap-2">
                  {past.map((r, i) => (
                    <ReservationCard key={r.id} reservation={r} delay={i * 0.04} muted onClick={() => openModal(r)} />
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

      {/* ── Modal ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
          onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md rounded-2xl overflow-hidden animate-fade-up"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4"
              style={{ borderBottom: "1px solid var(--border)" }}>
              <div>
                <p className="text-[10px] text-[var(--text-subtle)] uppercase tracking-widest font-mono">
                  #{selected.id.slice(0, 8).toUpperCase()}
                </p>
                <h2 className="font-display text-lg font-bold text-[var(--text)]">{selected.customer_name}</h2>
              </div>
              <button onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                style={{ background: "var(--surface2)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Status badge */}
            <div className="px-6 pt-4">
              {(() => {
                const s = STATUS_MAP[selected.status] ?? STATUS_MAP.pending;
                return (
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${s.bg} ${s.color}`}>
                    {s.label}
                  </span>
                );
              })()}
            </div>

            {/* Contenido */}
            <div className="px-6 py-4">
              {!editing ? (
                <div className="grid grid-cols-2 gap-3">
                  <InfoBox label="Fecha" value={new Date(selected.date + "T12:00:00").toLocaleDateString("es-MX", { weekday: "short", day: "2-digit", month: "long" })} />
                  <InfoBox label="Hora" value={selected.time} />
                  <InfoBox label="Personas" value={`${selected.party_size} persona${selected.party_size > 1 ? "s" : ""}`} />
                  <InfoBox label="Creada" value={new Date(selected.created_at).toLocaleDateString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })} />
                  {selected.notes && (
                    <div className="col-span-2 rounded-xl p-3" style={{ background: "var(--surface2)" }}>
                      <p className="text-[10px] text-[var(--text-subtle)] uppercase tracking-widest mb-1">Notas</p>
                      <p className="text-xs text-[var(--text-muted)]">{selected.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-[var(--text-subtle)] uppercase tracking-widest mb-1 block">Fecha</label>
                      <input type="date" value={editForm.date} onChange={(e) => setEditForm(f => ({ ...f, date: e.target.value }))}
                        min={new Date().toISOString().split("T")[0]} className="input w-full text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] text-[var(--text-subtle)] uppercase tracking-widest mb-1 block">Hora</label>
                      <input type="time" value={editForm.time} onChange={(e) => setEditForm(f => ({ ...f, time: e.target.value }))}
                        className="input w-full text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--text-subtle)] uppercase tracking-widest mb-1 block">Personas</label>
                    <select value={editForm.party_size} onChange={(e) => setEditForm(f => ({ ...f, party_size: e.target.value }))}
                      className="input w-full text-sm">
                      {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} pers.</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--text-subtle)] uppercase tracking-widest mb-1 block">Notas</label>
                    <textarea value={editForm.notes} onChange={(e) => setEditForm(f => ({ ...f, notes: e.target.value }))}
                      rows={2} className="input w-full text-sm resize-none" />
                  </div>
                </div>
              )}
            </div>

            {/* Footer acciones */}
            <div className="px-6 pb-5 flex flex-col gap-2">
              {canEdit(selected.created_at) && ["pending", "approved"].includes(selected.status) ? (
                <>
                  <p className="text-[10px] text-[var(--text-subtle)] text-center mb-1">
                    Puedes editar o cancelar durante los próximos {minutesLeft(selected.created_at)} min
                  </p>
                  {!editing ? (
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(true)} className="btn-outline flex-1 text-sm">
                        Editar
                      </button>
                      <button onClick={handleCancel} disabled={saving}
                        className="flex-1 text-sm px-4 py-2 rounded-xl font-medium transition-colors"
                        style={{ background: "var(--red-dim)", color: "var(--red)", border: "1px solid var(--red)" }}>
                        Cancelar reserva
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(false)} className="btn-outline flex-1 text-sm">Atrás</button>
                      <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 text-sm">
                        {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto block" /> : "Guardar"}
                      </button>
                    </div>
                  )}
                </>
              ) : ["pending", "approved"].includes(selected.status) ? (
                <p className="text-[10px] text-[var(--text-subtle)] text-center py-2">
                  El tiempo para editar esta reserva ha expirado
                </p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ReservationCard({ reservation: r, delay = 0, muted = false, onClick }: {
  reservation: Reservation; delay?: number; muted?: boolean; onClick: () => void;
}) {
  const s = STATUS_MAP[r.status] ?? STATUS_MAP.pending;
  const dateStr = new Date(r.date + "T12:00:00").toLocaleDateString("es-MX", {
    weekday: "short", day: "2-digit", month: "short",
  });
  return (
    <button onClick={onClick}
      className={`card p-4 flex items-center gap-4 transition-all animate-fade-up w-full text-left ${muted ? "opacity-60 hover:opacity-100" : "hover:border-[var(--border-hover)]"}`}
      style={{ animationDelay: `${delay}s` }}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${s.bg} ${s.color}`}>
        {r.status === "pending" ? "⏳" : r.status === "approved" ? "✓" : r.status === "rejected" ? "✕" : "—"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[var(--text)] truncate">{r.customer_name}</p>
          <span className={`text-[10px] font-semibold uppercase tracking-wide flex-shrink-0 ${s.color}`}>{s.label}</span>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          {dateStr} · {r.time} · {r.party_size} {r.party_size === 1 ? "persona" : "personas"}
        </p>
      </div>
      <span className="text-[var(--text-subtle)] text-sm flex-shrink-0">›</span>
    </button>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-3" style={{ background: "var(--surface2)" }}>
      <p className="text-[10px] text-[var(--text-subtle)] uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-semibold text-[var(--text)]">{value}</p>
    </div>
  );
}
