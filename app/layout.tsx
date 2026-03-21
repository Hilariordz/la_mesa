import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vantage-gallery.vercel.app"),
  title: "VANTAGE | Galeria de Arte Digital",
  description:
    "Explora la coleccion curada de arte digital mas exclusiva. Descubre artistas emergentes y guarda tus obras favoritas en nuestra PWA.",
  keywords: [
    "arte digital",
    "galeria de arte",
    "PWA arte",
    "diseno digital",
    "exhibicion de arte",
  ],
  openGraph: {
    title: "VANTAGE | Digital Art Gallery",
    description: "Una experiencia inmersiva de arte digital.",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "VANTAGE Gallery",
    description: "Curated digital art.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#111",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "20px",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            },
          }}
        />
      </body>
    </html>
  );
}
