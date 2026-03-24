"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import toast from "react-hot-toast";

type Props = { open: boolean; onClose: () => void };

export default function CartDrawer({ open, onClose }: Props) {
  const { items, updateQty, removeItem, totalPrice, clear } = useCart();
  const [tableNumber, setTableNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOrder = async () => {
    if (!tableNumber) return toast.error("Ingresa el número de mesa");
    if (!customerName) return toast.error("Ingresa tu nombre");
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table_number: Number(tableNumber),
          customer_name: customerName,
          notes,
          items: items.map((i) => ({
            menu_item_id: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message);
      toast.success("¡Pedido enviado!");
      clear();
      onClose();
      window.location.href = `/pedidos/${data.orderId}`;
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al enviar pedido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/70 transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm glass-surface border-l border-[var(--border)] flex flex-col transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div>
            <h2 className="font-display text-lg font-bold italic text-[var(--text)]">Tu pedido</h2>
            <p className="text-xs text-[var(--text-muted)]">{items.length} {items.length === 1 ? "platillo" : "platillos"}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--surface2)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
            <span className="text-5xl">🛒</span>
            <p className="text-[var(--text-muted)] text-sm">Tu carrito está vacío</p>
            <button onClick={onClose} className="text-xs text-[var(--accent-light)] hover:underline">
              Explorar el menú
            </button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text)] truncate">{item.name}</p>
                    <p className="text-xs text-[var(--accent-light)] mt-0.5">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full bg-[var(--surface2)] border border-[var(--border)] text-[var(--text)] text-sm flex items-center justify-center hover:border-[var(--accent)] transition-colors"
                    >−</button>
                    <span className="text-sm text-[var(--text)] w-5 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-[var(--surface2)] border border-[var(--border)] text-[var(--text)] text-sm flex items-center justify-center hover:border-[var(--accent)] transition-colors"
                    >+</button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="w-6 h-6 flex items-center justify-center text-[var(--text-subtle)] hover:text-[var(--red)] transition-colors text-xs"
                  >✕</button>
                </div>
              ))}

              {/* Total */}
              <div className="mt-2 pt-3 border-t border-[var(--border-hover)]">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--text-muted)]">Subtotal</span>
                  <span className="text-base font-bold text-[var(--accent-light)]">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Datos del pedido */}
              <div className="mt-4 flex flex-col gap-3">
                <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-widest">Datos de entrega</p>
                <input
                  type="number"
                  placeholder="Número de mesa *"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="input"
                />
                <input
                  type="text"
                  placeholder="Tu nombre *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="input"
                />
                <textarea
                  placeholder="Notas especiales (opcional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="input resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-[var(--border)]">
              <button
                onClick={handleOrder}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Confirmar pedido · ${totalPrice.toFixed(2)}</>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
