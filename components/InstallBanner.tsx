"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Solo mostrar en mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;

    // No mostrar si ya está instalada como PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // No mostrar si ya fue descartada
    if (localStorage.getItem("pwa-banner-dismissed")) return;

    const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsIOS(ios);

    if (ios) {
      setVisible(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa-banner-dismissed", "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2"
      style={{ background: "linear-gradient(to top, var(--bg) 80%, transparent)" }}
    >
      <div
        className="rounded-2xl p-4 flex items-center gap-4 shadow-2xl"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-hover)",
        }}
      >
        {/* Icono */}
        <img src="/icon.svg" alt="La Mesa" className="w-12 h-12 rounded-xl flex-shrink-0" />

        {/* Texto */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            Instala La Mesa
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {isIOS
              ? 'Toca compartir y luego "Agregar a inicio"'
              : "Accede más rápido desde tu pantalla de inicio"}
          </p>
        </div>

        {/* Botones */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleDismiss}
            className="text-xs px-3 py-1.5 rounded-full"
            style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
          >
            Ahora no
          </button>
          {!isIOS && (
            <button
              onClick={handleInstall}
              className="btn-primary text-xs px-4 py-1.5"
            >
              Instalar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
