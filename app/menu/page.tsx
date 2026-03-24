"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/lib/cart-store";

type Category = { id: string; name: string; emoji: string };
type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  available: boolean;
  category_id: string;
};

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const { addItem, totalItems, totalPrice } = useCart();

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("categories").select("*").eq("active", true).order("sort_order"),
      supabase.from("menu_items").select("*").eq("available", true).order("name"),
    ]).then(([cats, its]) => {
      setCategories(cats.data ?? []);
      setItems(its.data ?? []);
      setLoading(false);
    });
  }, []);

  const allCategories = [{ id: "all", name: "Todo", emoji: "✨" }, ...categories];
  const filtered = activeCategory === "all"
    ? items
    : items.filter((i) => i.category_id === activeCategory);

  return (
    <>
      <Navbar />

      {/* ── Content ── */}
      <main className="pt-14 pb-32 min-h-screen" style={{ background: "var(--bg)" }}>

        {/* Hero strip */}
        <div className="relative overflow-hidden" style={{ background: "var(--surface)" }}>
          <div className="max-w-2xl mx-auto px-5 py-10">
            <p className="text-[11px] tracking-[0.25em] uppercase font-medium mb-2" style={{ color: "var(--accent)" }}>
              Carta
            </p>
            <h1 className="font-display text-4xl font-bold italic leading-tight" style={{ color: "var(--text)" }}>
              Nuestro Menú
            </h1>
            <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
              Ingredientes frescos · Preparación al momento
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, var(--border-hover), transparent)" }} />
        </div>

        <div className="max-w-2xl mx-auto px-5">

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-5">
            {allCategories.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 border"
                  style={{
                    background: active ? "var(--accent)" : "var(--surface)",
                    borderColor: active ? "var(--accent)" : "var(--border)",
                    color: active ? "#fff" : "var(--text-muted)",
                    boxShadow: active ? "0 4px 14px rgba(200,146,42,0.3)" : "none",
                  }}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {!loading && (
            <p className="text-xs mb-4" style={{ color: "var(--text-subtle)" }}>
              {filtered.length} {filtered.length === 1 ? "platillo" : "platillos"}
            </p>
          )}

          {/* Items */}
          {loading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-5xl mb-4">🍽️</p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No hay platillos en esta categoría</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  categoryEmoji={categories.find((c) => c.id === item.category_id)?.emoji}
                  onAdd={() => addItem({ id: item.id, name: item.name, price: item.price })}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Cart FAB */}
      <div
        className="fixed left-0 right-0 flex justify-center px-4 z-30 pointer-events-none transition-all duration-300"
        style={{
          bottom: "80px",
          opacity: totalItems > 0 ? 1 : 0,
          transform: totalItems > 0 ? "translateY(0)" : "translateY(16px)",
        }}
      >
        <button
          onClick={() => setCartOpen(true)}
          className="pointer-events-auto btn-primary gap-3"
          style={{ boxShadow: "0 8px 32px rgba(200,146,42,0.45)" }}
        >
          <span className="relative">
            🛒
            <span
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
              style={{ background: "#fff", color: "var(--accent)" }}
            >
              {totalItems}
            </span>
          </span>
          <span>Ver pedido</span>
          <span style={{ color: "rgba(255,255,255,0.5)" }}>·</span>
          <span>${totalPrice.toFixed(2)}</span>
        </button>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

function MenuCard({
  item,
  categoryEmoji,
  onAdd,
}: {
  item: MenuItem;
  categoryEmoji?: string;
  onAdd: () => void;
}) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAdd();
    setAdded(true);
    setTimeout(() => setAdded(false), 900);
  };

  return (
    <div className="card flex gap-4 p-4 group cursor-default">
      <div
        className="w-[88px] h-[88px] rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center text-3xl"
        style={{ background: "var(--surface2)" }}
      >
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span>{categoryEmoji ?? "🍽️"}</span>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <h3 className="font-semibold text-sm leading-snug" style={{ color: "var(--text)" }}>
            {item.name}
          </h3>
          {item.description && (
            <p className="text-xs mt-1 leading-relaxed line-clamp-2" style={{ color: "var(--text-muted)" }}>
              {item.description}
            </p>
          )}
        </div>
        <p className="text-sm font-bold mt-2" style={{ color: "var(--accent-light)" }}>
          ${item.price.toFixed(2)}
        </p>
      </div>

      <div className="flex items-center flex-shrink-0">
        <button
          onClick={handleAdd}
          aria-label={`Agregar ${item.name}`}
          className="w-9 h-9 rounded-full flex items-center justify-center text-base font-bold transition-all duration-200 active:scale-90"
          style={{
            background: added ? "var(--green)" : "var(--accent-dim)",
            color: added ? "#fff" : "var(--accent-light)",
            border: `1px solid ${added ? "var(--green)" : "var(--accent)"}`,
            transform: added ? "scale(1.1)" : "scale(1)",
          }}
        >
          {added ? "✓" : "+"}
        </button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card p-4 flex gap-4">
      <div className="skeleton w-[88px] h-[88px] rounded-2xl flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2 justify-center">
        <div className="skeleton h-4 w-3/4 rounded-lg" />
        <div className="skeleton h-3 w-full rounded-lg" />
        <div className="skeleton h-3 w-1/4 rounded-lg" />
      </div>
    </div>
  );
}
