"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

type Category = { id: string; name: string; emoji: string; sort_order: number; active: boolean };

const EMPTY = { name: "", emoji: "🍽️", sort_order: "0" };

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetch_ = useCallback(async () => {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    if (data.ok) setCategories(data.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return toast.error("El nombre es requerido");
    setSaving(true);
    const payload = { name: form.name, emoji: form.emoji || "🍽️", sort_order: Number(form.sort_order) };
    const res = await fetch(`/api/admin/categories${editId ? "" : ""}`, {
      method: editId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editId ? { id: editId, ...payload } : payload),
    });
    const data = await res.json();
    if (data.ok) {
      toast.success(editId ? "Categoría actualizada" : "Categoría creada");
      setForm(EMPTY);
      setEditId(null);
      setShowForm(false);
      fetch_();
    } else {
      toast.error(data.message);
    }
    setSaving(false);
  };

  const handleEdit = (cat: Category) => {
    setForm({ name: cat.name, emoji: cat.emoji, sort_order: String(cat.sort_order) });
    setEditId(cat.id);
    setShowForm(true);
  };

  const handleToggle = async (cat: Category) => {
    const res = await fetch("/api/admin/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: cat.id, active: !cat.active }),
    });
    const data = await res.json();
    if (data.ok) setCategories((prev) => prev.map((c) => c.id === cat.id ? { ...c, active: !c.active } : c));
    else toast.error(data.message);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta categoría? Los platillos asociados quedarán sin categoría.")) return;
    const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.ok) {
      toast.success("Categoría eliminada");
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } else {
      toast.error(data.message);
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-lg font-bold italic text-[var(--text)]">Categorías</h2>
          <p className="text-xs text-[var(--text-muted)]">{categories.length} categorías</p>
        </div>
        <button
          onClick={() => { setForm(EMPTY); setEditId(null); setShowForm((v) => !v); }}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            showForm
              ? "bg-[var(--surface2)] text-[var(--text-muted)]"
              : "bg-[var(--accent)] text-white shadow-[0_4px_12px_rgba(200,146,42,0.3)]"
          }`}
        >
          {showForm ? "Cancelar" : "+ Nueva"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSave} className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)] mb-5 flex flex-col gap-3">
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">
            {editId ? "Editar categoría" : "Nueva categoría"}
          </p>
          <div className="grid grid-cols-[1fr_80px_80px] gap-3">
            <input
              placeholder="Nombre *"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
              className="input text-sm py-2.5"
            />
            <input
              placeholder="Emoji"
              value={form.emoji}
              onChange={(e) => set("emoji", e.target.value)}
              className="input text-sm py-2.5 text-center"
            />
            <input
              type="number"
              placeholder="Orden"
              value={form.sort_order}
              onChange={(e) => set("sort_order", e.target.value)}
              min="0"
              className="input text-sm py-2.5 text-center"
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full text-sm py-2.5">
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : editId ? "Actualizar" : "Crear categoría"}
          </button>
        </form>
      )}

      {loading && (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-14 rounded-2xl" />)}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`bg-[var(--surface)] rounded-2xl border border-[var(--border)] px-4 py-3 flex items-center gap-3 transition-all ${!cat.active ? "opacity-50" : ""}`}
          >
            <span className="text-2xl w-8 text-center flex-shrink-0">{cat.emoji}</span>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--text)]">{cat.name}</p>
              <p className="text-xs text-[var(--text-muted)]">Orden: {cat.sort_order} · {cat.active ? "Activa" : "Inactiva"}</p>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => handleToggle(cat)}
                title={cat.active ? "Desactivar" : "Activar"}
                className={`w-8 h-8 rounded-lg text-xs flex items-center justify-center transition-colors ${
                  cat.active
                    ? "bg-[var(--surface2)] text-[var(--text-muted)] hover:text-[var(--red)]"
                    : "bg-[var(--green-dim)] text-[var(--green)]"
                }`}
              >
                {cat.active ? "○" : "●"}
              </button>
              <button
                onClick={() => handleEdit(cat)}
                title="Editar"
                className="w-8 h-8 rounded-lg text-xs bg-[var(--surface2)] text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center justify-center transition-colors"
              >
                ✎
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                title="Eliminar"
                className="w-8 h-8 rounded-lg text-xs bg-[var(--red-dim)] text-[var(--red)] hover:bg-[var(--red)] hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && categories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-3xl mb-3">🗂️</p>
          <p className="text-[var(--text-muted)] text-sm">No hay categorías. Crea una para empezar.</p>
        </div>
      )}
    </div>
  );
}
