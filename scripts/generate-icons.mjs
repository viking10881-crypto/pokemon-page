// Genera los iconos de la PWA a partir del logo (Pokéball del banner).
// Uso: node scripts/generate-icons.mjs
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const out = (...p) => path.join(root, ...p)

const BG = "#06060a"

/**
 * Logo en un lienzo de 100×100.
 * - scale: tamaño de la Pokéball respecto al lienzo (zona segura en maskable).
 * - radius: radio de las esquinas del fondo (0 = cuadrado, sin transparencia).
 */
function logoSvg({ size, scale, radius }) {
  const r = 50 * scale
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="glow" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#FFD43B" stop-opacity="0.45"/>
      <stop offset="55%" stop-color="#FFD43B" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#FFD43B" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="top" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ff5a52"/>
      <stop offset="100%" stop-color="#d9261c"/>
    </linearGradient>
    <linearGradient id="bottom" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#d9d9e0"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="${radius}" fill="${BG}"/>
  <rect width="100" height="100" rx="${radius}" fill="url(#glow)"/>
  <g transform="translate(50 50) scale(${r / 40})">
    <circle r="40" fill="url(#bottom)"/>
    <path d="M-40 0 A40 40 0 0 1 40 0 Z" fill="url(#top)"/>
    <path d="M-25 -26 A30 30 0 0 1 8 -34" stroke="#fff" stroke-opacity="0.45" stroke-width="5" stroke-linecap="round" fill="none"/>
    <rect x="-40" y="-4" width="80" height="8" fill="#15151b"/>
    <circle r="40" fill="none" stroke="#15151b" stroke-width="5"/>
    <circle r="14" fill="#15151b"/>
    <circle r="9" fill="#fafafa"/>
    <circle r="5" fill="none" stroke="#d4d4d8" stroke-width="1.5"/>
  </g>
</svg>`
}

const render = (opts) =>
  sharp(Buffer.from(logoSvg(opts))).png({ compressionLevel: 9 }).toBuffer()

/** ICO con PNG embebidos (soportado por todos los navegadores actuales). */
function toIco(pngs) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(pngs.length, 4)
  let offset = 6 + 16 * pngs.length
  const entries = pngs.map(({ size, data }) => {
    const e = Buffer.alloc(16)
    e.writeUInt8(size >= 256 ? 0 : size, 0)
    e.writeUInt8(size >= 256 ? 0 : size, 1)
    e.writeUInt16LE(1, 4) // planos
    e.writeUInt16LE(32, 6) // bits por píxel
    e.writeUInt32LE(data.length, 8)
    e.writeUInt32LE(offset, 12)
    offset += data.length
    return e
  })
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)])
}

await mkdir(out("public/icons"), { recursive: true })

const files = {
  // "any": esquinas redondeadas, Pokéball grande.
  "public/icons/icon-192.png": await render({ size: 192, scale: 0.78, radius: 22 }),
  "public/icons/icon-512.png": await render({ size: 512, scale: 0.78, radius: 22 }),
  // "maskable": cuadrado completo, dibujo dentro del ~80 % central (Android recorta).
  "public/icons/maskable-512.png": await render({ size: 512, scale: 0.6, radius: 0 }),
  // iPhone: 180×180, cuadrado y opaco (iOS aplica su propia máscara).
  "app/apple-icon.png": await sharp(
    await render({ size: 180, scale: 0.72, radius: 0 })
  )
    .flatten({ background: BG })
    .png()
    .toBuffer(),
}

for (const [file, data] of Object.entries(files)) {
  await writeFile(out(file), data)
  console.log("✓", file)
}

const favicon = await Promise.all(
  [16, 32, 48].map(async (size) => ({
    size,
    data: await render({ size, scale: 0.86, radius: 22 }),
  }))
)
await writeFile(out("app/favicon.ico"), toIco(favicon))
console.log("✓ app/favicon.ico")
