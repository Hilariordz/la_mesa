"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { fetchWithOfflineFallback } from "@/lib/offline-data";
import { createClient } from "@/lib/supabase-client";

type Order = {
  id: string;
  status: string;
  customer_name: string;
  table_number: number;
  total: number;
  created_at: string;
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending:     { label: "Pendiente",  color: "text-[var(--yellow)]",     bg: "bg-[var(--yellow-dim)]",  dot: "bg-[var(--yellow)]" },
  in_progress: { label: "En proceso", color: "text-[var(--blue)]",       bg: "bg-[var(--blue-dim)]",    dot: "bg-[var(--blue)]" },
  ready:       { label: "Listo",      color: "text-[var(--green)]",      bg: "bg-[var(--green-dim)]",   dot: "bg-[var(--green)]" },
  delivering:  { label: "En camino",  color: "text-[var(--accent-light)]", bg: "bg-[var(--accent-dim)]", dot: "bg-[var(--accent)]" },
  delivered:   { label: "Entregado",  color: "text-[var(--text-muted)]", bg: "bg-[var(--surface2)]",    dot: "bg-[var(--text-subtle)]" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (userId === null) return;
    fetchWithOfflineFallback<{ ok: boolean; data: Order[] }>(
      `user-orders-${userId}`,
      () => fetch("/api/orders").then((r) => {
        if (r.status === 401) { setUnauthorized(true); return { ok: false, data: [] }; }
        return r.json();
      }),
      { cacheTime: 2 * 60 * 1000 }
    ).then(({ data }) => {
      if (data?.ok) setOrders(data.data);
    }).finally(() => setLoading(false));
  }, [userId]);

  const active = orders.filter((o) => !["delivered"].includes(o.status));
  const past   = orders.filter((o) => ["delivered"].includes(o.status));

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
          <p className="text-[var(--text-muted)] text-sm">Inicia sesión para ver tus pedidos</p>
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
            Mis Pedidos
          </h1>
        </div>

        {orders.length === 0 ? (
          <div className="card p-12 text-center animate-fade-up">
            <p className="text-4xl mb-4">🍽️</p>
            <p className="text-[var(--text-muted)] text-sm mb-6">Aún no tienes pedidos</p>
            <Link href="/menu" className="btn-primary text-sm">Ver el menú</Link>
          </div>
        ) : (
          <>
            {/* Pedidos activos */}
            {active.length > 0 && (
              <section className="mb-6 animate-fade-up">
                <p className="text-[10px] text-[var(--text-subtle)] uppercase tracking-widest font-medium mb-3">
                  En curso · {active.length}
                </p>
                <div className="flex flex-col gap-2">
                  {active.map((order, i) => (
                    <OrderCard key={order.id} order={order} delay={i * 0.04} />
                  ))}
                </div>
              </section>
            )}

            {/* Historial */}
            {past.length > 0 && (
              <section className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
                <p className="text-[10px] text-[var(--text-subtle)] uppercase tracking-widest font-medium mb-3">
                  Historial
                </p>
                <div className="flex flex-col gap-2">
                  {past.map((order, i) => (
                    <OrderCard key={order.id} order={order} delay={i * 0.04} muted />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <Link href="/menu" className="block text-center text-xs text-[var(--text-subtle)] mt-6 hover:text-[var(--accent-light)] transition-colors">
          + Nuevo pedido
        </Link>
      </main>
    </>
  );
}

function OrderCard({ order, delay = 0, muted = false }: { order: Order; delay?: number; muted?: boolean }) {
  const s = STATUS_MAP[order.status] ?? STATUS_MAP.pending;
  const date = new Date(order.created_at).toLocaleDateString("es-MX", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });

  return (
    <Link
      href={`/pedidos/${order.id}`}
      className={`card p-4 flex items-center gap-4 transition-all animate-fade-up ${muted ? "opacity-60 hover:opacity-100" : "hover:border-[var(--border-hover)]"}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Status dot */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
        <span className={`w-2 h-2 rounded-full ${s.dot} ${order.status !== "delivered" ? "animate-pulse-dot" : ""}`} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[var(--text)] truncate">{order.customer_name}</p>
          <span className={`text-[10px] font-semibold uppercase tracking-wide flex-shrink-0 ${s.color}`}>
            {s.label}
          </span>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Mesa {order.table_number} · {date}
        </p>
      </div>

      {/* Total */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-[var(--accent-light)]">${order.total.toFixed(2)}</p>
        <p className="text-[10px] text-[var(--text-subtle)]">›</p>
      </div>
    </Link>
  );
}
