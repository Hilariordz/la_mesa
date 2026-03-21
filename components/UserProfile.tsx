"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function UserProfile() {
  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem("vantage-user-name");
    if (savedName) {
      setName(savedName);
    }
  }, []);

  const saveName = () => {
    localStorage.setItem("vantage-user-name", name);
    setIsEditing(false);
    toast.success("Perfil actualizado");
  };

  return (
    <div className="mb-8 flex flex-col items-center gap-2 rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-gray-700 to-gray-400 text-2xl font-bold italic">
        {name ? name[0].toUpperCase() : "V"}
      </div>

      {isEditing ? (
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-b border-white/20 bg-black p-1 text-center text-sm outline-none"
            placeholder="Tu nombre..."
            autoFocus
          />
          <button
            onClick={saveName}
            className="text-xs font-bold uppercase text-green-500"
            type="button"
          >
            Listo
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-1 text-xs uppercase tracking-widest text-gray-500">Curador de Arte</p>
          <h3
            onClick={() => setIsEditing(true)}
            className="cursor-pointer text-xl font-black italic hover:text-gray-300"
          >
            {name || "Sin nombre"}
          </h3>
        </div>
      )}
    </div>
  );
}
