import { artworkUrl, formatId, formatName, type Pokemon } from "@/lib/pokeapi"
import { typeMeta } from "@/lib/pokemon-meta"

const WIDTH = 1080
const HEIGHT = 1920

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/** Genera un fondo de pantalla vertical del Pokémon y lo descarga como PNG. */
export async function downloadWallpaper(pokemon: Pokemon, shiny: boolean) {
  const canvas = document.createElement("canvas")
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas no disponible")

  const a = typeMeta(pokemon.types[0]).color
  const b = typeMeta(pokemon.types[1] ?? pokemon.types[0]).color
  const name = formatName(pokemon.name)

  ctx.fillStyle = "#07070a"
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  const glowA = ctx.createRadialGradient(540, 760, 0, 540, 760, 900)
  glowA.addColorStop(0, `${a}dd`)
  glowA.addColorStop(0.45, `${a}40`)
  glowA.addColorStop(1, "transparent")
  ctx.fillStyle = glowA
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  const glowB = ctx.createRadialGradient(1080, 1920, 0, 1080, 1920, 1100)
  glowB.addColorStop(0, `${b}aa`)
  glowB.addColorStop(1, "transparent")
  ctx.fillStyle = glowB
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  // Patrón de puntos
  ctx.fillStyle = "rgba(255,255,255,0.08)"
  for (let x = 20; x < WIDTH; x += 36) {
    for (let y = 20; y < HEIGHT * 0.7; y += 36) {
      ctx.beginPath()
      ctx.arc(x, y, 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Número gigante
  ctx.font = "900 380px ui-monospace, monospace"
  ctx.fillStyle = "rgba(255,255,255,0.07)"
  ctx.textAlign = "center"
  ctx.fillText(String(pokemon.id).padStart(3, "0"), 540, 520)

  // Nombre en contorno
  ctx.font = `900 ${Math.min(220, 1700 / name.length)}px system-ui, sans-serif`
  ctx.strokeStyle = "rgba(255,255,255,0.18)"
  ctx.lineWidth = 3
  ctx.strokeText(name.toUpperCase(), 540, 1000)

  const art = await loadImage(artworkUrl(pokemon.id, shiny))
  ctx.shadowColor = "rgba(0,0,0,0.55)"
  ctx.shadowBlur = 60
  ctx.shadowOffsetY = 40
  ctx.drawImage(art, 90, 420, 900, 900)
  ctx.shadowColor = "transparent"

  // Pie
  ctx.textAlign = "left"
  ctx.fillStyle = "rgba(255,255,255,0.55)"
  ctx.font = "500 44px ui-monospace, monospace"
  ctx.fillText(formatId(pokemon.id), 90, 1620)
  ctx.fillStyle = "#fff"
  ctx.font = "800 120px system-ui, sans-serif"
  ctx.fillText(name, 90, 1750)

  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"))
  if (!blob) throw new Error("No se pudo generar la imagen")

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${pokemon.name}${shiny ? "-shiny" : ""}-wallpaper.png`
  link.click()
  URL.revokeObjectURL(url)
}
