"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";

/* ─── Nav interno (app) ─── */
const APP_NAV = [
  { href: "/menu",     label: "Menú",     icon: "🍽️" },
  { href: "/pedidos",  label: "Pedidos",  icon: "📋" },
  { href: "/reservar", label: "Reservar", icon: "🪑" },
];

/* ─── Nav del landing ─── */
const LANDING_NAV = [
  { href: "/",           label: "Home" },
  { href: "/#nosotros",  label: "Nosotros" },
  { href: "/#contacto",  label: "Contacto" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser]       = useState<{ email?: string } | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isLanding = pathname === "/";

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  /* ════════════════════════════════
     LANDING NAVBAR
  ════════════════════════════════ */
  if (isLanding) {
    return (
      <>
        <header
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
            scrolled ? "glass border-b border-[var(--border)] py-0" : "bg-transparent py-2"
          }`}
        >
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-8">
            {/* Logo */}
            <Link
              href="/"
              className="font-display text-xl font-bold italic text-white hover:text-[var(--accent-light)] transition-colors flex-shrink-0"
            >
              La Mesa
            </Link>

            {/* Links desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {LANDING_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative px-4 py-2 text-sm text-white/70 hover:text-white transition-colors group"
                >
                  {item.label}
                  {/* Underline animado */}
                  <span className="absolute bottom-1 left-4 right-4 h-px bg-[var(--accent)] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              ))}
            </nav>

            {/* Auth buttons */}
            <div className="hidden md:flex items-center gap-3 flex-shrink-0">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Salir
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-5 py-2 text-sm font-medium text-white border border-white/25 rounded-full hover:border-white/60 hover:text-white transition-all duration-200"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/register"
                    className="btn-primary text-sm py-2 px-5"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>

            {/* Hamburger mobile */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden flex flex-col gap-1.5 p-2"
              aria-label="Menú"
            >
              <span className={`w-5 h-px bg-white transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`w-5 h-px bg-white transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`w-5 h-px bg-white transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>

          {/* Mobile menu */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ${
              menuOpen ? "max-h-96 border-t border-[var(--border)]" : "max-h-0"
            } glass`}
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              {LANDING_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="py-3 text-sm text-white/70 hover:text-white border-b border-[var(--border)] last:border-0 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex gap-3 pt-4">
                <Link href="/login" onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center py-2.5 text-sm border border-white/25 rounded-full text-white/70 hover:text-white hover:border-white/50 transition-all">
                  Iniciar sesión
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center btn-primary text-sm py-2.5">
                  Registrarse
                </Link>
              </div>
            </div>
          </div>
        </header>
      </>
    );
  }

  /* ════════════════════════════════
     APP NAVBAR (vistas internas)
  ════════════════════════════════ */
  return (
    <>
      {/* Top bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? "glass border-b border-[var(--border)]" : "glass border-b border-[var(--border)]"
        }`}
      >
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-lg font-bold italic text-[var(--text)] hover:text-[var(--accent-light)] transition-colors"
          >
            La Mesa
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-1">
            {APP_NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 text-xs tracking-widest uppercase font-medium transition-colors group ${
                    active ? "text-[var(--accent-light)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {item.label}
                  <span className={`absolute bottom-1 left-4 right-4 h-px bg-[var(--accent)] transition-transform duration-300 origin-left ${
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`} />
                </Link>
              );
            })}
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={handleLogout}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              >
                Salir
              </button>
            ) : (
              <Link
                href="/login"
                className="text-xs px-4 py-2 border border-[var(--border-hover)] rounded-full text-[var(--text-muted)] hover:text-[var(--accent-light)] hover:border-[var(--accent)] transition-all duration-200"
              >
                Ingresar
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Bottom nav mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-[var(--border)] md:hidden">
        <div className="flex max-w-lg mx-auto">
          {APP_NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors relative ${
                  active ? "text-[var(--accent-light)]" : "text-[var(--text-subtle)]"
                }`}
              >
                <span className={`text-xl transition-transform duration-200 ${active ? "scale-110" : ""}`}>
                  {item.icon}
                </span>
                <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[var(--accent)]" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
