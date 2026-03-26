import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import SplashScreen from "@/components/SplashScreen";
import InstallBanner from "@/components/InstallBanner";
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
      </head>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased">
        <SplashScreen />
        {children}
        <InstallBanner />
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
