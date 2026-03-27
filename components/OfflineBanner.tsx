"use client";

import { useEffect, useState } from "react";

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);
    const on  = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online",  on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9998] flex items-center justify-center gap-2 py-2 px-4 text-xs font-medium"
      style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--yellow)] animate-pulse" />
      Sin conexión — mostrando datos guardados
    </div>
  );
}
