"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("splash_shown")) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => {
      setHiding(true);
      setTimeout(() => {
        setVisible(false);
        sessionStorage.setItem("splash_shown", "1");
      }, 800);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#0c0b09",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: hiding ? 0 : 1,
        transition: "opacity 0.8s cubic-bezier(0.4,0,0.2,1)",
        pointerEvents: hiding ? "none" : "all",
      }}
    >
      {/* Línea decorativa superior */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "2px",
        background: "linear-gradient(90deg, transparent 0%, #c8922a 50%, transparent 100%)",
        animation: "lineIn 1.2s cubic-bezier(0.16,1,0.3,1) forwards",
        transformOrigin: "center",
      }} />

      {/* Contenido central */}
      <div style={{ textAlign: "center", animation: "fadeUp 0.9s 0.2s cubic-bezier(0.16,1,0.3,1) both" }}>

        {/* Ornamento superior */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          marginBottom: "28px",
          opacity: 0.5,
          animation: "fadeUp 0.9s 0.4s cubic-bezier(0.16,1,0.3,1) both",
        }}>
          <div style={{ width: "40px", height: "1px", background: "#c8922a" }} />
          <span style={{ color: "#c8922a", fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "Inter, sans-serif" }}>
            Est. 2024
          </span>
          <div style={{ width: "40px", height: "1px", background: "#c8922a" }} />
        </div>

        {/* Nombre */}
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(48px, 12vw, 72px)",
          fontWeight: 700,
          fontStyle: "italic",
          color: "#f5ede0",
          lineHeight: 1,
          letterSpacing: "-0.02em",
          margin: 0,
        }}>
          La Mesa
        </h1>

        {/* Subtítulo */}
        <p style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "11px",
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "#4a4438",
          marginTop: "16px",
          fontWeight: 500,
          animation: "fadeUp 0.9s 0.5s cubic-bezier(0.16,1,0.3,1) both",
        }}>
          Restaurante &amp; Bar
        </p>
      </div>

      {/* Barra de progreso */}
      <div style={{
        position: "absolute",
        bottom: "48px",
        width: "120px",
        height: "1px",
        background: "rgba(255,240,210,0.08)",
        borderRadius: "1px",
        overflow: "hidden",
        animation: "fadeUp 0.6s 0.6s both",
      }}>
        <div style={{
          height: "100%",
          background: "linear-gradient(90deg, #c8922a, #e8b04a)",
          borderRadius: "1px",
          animation: "progress 2.2s 0.3s cubic-bezier(0.4,0,0.2,1) forwards",
          width: "0%",
        }} />
      </div>

      {/* Línea decorativa inferior */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: "1px",
        background: "linear-gradient(90deg, transparent 0%, rgba(200,146,42,0.3) 50%, transparent 100%)",
      }} />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lineIn {
          from { transform: scaleX(0); opacity: 0; }
          to   { transform: scaleX(1); opacity: 1; }
        }
        @keyframes progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
