'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone || isIosStandalone) {
      setIsInstalled(true);
      return;
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    const onAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsVisible(false);
      setDeferredPrompt(null);
    }
  };

  if (isInstalled || !isVisible || !deferredPrompt) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-[420px] z-[180] animate-in slide-in-from-top duration-500">
      <div className="bg-stone-900 text-white border border-stone-700 rounded-2xl shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <img src="/lamesaicon.jpg" alt="La Mesa" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-base leading-tight">Instalar app</h4>
            <p className="text-xs text-stone-300 mt-1">
              Usa este sitio como app: abre más rápido, en ventana dedicada y con mejor experiencia offline.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 transition-colors"
              >
                Instalar
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="px-3 py-2 text-stone-300 text-xs font-medium hover:text-white transition-colors"
              >
                Ahora no
              </button>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
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
