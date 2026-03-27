import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import SplashScreen from "@/components/SplashScreen";
import InstallBanner from "@/components/InstallBanner";
import OfflineBanner from "@/components/OfflineBanner";
import NotificationPrompt from "@/components/NotificationPrompt";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "La Mesa | Menú & Reservas",
  description: "Explora nuestro menú, haz tu pedido y reserva tu mesa — todo desde aquí.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "La Mesa" },
  icons: {
    icon: "/lamesaicon.jpg",
    shortcut: "/lamesaicon.jpg",
  },
};

export const viewport: Viewport = {
  themeColor: "#c8922a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <head>
        <link rel="apple-touch-icon" href="/lamesaicon.jpg" />
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (e) => {
              if (e.data?.type === 'PLAY_SOUND') {
                try { new Audio('/notification.wav').play(); } catch {}
              }
              if (e.data?.type === 'SYNC_RESERVATIONS') {
                try {
                  const pending = JSON.parse(localStorage.getItem('pending_reservations') || '[]');
                  if (!pending.length) return;
                  Promise.all(pending.map(function(p) {
                    return fetch('/api/reservations', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(p),
                    }).then(function(r) { return r.json(); });
                  })).then(function() {
                    localStorage.removeItem('pending_reservations');
                  }).catch(function() {});
                } catch(e) {}
              }
            });
          }
        `}} />
      </head>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased">
        <SplashScreen />
        {children}
        <OfflineBanner />
        <InstallBanner />
        <NotificationPrompt />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#1a1a1a",
              color: "#f5f0eb",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              fontSize: "13px",
            },
          }}
        />
      </body>
    </html>
  );
}
