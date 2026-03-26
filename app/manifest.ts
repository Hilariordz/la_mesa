import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "La Mesa — Restaurante",
    short_name: "La Mesa",
    description: "Pide tu comida y reserva tu mesa desde el móvil.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0c0b09",
    theme_color: "#c8922a",
    categories: ["food", "lifestyle"],
    icons: [
      {
        src: "/lamesaicon.jpg",
        sizes: "192x192",
        type: "image/jpeg",
        purpose: "any",
      },
      {
        src: "/lamesaicon.jpg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "any",
      },
      {
        src: "/lamesaicon.jpg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Ver Menú", url: "/menu", description: "Explorar el menú" },
      { name: "Reservar Mesa", url: "/reservar", description: "Hacer una reservación" },
    ],
  };
}
