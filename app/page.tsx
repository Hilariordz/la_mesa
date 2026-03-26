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
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[var(--accent-light)]">
                    <path d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5" />
                  </svg>
                ),
                title: "Chefs Expertos",
                desc: "Equipo con más de 15 años de experiencia en cocina internacional y de autor.",
                stat: "15+ años",
              },
              {
                num: "02",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[var(--accent-light)]">
                    <path d="M12 3c-1.2 5.4-5 7.8-5 12a5 5 0 0 0 10 0c0-4.2-3.8-6.6-5-12Z" />
                    <path d="M12 3c1 3.6 4 5.5 4 9" />
                  </svg>
                ),
                title: "Ingredientes Locales",
                desc: "Trabajamos con productores locales para garantizar frescura y calidad en cada platillo.",
                stat: "100% fresco",
              },
              {
                num: "03",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[var(--accent-light)]">
                    <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                ),
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
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 flex-shrink-0"
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
      <section id="contacto" className="bg-[var(--bg)] py-28 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-[var(--accent)]" />
            <p className="font-display italic text-[var(--accent-light)] text-sm">Visítanos</p>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[var(--text)] leading-tight">
              Estamos aquí<br />para recibirte
            </h2>
            <p className="text-[var(--text-muted)] text-sm max-w-xs leading-relaxed">
              Reserva tu mesa o simplemente pasa. Siempre hay un lugar para ti en La Mesa.
            </p>
          </div>

          {/* Grid principal */}
          <div className="grid md:grid-cols-3 gap-4">

            {/* Dirección — card grande con mapa placeholder */}
            <div className="md:col-span-2 relative rounded-2xl overflow-hidden min-h-[260px] group"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              {/* Fondo tipo mapa abstracto */}
              <div className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: "radial-gradient(circle at 30% 50%, var(--accent) 1px, transparent 1px), radial-gradient(circle at 70% 30%, var(--accent) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }} />
              <div className="absolute inset-0"
                style={{ background: "linear-gradient(135deg, transparent 60%, rgba(200,146,42,0.06) 100%)" }} />

              <div className="relative p-8 h-full flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--accent-dim)", border: "1px solid rgba(200,146,42,0.25)" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" style={{ color: "var(--accent-light)" }}>
                      <path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-subtle)" }}>Ubicación</span>
                </div>

                <div>
                  <p className="font-display text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>
                    Av. Principal 123
                  </p>
                  <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>Centro Histórico</p>
                  <p className="text-xs" style={{ color: "var(--text-subtle)" }}>Ciudad de México, 06000</p>
                </div>

                {/* Línea decorativa */}
                <div className="absolute bottom-0 left-0 right-0 h-px"
                  style={{ background: "linear-gradient(90deg, transparent, var(--accent), transparent)" }} />
              </div>
            </div>

            {/* Columna derecha — teléfono + email */}
            <div className="flex flex-col gap-4">
              <div className="flex-1 rounded-2xl p-6 flex flex-col justify-between"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: "var(--accent-dim)", border: "1px solid rgba(200,146,42,0.25)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" style={{ color: "var(--accent-light)" }}>
                    <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--text-subtle)" }}>Teléfono</p>
                  <p className="font-display text-base font-bold mb-1" style={{ color: "var(--text)" }}>+52 55 1234 5678</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Lun–Dom · 1:00pm – 11:00pm</p>
                </div>
              </div>

              <div className="flex-1 rounded-2xl p-6 flex flex-col justify-between"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: "var(--accent-dim)", border: "1px solid rgba(200,146,42,0.25)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" style={{ color: "var(--accent-light)" }}>
                    <path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--text-subtle)" }}>Email</p>
                  <p className="font-display text-base font-bold mb-1" style={{ color: "var(--text)" }}>hola@lamesa.com</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Respuesta en menos de 24h</p>
                </div>
              </div>
            </div>

            {/* Horarios — fila completa */}
            <div className="md:col-span-3 rounded-2xl p-8"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                  <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: "var(--text-subtle)" }}>Horarios</p>
                  <div className="flex flex-col sm:flex-row gap-6">
                    {[
                      { day: "Lun – Jue", hours: "1:00 – 10:00pm" },
                      { day: "Vie – Sáb", hours: "1:00 – 11:00pm" },
                      { day: "Domingo", hours: "12:00 – 9:00pm" },
                    ].map((item, i) => (
                      <div key={item.day} className="flex items-center gap-4">
                        {i > 0 && <div className="hidden sm:block w-px h-8" style={{ background: "var(--border)" }} />}
                        <div>
                          <p className="text-xs mb-0.5" style={{ color: "var(--text-subtle)" }}>{item.day}</p>
                          <p className="font-display text-base font-bold" style={{ color: "var(--accent-light)" }}>{item.hours}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Link href="/reservar" className="btn-primary text-sm flex-shrink-0 self-start md:self-auto">
                  Reservar mesa →
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
