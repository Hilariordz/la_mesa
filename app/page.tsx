"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative h-screen min-h-[600px] overflow-hidden">
        {/* Imagen con parallax suave */}
        <div
          className="absolute inset-0 scale-110"
          style={{ transform: `translateY(${scrollY * 0.25}px) scale(1.1)` }}
        >
          <img
            src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1600&q=90"
            alt="hero"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Gradiente editorial — más oscuro abajo */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

        {/* Contenido — alineado a la izquierda */}
        <div className="absolute inset-0 flex flex-col justify-end pb-16 md:pb-24 px-6 md:px-16 max-w-5xl">
          <div className="animate-fade-up">
            {/* Línea decorativa */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-[var(--accent)]" />
              <span className="text-[var(--accent-light)] text-[11px] tracking-[0.2em] uppercase font-medium">
                Abierto ahora
              </span>
            </div>

            <h1 className="font-display text-[clamp(3.5rem,10vw,7rem)] font-bold italic text-white leading-[0.9] mb-6 tracking-tight">
              La<br />Mesa
            </h1>

            <p className="text-white/60 text-sm md:text-base max-w-xs leading-relaxed mb-10">
              Explora nuestro menú, haz tu pedido y reserva tu mesa — todo desde aquí.
            </p>

            <div className="flex items-center gap-4">
              <Link
                href="/menu"
                className="btn-primary text-sm"
              >
                Ver Menú
              </Link>
              <Link
                href="/reservar"
                className="group flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                Reservar Mesa
                <span className="w-6 h-px bg-white/40 group-hover:w-10 group-hover:bg-white transition-all duration-300" />
              </Link>
            </div>
          </div>
        </div>

        {/* Número decorativo */}
        <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-3 opacity-20">
          <div className="w-px h-16 bg-white" />
          <span className="text-white text-[10px] tracking-[0.3em] uppercase rotate-90 origin-center translate-y-8">
            Scroll
          </span>
        </div>
      </section>

      {/* ─── FRANJA ESTADÍSTICAS ─── */}
      <section className="bg-[var(--accent)] py-5 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-6 overflow-x-auto no-scrollbar">
          {[
            { num: "12+", label: "Años de experiencia" },
            { num: "80+", label: "Platillos en carta" },
            { num: "4.9", label: "Calificación promedio" },
            { num: "200", label: "Mesas reservadas hoy" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-4 flex-shrink-0">
              <div>
                <p className="font-display text-2xl font-bold text-white leading-none">{s.num}</p>
                <p className="text-white/70 text-[11px] mt-0.5 whitespace-nowrap">{s.label}</p>
              </div>
              {i < 3 && <div className="w-px h-8 bg-white/30 flex-shrink-0" />}
            </div>
          ))}
        </div>
      </section>

      {/* ─── ABOUT — layout asimétrico ─── */}
      <section className="bg-[var(--bg)] py-24 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_1.1fr] gap-0 items-stretch">

          {/* Imagen con overlap */}
          <div className="relative md:-mr-8 z-10">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=900&q=90"
                alt="platillo"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Card flotante */}
            <div className="absolute -bottom-6 -right-4 md:-right-10 bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-5 py-4 shadow-2xl">
              <p className="font-display text-3xl font-bold text-[var(--accent-light)]">12+</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Años sirviendo</p>
            </div>
          </div>

          {/* Texto */}
          <div className="bg-[var(--surface)] rounded-2xl p-8 md:p-12 flex flex-col justify-center mt-8 md:mt-0">
            <p className="font-display italic text-[var(--accent-light)] text-sm mb-4">
              Sobre nosotros
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--text)] leading-tight mb-6">
              Disfruta un viaje excepcional de sabores
            </h2>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-8">
              En La Mesa combinamos ingredientes frescos de temporada, técnicas culinarias
              de autor y una atmósfera cálida para ofrecerte una experiencia que va más
              allá de un simple platillo.
            </p>

            <ul className="flex flex-col gap-3 mb-10">
              {[
                "Ingredientes frescos seleccionados cada mañana",
                "Menú de temporada actualizado semanalmente",
                "Reservaciones con confirmación en minutos",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[var(--text-muted)]">
                  <span className="w-4 h-4 rounded-full bg-[var(--accent-dim)] border border-[var(--accent)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[var(--accent-light)] text-[9px] font-bold">✓</span>
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <Link href="/menu" className="btn-outline self-start text-sm">
              Explorar carta →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SERVICIOS — grid editorial ─── */}
      <section className="bg-[var(--surface)] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <p className="font-display italic text-[var(--accent-light)] text-sm mb-3">Servicios</p>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-[var(--text)] leading-tight">
                Prueba nuestra<br />oferta especial
              </h2>
            </div>
            <Link href="/menu" className="btn-primary text-sm self-start md:self-auto flex-shrink-0">
              Ver Menú
            </Link>
          </div>

          {/* Cards — tamaños distintos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card grande */}
            <div className="md:col-span-2 relative rounded-2xl overflow-hidden min-h-[280px] group">
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=85"
                alt="Cocina"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <p className="text-[var(--accent-light)] text-xs tracking-widest uppercase mb-2">Especialidad</p>
                <h3 className="font-display text-2xl font-bold italic text-white">Cocina de Autor</h3>
                <p className="text-white/60 text-xs mt-1 max-w-xs">
                  Platillos únicos creados por nuestros chefs con técnicas internacionales.
                </p>
              </div>
            </div>

            {/* Columna derecha — 2 cards pequeñas */}
            <div className="flex flex-col gap-4">
              {[
                {
                  img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=85",
                  tag: "Ambiente",
                  title: "Espacio Único",
                  desc: "Diseño cálido y elegante para cada ocasión.",
                },
                {
                  img: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&q=85",
                  tag: "Frescura",
                  title: "Ingredientes del Día",
                  desc: "Selección diaria del mercado local.",
                },
              ].map((c) => (
                <div key={c.title} className="relative rounded-2xl overflow-hidden min-h-[130px] group flex-1">
                  <img
                    src={c.img}
                    alt={c.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4">
                    <p className="text-[var(--accent-light)] text-[10px] tracking-widest uppercase mb-1">{c.tag}</p>
                    <h3 className="font-display text-base font-bold italic text-white">{c.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── NOSOTROS ─── */}
      <section id="nosotros" className="bg-[var(--bg)] py-28 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="max-w-xl mb-20">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-[var(--accent)]" />
              <p className="font-display italic text-[var(--accent-light)] text-sm">Nuestra historia</p>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[var(--text)] leading-tight mb-6">
              Más de una década<br />creando momentos
            </h2>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
              Desde 2013, La Mesa ha sido un referente de la gastronomía local.
              Nuestro compromiso con la excelencia y la pasión por crear experiencias
              memorables nos ha convertido en el lugar favorito de miles de comensales.
            </p>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                num: "01",
                icon: "👨‍🍳",
                title: "Chefs Expertos",
                desc: "Equipo con más de 15 años de experiencia en cocina internacional y de autor.",
                stat: "15+ años",
              },
              {
                num: "02",
                icon: "🌱",
                title: "Ingredientes Locales",
                desc: "Trabajamos con productores locales para garantizar frescura y calidad en cada platillo.",
                stat: "100% fresco",
              },
              {
                num: "03",
                icon: "❤️",
                title: "Pasión por Servir",
                desc: "Cada platillo es preparado con dedicación y amor por lo que hacemos.",
                stat: "4.9 ★",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group relative flex flex-col p-7 rounded-2xl border transition-all duration-300 overflow-hidden"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              >
                {/* Número decorativo de fondo */}
                <span
                  className="absolute top-4 right-5 font-display text-6xl font-bold leading-none select-none transition-opacity duration-300 group-hover:opacity-100"
                  style={{ color: "var(--accent-dim)", opacity: 0.6 }}
                >
                  {item.num}
                </span>

                {/* Icono */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-6 flex-shrink-0"
                  style={{ background: "var(--accent-dim)", border: "1px solid rgba(200,146,42,0.2)" }}
                >
                  {item.icon}
                </div>

                {/* Texto */}
                <h3 className="font-display text-lg font-bold mb-2" style={{ color: "var(--text)" }}>
                  {item.title}
                </h3>
                <p className="text-xs leading-relaxed flex-1" style={{ color: "var(--text-muted)" }}>
                  {item.desc}
                </p>

                {/* Stat */}
                <div className="mt-6 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
                  <span className="font-display text-sm font-bold" style={{ color: "var(--accent-light)" }}>
                    {item.stat}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA RESERVA ─── */}
      <section className="relative py-28 px-6 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=1600&q=85"
          alt="reserva"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/72" />

        {/* Líneas decorativas */}
        <div className="absolute top-8 left-8 w-16 h-16 border-t border-l border-[var(--accent)] opacity-40 rounded-tl-lg" />
        <div className="absolute bottom-8 right-8 w-16 h-16 border-b border-r border-[var(--accent)] opacity-40 rounded-br-lg" />

        <div className="relative z-10 max-w-xl mx-auto text-center">
          <p className="font-display italic text-[var(--accent-light)] text-sm mb-4">Reservaciones</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
            ¿Listo para vivir la experiencia?
          </h2>
          <p className="text-white/55 text-sm leading-relaxed mb-10 max-w-sm mx-auto">
            Asegura tu lugar y disfruta una noche que recordarás. Confirmación inmediata.
          </p>
          <Link href="/reservar" className="btn-primary text-sm px-10">
            Reservar ahora
          </Link>
        </div>
      </section>

      {/* ─── CONTACTO ─── */}
      <section id="contacto" className="bg-[var(--surface)] py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-display italic text-[var(--accent-light)] text-sm mb-3">Encuéntranos</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[var(--text)] leading-tight">
              Contacto
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Info */}
            <div className="flex flex-col gap-6">
              {[
                {
                  icon: "📍",
                  label: "Dirección",
                  value: "Av. Principal 123, Centro Histórico",
                  sub: "Ciudad de México, 06000",
                },
                {
                  icon: "📞",
                  label: "Teléfono",
                  value: "+52 55 1234 5678",
                  sub: "Lun–Dom · 1:00pm – 11:00pm",
                },
                {
                  icon: "✉️",
                  label: "Email",
                  value: "hola@lamesa.com",
                  sub: "Respuesta en menos de 24 horas",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: "var(--accent-dim)", border: "1px solid var(--border)" }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--text-subtle)" }}>
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--text)" }}>
                      {item.value}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {item.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Horarios */}
            <div className="card p-6">
              <h3 className="font-display text-lg font-bold mb-4" style={{ color: "var(--text)" }}>
                Horarios
              </h3>
              <div className="flex flex-col gap-3">
                {[
                  { day: "Lunes – Jueves", hours: "1:00pm – 10:00pm" },
                  { day: "Viernes – Sábado", hours: "1:00pm – 11:00pm" },
                  { day: "Domingo", hours: "12:00pm – 9:00pm" },
                ].map((item) => (
                  <div key={item.day} className="flex justify-between items-center py-2 border-b border-[var(--border)] last:border-0">
                    <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                      {item.day}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: "var(--accent-light)" }}>
                      {item.hours}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-[var(--border)]">
                <Link href="/reservar" className="btn-primary w-full text-sm">
                  Hacer una reserva
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[var(--surface)] border-t border-[var(--border)] px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="font-display text-2xl font-bold italic text-[var(--text)]">La Mesa</span>
            <p className="text-xs text-[var(--text-subtle)] mt-1">Experiencia gastronómica</p>
          </div>
          <div className="flex items-center gap-8">
            {[
              { href: "/menu",    label: "Menú" },
              { href: "/reservar",label: "Reservar" },
              { href: "/pedidos", label: "Pedidos" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-light)] transition-colors tracking-wide">
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[11px] text-[var(--text-subtle)]">© 2025 La Mesa</p>
            <Link href="/admin" className="text-[11px] text-[var(--text-subtle)] hover:text-[var(--text-muted)] transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
