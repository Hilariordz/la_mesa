"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export default function FadeIn({ children }: { children: ReactNode }) {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = domRef.current;

    if (!node) {
      setVisible(true);
      return;
    }

    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    // Safety net: if observer does not fire, reveal anyway.
    const fallbackTimer = window.setTimeout(() => setVisible(true), 1200);
    observer.observe(node);

    return () => {
      window.clearTimeout(fallbackTimer);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transform transition-all duration-1000 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}
