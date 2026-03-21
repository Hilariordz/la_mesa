"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import LikeButton from "@/components/LikeButton";
import ArtModal from "@/components/ArtModal";
import FadeIn from "@/components/FadeIn";
import UserProfile from "@/components/UserProfile";

type Art = {
  id: number;
  title: string;
  artist: string;
  category: string;
  url: string;
};

const EXHIBITS: Art[] = [
  { id: 1, title: "Neon Genesis", artist: "Aether Volti", category: "Cyber", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe" },
  { id: 2, title: "Liquid Dreams", artist: "Soma High", category: "Abstracto", url: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2" },
  { id: 3, title: "Deep Void", artist: "Kuro", category: "Minimalismo", url: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400" },
  { id: 4, title: "Cyber Sunset", artist: "Glitch Master", category: "Cyber", url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e" },
  { id: 5, title: "Prism Flow", artist: "Iris", category: "3D", url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853" },
  { id: 6, title: "Static Echo", artist: "Minimalismo", category: "Minimalismo", url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab" },
];

const CATEGORIES = ["Todos", "Minimalismo", "Abstracto", "3D", "Cyber"] as const;
type Category = (typeof CATEGORIES)[number];

export default function VantageGallery() {
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>("Todos");
  const [view, setView] = useState<"all" | "favorites">("all");
  const [likedIds, setLikedIds] = useState<number[]>([]);
  const [selectedArt, setSelectedArt] = useState<Art | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const updateLikes = () => {
      const likes = EXHIBITS.filter(
        (art) => localStorage.getItem(`vantage-like-${art.id}`) === "true"
      ).map((art) => art.id);
      setLikedIds(likes);
    };

    updateLikes();
    window.addEventListener("storage", updateLikes);
    window.addEventListener("vantage-likes-updated", updateLikes);

    return () => {
      window.removeEventListener("storage", updateLikes);
      window.removeEventListener("vantage-likes-updated", updateLikes);
    };
  }, []);

  const filteredArt = EXHIBITS.filter((art) => {
    const matchesView = view === "all" ? true : likedIds.includes(art.id);
    const matchesCategory =
      activeCategory === "Todos" ? true : art.category === activeCategory;

    return matchesView && matchesCategory;
  });

  const handleNextArt = () => {
    if (!selectedArt) {
      return;
    }

    const source = filteredArt.length > 0 ? filteredArt : EXHIBITS;
    const currentIndex = source.findIndex((art) => art.id === selectedArt.id);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % source.length : 0;
    setSelectedArt(source[nextIndex]);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a]">
        <h1 className="animate-pulse text-4xl font-black uppercase italic tracking-tighter">Vantage</h1>
        <div className="mt-4 h-px w-12 overflow-hidden bg-white/20">
          <div className="animate-slide h-full w-full bg-white" />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] p-6 pb-24 text-white">
      <nav className="sticky top-4 z-30 mb-8 hidden items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-2xl md:flex">
        <div className="text-sm font-black uppercase italic tracking-[0.3em] text-white">Vantage</div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setView("all")}
            className={`rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
              view === "all"
                ? "border-white bg-white text-black"
                : "border-white/20 text-gray-400 hover:border-white/40 hover:text-white"
            }`}
            type="button"
          >
            Explorar
          </button>

          <button
            onClick={() => setView("favorites")}
            className={`rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
              view === "favorites"
                ? "border-white bg-white text-black"
                : "border-white/20 text-gray-400 hover:border-white/40 hover:text-white"
            }`}
            type="button"
          >
            Coleccion ({likedIds.length})
          </button>
        </div>
      </nav>

      <header className="mb-12 text-center">
        <h1 className="text-6xl font-black tracking-tighter uppercase italic">Vantage</h1>

        <div className="mt-8 flex justify-center gap-8 border-b border-white/10 pb-4">
          <button
            onClick={() => setView("all")}
            className={`text-xs uppercase tracking-widest transition-all ${view === "all" ? "font-bold text-white" : "text-gray-500"}`}
            type="button"
          >
            All Exhibits
          </button>
          <button
            onClick={() => setView("favorites")}
            className={`text-xs uppercase tracking-widest transition-all ${view === "favorites" ? "font-bold text-white" : "text-gray-500"}`}
            type="button"
          >
            My Collection ({likedIds.length})
          </button>
        </div>
      </header>

      {view === "favorites" && <UserProfile />}

      {view === "all" && (
        <div className="mask-fade-edges no-scrollbar flex gap-4 overflow-x-auto pb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap rounded-full border px-6 py-2 text-[10px] uppercase tracking-widest transition-all ${
                activeCategory === cat
                  ? "border-white bg-white font-bold text-black"
                  : "border-white/10 text-gray-500 hover:border-white/30"
              }`}
              type="button"
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {filteredArt.length > 0 ? (
        <div className="columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3">
          {filteredArt.map((art) => (
            <FadeIn key={art.id}>
              <div
                onClick={() => setSelectedArt(art)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#111]"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#111]">
                  <Image
                    src={art.url}
                    alt={art.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover grayscale transition-all duration-1000 ease-in-out group-hover:scale-110 group-hover:grayscale-0"
                    priority={art.id <= 3}
                  />
                </div>
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Ver Obra</p>
                    <div onClick={(event) => event.stopPropagation()} className="mt-3">
                      <LikeButton id={art.id} />
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-sm uppercase tracking-widest text-gray-600">
          Your collection is empty.
        </div>
      )}

      {selectedArt && (
        <ArtModal
          art={selectedArt}
          onClose={() => setSelectedArt(null)}
          onNext={handleNextArt}
        />
      )}

      <nav className="fixed bottom-6 left-1/2 z-40 flex w-[90%] max-w-md -translate-x-1/2 justify-around rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-2xl md:hidden">
        <button
          onClick={() => setView("all")}
          className={`text-[10px] font-bold uppercase tracking-[0.2em] ${view === "all" ? "text-white" : "text-gray-500"}`}
          type="button"
        >
          Explorar
        </button>
        <div className="h-4 w-px bg-white/10" />
        <button
          onClick={() => setView("favorites")}
          className={`text-[10px] font-bold uppercase tracking-[0.2em] ${view === "favorites" ? "text-white" : "text-gray-500"}`}
          type="button"
        >
          Coleccion
        </button>
      </nav>
    </main>
  );
}