"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminReservations from "@/components/admin/AdminReservations";

type Tab = "reservations";

export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("reservations");
  const [pendingReservationsCount, setPendingReservationsCount] = useState(0);

  useEffect(() => {
    fetch("/api/admin/check").then((r) => { if (r.ok) setAuthed(true); });
  }, []);

  useEffect(() => {
    if (!authed) return;

    const loadPendingCount = async () => {
      try {
        const res = await fetch("/api/admin/reservations?status=pending");
        const data = await res.json();
        if (res.ok && data.ok) {
          setPendingReservationsCount(Array.isArray(data.data) ? data.data.length : 0);
        }
      } catch {
        // ignore badge refresh errors
      }
    };

    loadPendingCount();
    const interval = setInterval(loadPendingCount, 10000);
    return () => clearInterval(interval);
  }, [authed]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    });
    const data = await res.json();
    if (data.ok) { setAuthed(true); } else { setError("Código incorrecto"); }
    setLoading(false);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/");
  };

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[var(--accent)] opacity-[0.03] blur-[100px] pointer-events-none" />
        <div className="w-full max-w-xs text-center relative z-10 animate-fade-up">
          <div className="w-16 h-16 rounded-2xl bg-[var(--surface2)] border border-[var(--border)] flex items-center justify-center text-3xl mx-auto mb-6">
            🔐
          </div>
          <h1 className="font-display text-2xl font-bold italic text-[var(--text)] mb-1">Panel Admin</h1>
          <p className="text-xs text-[var(--text-muted)] mb-8">Ingresa tu código de acceso</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="••••••••"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="input text-center tracking-[0.3em] text-lg"
            />
            {error && <p className="text-[var(--red)] text-xs">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : "Entrar"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: "reservations", label: "Reservas", icon: "🪑" },
  ];

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <header className="glass border-b border-[var(--border)] px-5 h-14 flex items-center justify-between sticky top-0 z-40">
        <span className="font-display text-lg font-bold italic text-[var(--text)]">La Mesa</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--text-subtle)] hidden sm:block">Panel Admin</span>
          <button
            onClick={handleLogout}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors px-3 py-1.5 rounded-full border border-[var(--border)] hover:border-[var(--border-hover)]"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)] bg-[var(--surface)] sticky top-14 z-30">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-3.5 text-xs font-medium transition-all flex flex-col items-center gap-1 relative ${
              tab === t.key ? "text-[var(--accent-light)]" : "text-[var(--text-subtle)] hover:text-[var(--text-muted)]"
            }`}
          >
            <span className="text-lg">{t.icon}</span>
            <span className="tracking-wide flex items-center gap-1">
              {t.label}
              {t.key === "reservations" && pendingReservationsCount > 0 && (
                <span className="min-w-5 h-5 px-1 rounded-full bg-[var(--accent)] text-white text-[10px] font-semibold leading-5">
                  {pendingReservationsCount > 99 ? "99+" : pendingReservationsCount}
                </span>
              )}
            </span>
            {tab === t.key && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[var(--accent)]" />
            )}
          </button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
        {tab === "reservations" && <AdminReservations />}
      </div>
    </main>
  );
}
