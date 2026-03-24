"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-client";
import toast from "react-hot-toast";

type Order = {
  id: string;
  status: string;
  customer_name: string;
  table_number: number;
  total: number;
  notes: string | null;
  created_at: string;
  order_items: { name: string; quantity: number; price: number }[];
};

const STATUSES = [
  { key: "pending",     label: "Pendiente",  color: "text-[var(--yellow)]",      bg: "bg-[var(--yellow-dim)] border-[var(--yellow)]" },
  { key: "in_progress", label: "En proceso", color: "text-[var(--blue)]",        bg: "bg-[var(--blue-dim)] border-[var(--blue)]" },
  { key: "ready",       label: "Listo",      color: "text-[var(--green)]",       bg: "bg-[var(--green-dim)] border-[var(--green)]" },
  { key: "delivering",  label: "En camino",  color: "text-[var(--accent-light)]", bg: "bg-[var(--accent-dim)] border-[var(--accent)]" },
  { key: "delivered",   label: "Entregado",  color: "text-[var(--text-muted)]",  bg: "bg-[var(--surface2)] border-[var(--border)]" },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    const supabase = createClient();
    const query = supabase
      .from("orders")
      .select("*, order_items(name, quantity, price)")
      .order("created_at", { ascending: false })
      .limit(50);
    if (filter === "active") query.in("status", ["pending", "in_progress", "ready", "delivering"]);
    const { data } = await query;
    setOrders((data as Order[]) ?? []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchOrders();
    const supabase = createClient();
    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, fetchOrders)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders]);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch("/api/admin/orders/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const data = await res.json();
    if (data.ok) {
      toast.success("Estado actualizado");
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    } else {
      toast.error(data.message);
    }
  };

  const statusInfo = (key: string) => STATUSES.find((s) => s.key === key) ?? STATUSES[0];

  const NEXT_STATUS: Record<string, string> = {
    pending: "in_progress",
    in_progress: "ready",
    ready: "delivering",
    delivering: "delivered",
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-lg font-bold italic text-[var(--text)]">Pedidos</h2>
          <p className="text-xs text-[var(--text-muted)]">{orders.length} {orders.length === 1 ? "pedido" : "pedidos"}</p>
        </div>
        <div className="flex gap-1.5">
          {["active", "all"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === f
                  ? "bg-[var(--accent)] text-white shadow-[0_4px_12px_rgba(200,146,42,0.3)]"
                  : "bg-[var(--surface2)] text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              {f === "active" ? "Activos" : "Todos"}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="text-center py-16">
          <p className="text-3xl mb-3">📋</p>
          <p className="text-[var(--text-muted)] text-sm">No hay pedidos {filter === "active" ? "activos" : ""}</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {orders.map((order) => {
          const s = statusInfo(order.status);
          const isOpen = expanded === order.id;
          const nextKey = NEXT_STATUS[order.status];
          const nextInfo = nextKey ? statusInfo(nextKey) : null;

          return (
            <div key={order.id} className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden transition-all">
              {/* Card header — clickable */}
              <button
                onClick={() => setExpanded(isOpen ? null : order.id)}
                className="w-full p-4 flex items-center gap-3 text-left"
              >
                {/* Status badge */}
                <div className={`px-2.5 py-1 rounded-lg border text-[10px] font-semibold uppercase tracking-wide flex-shrink-0 ${s.bg} ${s.color}`}>
                  {s.label}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text)] truncate">{order.customer_name}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Mesa {order.table_number} · #{order.id.slice(0, 6).toUpperCase()}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-[var(--accent-light)]">${order.total.toFixed(2)}</p>
                  <p className="text-[10px] text-[var(--text-subtle)]">
                    {new Date(order.created_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>

                <span className={`text-[var(--text-subtle)] transition-transform duration-200 ml-1 ${isOpen ? "rotate-90" : ""}`}>›</span>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="px-4 pb-4 border-t border-[var(--border)]">
                  {/* Items */}
                  <div className="pt-3 mb-3 flex flex-col gap-1.5">
                    {order.order_items.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-[var(--text-muted)]">
                          <span className="text-[var(--text)] font-medium">{item.quantity}×</span> {item.name}
                        </span>
                        <span className="text-[var(--text)] font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {order.notes && (
                      <p className="text-xs text-[var(--text-subtle)] italic mt-1">📝 {order.notes}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap pt-2 border-t border-[var(--border)]">
                    {nextInfo && (
                      <button
                        onClick={() => updateStatus(order.id, nextKey)}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
                      >
                        → {nextInfo.label}
                      </button>
                    )}
                    {STATUSES.filter((s) => s.key !== order.status && s.key !== nextKey).map((s) => (
                      <button
                        key={s.key}
                        onClick={() => updateStatus(order.id, s.key)}
                        className="px-3 py-2 rounded-xl text-xs text-[var(--text-muted)] bg-[var(--surface2)] hover:text-[var(--text)] transition-colors"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
