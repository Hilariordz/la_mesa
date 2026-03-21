"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function LikeButton({ id }: { id: number }) {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`vantage-like-${id}`);
    if (saved) {
      setLiked(true);
    }
  }, [id]);

  const toggleLike = () => {
    const newState = !liked;
    setLiked(newState);

    if (newState) {
      localStorage.setItem(`vantage-like-${id}`, "true");
      toast.success("Anadido a tu coleccion", { icon: "✨" });
    } else {
      localStorage.removeItem(`vantage-like-${id}`);
      toast.error("Eliminado de la coleccion");
    }

    window.dispatchEvent(new Event("vantage-likes-updated"));
  };

  return (
    <button
      onClick={toggleLike}
      className={`mt-2 rounded-full p-2 transition-all ${liked ? "scale-110 bg-red-500" : "bg-white/10 hover:bg-white/20"}`}
      aria-label={liked ? "Quitar like" : "Dar like"}
      type="button"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill={liked ? "white" : "none"}
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
