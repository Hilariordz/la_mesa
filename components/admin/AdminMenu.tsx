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

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[var(--text)]">Menú</h2>
        <button
          onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowForm((v) => !v); }}
          className="px-4 py-1.5 rounded-full text-xs bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
        >
          {showForm ? "Cancelar" : "+ Agregar"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSave} className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)] mb-6 flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-[var(--text)]">{editId ? "Editar item" : "Nuevo item"}</h3>

          <input
            placeholder="Nombre *"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            className="input-sm"
          />
          <textarea
            placeholder="Descripción"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={2}
            className="input-sm resize-none"
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
              className="input-sm"
            />
            <select
              value={form.category_id}
              onChange={(e) => set("category_id", e.target.value)}
              required
              className="input-sm"
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
            className="input-sm"
          />
          <label className="flex items-center gap-2 text-sm text-[var(--text-muted)] cursor-pointer">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) => set("available", e.target.checked)}
              className="accent-[var(--accent)]"
            />
            Disponible
          </label>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[var(--accent)] text-white rounded-full py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {saving ? "Guardando..." : editId ? "Actualizar" : "Crear item"}
          </button>
        </form>
      )}

      {loading && <p className="text-[var(--text-muted)] text-sm animate-pulse">Cargando...</p>}

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`bg-[var(--surface)] rounded-2xl p-4 border transition-colors ${
              item.available ? "border-[var(--border)]" : "border-[var(--border)] opacity-50"
            }`}
          >
            <div className="flex items-start gap-3">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-[var(--surface2)] flex items-center justify-center text-2xl flex-shrink-0">🍽️</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="font-semibold text-sm text-[var(--text)]">{item.name}</p>
                  <p className="text-sm font-bold text-[var(--accent)] ml-2">${item.price.toFixed(2)}</p>
                </div>
                <p className="text-xs text-[var(--text-muted)]">{catName(item.category_id)}</p>
                {item.description && (
                  <p className="text-xs text-[var(--text-subtle)] mt-0.5 line-clamp-1">{item.description}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleToggle(item)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  item.available
                    ? "bg-[var(--surface2)] text-[var(--text-muted)] hover:text-red-400"
                    : "bg-green-500/20 text-green-400"
                }`}
              >
                {item.available ? "Desactivar" : "Activar"}
              </button>
              <button
                onClick={() => handleEdit(item)}
                className="flex-1 py-1.5 rounded-xl text-xs font-medium bg-[var(--surface2)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .input-sm {
          width: 100%;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 8px 12px;
          font-size: 13px;
          color: var(--text);
          outline: none;
        }
        .input-sm:focus { border-color: var(--accent); }
        .input-sm option { background: var(--surface); }
      `}</style>
    </div>
  );
}
