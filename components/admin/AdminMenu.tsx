"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-client";
import toast from "react-hot-toast";

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

const EMPTY_FORM = { name: "", description: "", price: "", image_url: "", category_id: "", available: true };

export default function AdminMenu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState("all");

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const [cats, its] = await Promise.all([
      supabase.from("categories").select("*").eq("active", true).order("sort_order"),
      supabase.from("menu_items").select("*").order("name"),
    ]);
    setCategories(cats.data ?? []);
    setItems(its.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category_id) return toast.error("Completa los campos requeridos");
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      image_url: form.image_url || null,
      category_id: form.category_id,
      available: form.available,
    };
    const res = await fetch("/api/admin/menu", {
      method: editId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editId ? { id: editId, ...payload } : payload),
    });
    const data = await res.json();
    if (data.ok) {
      toast.success(editId ? "Item actualizado" : "Item creado");
      setForm(EMPTY_FORM);
      setEditId(null);
      setShowForm(false);
      fetchData();
    } else {
      toast.error(data.message);
    }
    setSaving(false);
  };

  const handleEdit = (item: MenuItem) => {
    setForm({
      name: item.name,
      description: item.description ?? "",
      price: String(item.price),
      image_url: item.image_url ?? "",
      category_id: item.category_id,
      available: item.available,
    });
    setEditId(item.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggle = async (item: MenuItem) => {
    const res = await fetch("/api/admin/menu", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, available: !item.available }),
    });
    const data = await res.json();
    if (data.ok) {
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, available: !i.available } : i));
    } else {
      toast.error(data.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este item?")) return;
    const res = await fetch(`/api/admin/menu?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.ok) {
      toast.success("Item eliminado");
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      toast.error(data.message);
    }
  };

  const catName = (id: string) => categories.find((c) => c.id === id);
  const filtered = filterCat === "all" ? items : items.filter((i) => i.category_id === filterCat);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-lg font-bold italic text-[var(--text)]">Menú</h2>
          <p className="text-xs text-[var(--text-muted)]">{items.length} {items.length === 1 ? "platillo" : "platillos"}</p>
        </div>
        <button
          onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowForm((v) => !v); }}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            showForm
              ? "bg-[var(--surface2)] text-[var(--text-muted)]"
              : "bg-[var(--accent)] text-white shadow-[0_4px_12px_rgba(200,146,42,0.3)]"
          }`}
        >
          {showForm ? "Cancelar" : "+ Agregar"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSave} className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)] mb-5 flex flex-col gap-3">
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">
            {editId ? "Editar platillo" : "Nuevo platillo"}
          </p>

          <input
            placeholder="Nombre *"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            className="input text-sm py-2.5"
          />
          <textarea
            placeholder="Descripción"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={2}
            className="input text-sm py-2.5 resize-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Precio *"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              step="0.01"
              min="0"
              required
              className="input text-sm py-2.5"
            />
            <select
              value={form.category_id}
              onChange={(e) => set("category_id", e.target.value)}
              required
              className="input text-sm py-2.5"
            >
              <option value="">Categoría *</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
              ))}
            </select>
          </div>
          <input
            placeholder="URL de imagen (opcional)"
            value={form.image_url}
            onChange={(e) => set("image_url", e.target.value)}
            className="input text-sm py-2.5"
          />
          <label className="flex items-center gap-2.5 text-sm text-[var(--text-muted)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) => set("available", e.target.checked)}
              className="accent-[var(--accent)] w-4 h-4"
            />
            Disponible en menú
          </label>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full text-sm py-2.5"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : editId ? "Actualizar platillo" : "Crear platillo"}
          </button>
        </form>
      )}

      {/* Category filter */}
      {!loading && categories.length > 0 && (
        <div className="flex gap-1.5 mb-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterCat("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all ${
              filterCat === "all"
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--surface2)] text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            Todo
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilterCat(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                filterCat === c.id
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--surface2)] text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              {c.emoji} {c.name}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {filtered.map((item) => {
          const cat = catName(item.category_id);
          return (
            <div
              key={item.id}
              className={`bg-[var(--surface)] rounded-2xl border p-3 flex items-center gap-3 transition-all ${
                item.available ? "border-[var(--border)]" : "border-[var(--border)] opacity-50"
              }`}
            >
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--surface2)] flex items-center justify-center text-xl">
                {item.image_url
                  ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  : <span>{cat?.emoji ?? "🍽️"}</span>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[var(--text)] truncate">{item.name}</p>
                  {!item.available && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--surface2)] text-[var(--text-subtle)] flex-shrink-0">
                      Inactivo
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  {cat ? `${cat.emoji} ${cat.name}` : "—"} · <span className="text-[var(--accent-light)] font-semibold">${item.price.toFixed(2)}</span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleToggle(item)}
                  title={item.available ? "Desactivar" : "Activar"}
                  className={`w-8 h-8 rounded-lg text-xs flex items-center justify-center transition-colors ${
                    item.available
                      ? "bg-[var(--surface2)] text-[var(--text-muted)] hover:text-[var(--red)]"
                      : "bg-[var(--green-dim)] text-[var(--green)]"
                  }`}
                >
                  {item.available ? "○" : "●"}
                </button>
                <button
                  onClick={() => handleEdit(item)}
                  title="Editar"
                  className="w-8 h-8 rounded-lg text-xs bg-[var(--surface2)] text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center justify-center transition-colors"
                >
                  ✎
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  title="Eliminar"
                  className="w-8 h-8 rounded-lg text-xs bg-[var(--red-dim)] text-[var(--red)] hover:bg-[var(--red)] hover:text-white flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
