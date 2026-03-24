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
  { key: "pending",     label: "Pendiente",  color: "bg-yellow-500/20 text-yellow-400" },
  { key: "in_progress", label: "En proceso", color: "bg-blue-500/20 text-blue-400" },
  { key: "ready",       label: "Listo",      color: "bg-green-500/20 text-green-400" },
  { key: "delivering",  label: "En camino",  color: "bg-orange-500/20 text-orange-400" },
  { key: "delivered",   label: "Entregado",  color: "bg-[var(--surface2)] text-[var(--text-muted)]" },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");

  const fetchOrders = useCallback(async () => {
    const supabase = createClient();
    const query = supabase
      .from("orders")
      .select("*, order_items(name, quantity, price)")
      .order("created_at", { ascending: false })
      .limit(50);

    if (filter === "active") {
      query.in("status", ["pending", "in_progress", "ready", "delivering"]);
    }

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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[var(--text)]">Pedidos</h2>
        <div className="flex gap-2">
          {["active", "all"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                filter === f ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "border-[var(--border)] text-[var(--text-muted)]"
              }`}
            >
              {f === "active" ? "Activos" : "Todos"}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-[var(--text-muted)] text-sm animate-pulse">Cargando...</p>}

      {!loading && orders.length === 0 && (
        <p className="text-[var(--text-muted)] text-sm text-center py-12">No hay pedidos</p>
      )}

      <div className="flex flex-col gap-3">
        {orders.map((order) => {
          const s = statusInfo(order.status);
          return (
            <div key={order.id} className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)]">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-sm text-[var(--text)]">{order.customer_name}</p>
                  <p className="text-xs text-[var(--text-muted)]">Mesa {order.table_number} · #{order.id.slice(0, 6)}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.color}`}>{s.label}</span>
              </div>

              <div className="flex flex-col gap-1 mb-3">
                {order.order_items.map((item, i) => (
                  <p key={i} className="text-xs text-[var(--text-muted)]">
                    {item.quantity}× {item.name} — ${(item.price * item.quantity).toFixed(2)}
                  </p>
                ))}
                <p className="text-xs font-bold text-[var(--accent)] mt-1">Total: ${order.total.toFixed(2)}</p>
                {order.notes && <p className="text-xs text-[var(--text-subtle)] italic">"{order.notes}"</p>}
              </div>

              {/* Status actions */}
              <div className="flex gap-2 flex-wrap">
                {STATUSES.filter((s) => s.key !== order.status).map((s) => (
                  <button
                    key={s.key}
                    onClick={() => updateStatus(order.id, s.key)}
                    className="px-3 py-1 rounded-full text-xs border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                  >
                    → {s.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
