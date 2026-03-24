"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import Navbar from "@/components/Navbar";
import Link from "next/link";

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

const STATUS_STEPS = [
  { key: "pending",     label: "Recibido",    icon: "📥", desc: "Tu pedido fue recibido" },
  { key: "in_progress", label: "Preparando",  icon: "👨‍🍳", desc: "El chef está cocinando" },
  { key: "ready",       label: "Listo",       icon: "✅", desc: "Tu pedido está listo" },
  { key: "delivering",  label: "En camino",   icon: "🚶", desc: "Lo llevamos a tu mesa" },
  { key: "delivered",   label: "Entregado",   icon: "🎉", desc: "¡Buen provecho!" },
];

export default function OrderStatusPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(name, quantity, price)")
      .eq("id", id)
      .single();
    if (data) setOrder(data as Order);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchOrder();
    const supabase = createClient();
    const channel = supabase
      .channel(`order-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` },
        (payload) => setOrder((prev) => prev ? { ...prev, status: payload.new.status } : prev)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, fetchOrder]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
          <p className="text-[var(--text-muted)] text-sm">Cargando pedido...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-4xl">🔍</p>
        <p className="text-[var(--text-muted)]">Pedido no encontrado</p>
        <Link href="/menu" className="btn-primary text-sm">Ir al menú</Link>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const currentInfo = STATUS_STEPS[currentStep] ?? STATUS_STEPS[0];

  return (
    <>
      <Navbar />
      <main className="pt-14 pb-28 max-w-lg mx-auto px-4">

        {/* Header */}
        <div className="mt-8 mb-6 animate-fade-up">
          <p className="text-[11px] text-[var(--text-subtle)] tracking-widest uppercase mb-1">
            Pedido #{order.id.slice(0, 8).toUpperCase()}
          </p>
          <h1 className="font-display text-2xl font-bold italic text-[var(--text)]">
            Hola, {order.customer_name}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Mesa {order.table_number}</p>
        </div>

        {/* Estado actual destacado */}
        <div className="card p-5 mb-5 animate-fade-up" style={{ animationDelay: "0.05s" }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--accent-dim)] border border-[var(--accent)] flex items-center justify-center text-2xl flex-shrink-0">
              {currentInfo.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-[var(--text)]">{currentInfo.label}</p>
                {order.status !== "delivered" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-light)] animate-pulse-dot" />
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{currentInfo.desc}</p>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mt-4 h-1.5 bg-[var(--surface2)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] rounded-full transition-all duration-700"
              style={{ width: `${((currentStep + 1) / STATUS_STEPS.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-[var(--text-subtle)]">Recibido</span>
            <span className="text-[10px] text-[var(--text-subtle)]">Entregado</span>
          </div>
        </div>

        {/* Steps */}
        <div className="card p-5 mb-5 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-medium mb-4">
            Seguimiento
          </h2>
          <div className="flex flex-col gap-0">
            {STATUS_STEPS.map((step, i) => {
              const done = i < currentStep;
              const active = i === currentStep;
              const pending = i > currentStep;
              return (
                <div key={step.key} className="flex items-start gap-3">
                  {/* Línea + círculo */}
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition-all ${
                      done   ? "bg-[var(--accent)] text-white" :
                      active ? "bg-[var(--accent-dim)] border-2 border-[var(--accent)] text-[var(--accent-light)]" :
                               "bg-[var(--surface2)] text-[var(--text-subtle)]"
                    }`}>
                      {done ? "✓" : step.icon}
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`w-px flex-1 my-1 min-h-[20px] transition-colors ${done ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`} />
                    )}
                  </div>
                  {/* Label */}
                  <div className="pb-4">
                    <p className={`text-sm font-medium transition-colors ${
                      active ? "text-[var(--accent-light)]" : done ? "text-[var(--text)]" : "text-[var(--text-subtle)]"
                    }`}>
                      {step.label}
                    </p>
                    {active && (
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{step.desc}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resumen */}
        <div className="card p-5 animate-fade-up" style={{ animationDelay: "0.15s" }}>
          <h2 className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-medium mb-4">
            Resumen del pedido
          </h2>
          <div className="flex flex-col gap-2.5">
            {order.order_items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">
                  <span className="text-[var(--text)] font-medium">{item.quantity}×</span> {item.name}
                </span>
                <span className="text-[var(--text)] font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="divider my-3" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--text-muted)]">Total</span>
            <span className="text-lg font-bold text-[var(--accent-light)]">${order.total.toFixed(2)}</span>
          </div>
          {order.notes && (
            <p className="text-xs text-[var(--text-muted)] mt-3 italic">
              📝 {order.notes}
            </p>
          )}
        </div>

        <Link href="/menu" className="block text-center text-xs text-[var(--text-subtle)] mt-6 hover:text-[var(--accent-light)] transition-colors">
          ← Volver al menú
        </Link>
      </main>
    </>
  );
}
