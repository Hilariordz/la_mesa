"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import Navbar from "@/components/Navbar";
import Link from "next/link";

type Order = {
  id: string;
  status: string;
  customer_name: string;
  table_number: number;
  total: number;
  created_at: string;
};

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending:     { label: "Pendiente",  color: "text-yellow-400" },
  in_progress: { label: "En proceso", color: "text-blue-400" },
  ready:       { label: "Listo",      color: "text-green-400" },
  delivering:  { label: "En camino",  color: "text-[var(--accent)]" },
  delivered:   { label: "Entregado",  color: "text-[var(--text-muted)]" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setLoading(false); return; }
      const { data: orders } = await supabase
        .from("orders")
        .select("id, status, customer_name, table_number, total, created_at")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      setOrders(orders ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <Navbar />
      <main className="pt-14 pb-24 max-w-lg mx-auto px-4">
        <h1 className="text-2xl font-bold text-[var(--text)] mt-6 mb-4">Mis pedidos</h1>

        {loading && (
          <p className="text-[var(--text-muted)] text-sm animate-pulse">Cargando...</p>
        )}

        {!loading && orders.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[var(--text-muted)] text-sm mb-4">No tienes pedidos aún</p>
            <Link href="/menu" className="text-[var(--accent)] text-sm">Ver el menú →</Link>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            const s = STATUS_LABEL[order.status] ?? { label: order.status, color: "text-[var(--text-muted)]" };
            return (
              <Link
                key={order.id}
                href={`/pedidos/${order.id}`}
                className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text)]">{order.customer_name}</p>
                    <p className="text-xs text-[var(--text-muted)]">Mesa {order.table_number}</p>
                  </div>
                  <span className={`text-xs font-semibold ${s.color}`}>{s.label}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-[var(--text-muted)]">
                    {new Date(order.created_at).toLocaleDateString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="text-xs font-bold text-[var(--accent)]">${order.total.toFixed(2)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
