# pokemon-page

Pokédex interactiva con estética wallpaper, construida con Next.js, shadcn/ui y [PokéAPI](https://pokeapi.co).

## Características

- Banner con un Pikachu animado que sigue el cursor con la mirada (clic para lanzar un rayo).
- Tarjetas tipo fondo de pantalla con inclinación 3D; el fondo se tiñe con el tipo del Pokémon.
- Filtros por nombre/número, generación y tipo, variocolor (shiny) y búsqueda con ⌘K.
- Ficha con descripción, habilidades, estadísticas y evoluciones; descarga del wallpaper en 1080×1920.
- PWA instalable (Android/iPhone) con página sin conexión y accesos directos.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run typecheck && npm run lint
```

Regenerar los iconos de la PWA:

```bash
node scripts/generate-icons.mjs
```

El service worker solo se registra en producción (`npm run build && npm start`).
