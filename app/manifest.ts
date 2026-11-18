import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Costra Pizza",
    short_name: "Costra",
    description: "Pizza tipo New York por porciones en Cipolletti.",
    start_url: "/",
    display: "standalone",
    background_color: "#120E0B",
    theme_color: "#120E0B",
    lang: "es-AR",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
