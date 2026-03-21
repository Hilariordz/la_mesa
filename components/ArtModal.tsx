"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import LikeButton from "./LikeButton";

interface Art {
  id: number;
  title: string;
  artist: string;
  url: string;
}

export default function ArtModal({
  art,
  onClose,
  onNext,
}: {
  art: Art;
  onClose: () => void;
  onNext: () => void;
}) {
  const [isAutoplay, setIsAutoplay] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `VANTAGE | ${art.title}`,
          text: `Mira esta obra de ${art.artist} en VANTAGE Art Gallery.`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error al compartir", error);
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      alert(`Copiado al portapapeles: ${window.location.href}`);
    } catch {
      alert("No se pudo compartir automaticamente en este navegador.");
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    if (isAutoplay) {
      intervalId = setInterval(() => {
        onNext();
        toast("Siguiente obra...", { icon: "🖼️" });
      }, 5000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAutoplay, onNext]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle de ${art.title}`}
    >
      <button
        onClick={onClose}
        className="absolute right-6 top-6 z-[60] text-4xl font-light text-white/50 hover:text-white"
        type="button"
        aria-label="Cerrar detalle"
      >
        x
      </button>

      <div
        className="flex w-full max-w-5xl flex-col items-center gap-10 md:flex-row"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="w-full md:w-2/3">
          <div className="relative h-[75vh] w-full">
            <Image
              src={art.url}
              alt={art.title}
              fill
              sizes="(max-width: 768px) 100vw, 66vw"
              className="rounded-sm object-contain shadow-2xl"
            />
          </div>
        </div>

        <div className="w-full space-y-6 text-left md:w-1/3">
          <div className="space-y-1">
            <h2 className="text-5xl font-black uppercase italic leading-none tracking-tighter">{art.title}</h2>
            <p className="text-xl font-light italic text-gray-500">by {art.artist}</p>
          </div>
          <div className="h-px w-full bg-white/10" />

          <div className="flex items-center gap-4">
            <LikeButton id={art.id} />

            <button
              onClick={() => setIsAutoplay((value) => !value)}
              className={`flex items-center justify-center rounded-full border p-3 transition-all ${
                isAutoplay
                  ? "border-green-400/40 bg-green-500/20 text-green-200"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
              type="button"
              aria-label={isAutoplay ? "Pausar presentacion" : "Iniciar presentacion"}
            >
              {isAutoplay ? "Pause" : "Play"}
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-3 transition-all hover:bg-white/10"
              type="button"
              aria-label="Compartir obra"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5a2.25 2.25 0 1 1 0-2.186m0 2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                />
              </svg>
            </button>
          </div>

          <p className="text-xs uppercase leading-loose tracking-widest text-gray-600">
            Curada digitalmente para VANTAGE. Disponible para visualizacion offline una vez cargada.
          </p>
        </div>
      </div>
    </div>
  );
}
