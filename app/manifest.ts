import type { MetadataRoute } from "next"

const THEME = "#06060a"

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Pokédex Wallpaper",
    short_name: "Pokédex",
    description:
      "Pokédex interactiva con estética wallpaper: arte oficial, tipos, estadísticas y evoluciones.",
    lang: "es",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: THEME,
    theme_color: THEME,
    categories: ["entertainment", "games"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // Los parámetros los lee PokedexApp al arrancar y luego limpia la URL.
    shortcuts: [
      {
        name: "Buscar Pokémon",
        short_name: "Buscar",
        url: "/?accion=buscar",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Pokémon aleatorio",
        short_name: "Aleatorio",
        url: "/?accion=aleatorio",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Ver a Pikachu",
        short_name: "Pikachu",
        url: "/?pokemon=25",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  }
}
