import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "La Mesa — Restaurante",
    short_name: "La Mesa",
    description: "Pide tu comida y reserva tu mesa desde el móvil.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0f0f0f",
    theme_color: "#e85d26",
    categories: ["food", "lifestyle"],
    icons: [
      {
        src: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcuts: [
      { name: "Ver Menú", url: "/menu", description: "Explorar el menú" },
      { name: "Reservar Mesa", url: "/reservar", description: "Hacer una reservación" },
    ],
  };
}
