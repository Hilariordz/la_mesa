"use client";

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="text-5xl mb-4">📡</div>
      <h1 className="text-xl font-bold text-[var(--text)] mb-2">Sin conexión</h1>
      <p className="text-sm text-[var(--text-muted)] max-w-xs">
        Parece que no tienes internet. Algunas funciones pueden no estar disponibles.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 px-6 py-3 bg-[var(--accent)] text-white rounded-full text-sm font-semibold"
      >
        Reintentar
      </button>
    </main>
  );
}
