'use client';

import { useState, useEffect } from 'react';
import { usePushNotifications } from '@/lib/hooks/usePushNotifications';

const DISMISSED_KEY = 'lamesa-notif-dismissed';

export default function NotificationPrompt() {
  const { permission, isSupported, subscribe } = usePushNotifications();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupported) return;
    if (permission !== 'default') return;
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const t = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(t);
  }, [isSupported, permission]);

  const handleAccept = async () => {
    setLoading(true);
    await subscribe();
    setLoading(false);
    setVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[420px] z-[180] animate-in slide-in-from-bottom duration-500">
      <div className="bg-stone-900 text-white border border-stone-700 rounded-2xl shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl leading-none mt-0.5">🔔</div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-base leading-tight">Activar notificaciones</h4>
            <p className="text-xs text-stone-300 mt-1">
              Recibe actualizaciones sobre el estado de tu reserva y pedido en tiempo real.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleAccept}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
              >
                {loading ? 'Activando...' : 'Activar'}
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-stone-300 text-xs font-medium hover:text-white transition-colors"
              >
                Ahora no
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-stone-400 hover:text-stone-200 px-1"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
