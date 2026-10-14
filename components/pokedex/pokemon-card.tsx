"use client"

import * as React from "react"
import Image from "next/image"
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion"

import { Skeleton } from "@/components/ui/skeleton"
import { TypeBadge } from "@/components/pokedex/type-badge"
import { useAsync } from "@/hooks/use-async"
import {
  artworkUrl,
  fetchPokemon,
  formatId,
  formatName,
  type PokemonIndexEntry,
} from "@/lib/pokeapi"
import { wallpaperGradient } from "@/lib/pokemon-meta"
import { cn } from "@/lib/utils"

type PokemonCardProps = {
  entry: PokemonIndexEntry
  shiny: boolean
  onOpen: (id: number) => void
  onHover: (types: string[]) => void
}

// memo: el hover de una tarjeta cambia el fondo global y no debe re-renderizar las demás.
export const PokemonCard = React.memo(function PokemonCard({
  entry,
  shiny,
  onOpen,
  onHover,
}: PokemonCardProps) {
  const { data: pokemon } = useAsync(`pokemon-${entry.id}`, () =>
    fetchPokemon(entry.id)
  )
  const [imageLoaded, setImageLoaded] = React.useState(false)
  const reduceMotion = useReducedMotion()

  // Inclinación 3D + reflejo que sigue al cursor.
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const spring = { stiffness: 200, damping: 20 }
  const rotateX = useSpring(useTransform(py, [0, 1], [9, -9]), spring)
  const rotateY = useSpring(useTransform(px, [0, 1], [-9, 9]), spring)
  const glareX = useTransform(px, (v) => `${v * 100}%`)
  const glareY = useTransform(py, (v) => `${v * 100}%`)
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.16), transparent 55%)`

  const handleMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (reduceMotion) return
    const rect = event.currentTarget.getBoundingClientRect()
    px.set((event.clientX - rect.left) / rect.width)
    py.set((event.clientY - rect.top) / rect.height)
  }

  const handleLeave = () => {
    px.set(0.5)
    py.set(0.5)
  }

  const name = formatName(entry.name)
  const types = pokemon?.types ?? []

  return (
    <div className="[perspective:1000px]">
      <motion.button
        type="button"
        onClick={() => onOpen(entry.id)}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        onPointerEnter={() => types.length && onHover(types)}
        onFocus={() => types.length && onHover(types)}
        style={{
          rotateX: reduceMotion ? 0 : rotateX,
          rotateY: reduceMotion ? 0 : rotateY,
          background: wallpaperGradient(types),
        }}
        className="group relative block aspect-[3/4] w-full overflow-hidden rounded-3xl text-left ring-1 ring-white/10 transition-shadow duration-300 outline-none [transform-style:preserve-3d] hover:shadow-2xl hover:shadow-black/60 focus-visible:ring-2 focus-visible:ring-white/70"
        aria-label={`Ver ${name}`}
      >
        {/* Patrón de puntos tipo wallpaper */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.09)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_85%)] bg-[size:14px_14px]" />

        {/* Número gigante */}
        <span className="absolute -top-3 -right-1 font-mono text-[5.5rem] leading-none font-black tracking-tighter text-white/[0.07] select-none">
          {String(entry.id).padStart(3, "0")}
        </span>

        {/* Nombre en contorno detrás del arte */}
        <span className="absolute inset-x-0 top-[34%] overflow-hidden text-center text-5xl font-black tracking-tighter whitespace-nowrap text-transparent uppercase [-webkit-text-stroke:1px_rgba(255,255,255,0.16)] select-none">
          {name}
        </span>

        {/* Arte oficial */}
        <div className="absolute inset-x-5 top-6 bottom-24 [transform:translateZ(40px)]">
          {/* Sombra de suelo: degradado en vez de filter: drop-shadow (mucho más barato al hacer scroll) */}
          <div className="absolute inset-x-[15%] bottom-0 h-6 rounded-[50%] bg-[radial-gradient(closest-side,rgba(0,0,0,0.55),transparent)] transition-transform duration-500 group-hover:scale-x-110" />
          {!imageLoaded && (
            <Skeleton className="absolute inset-6 rounded-full bg-white/5" />
          )}
          <Image
            src={artworkUrl(entry.id, shiny)}
            alt={name}
            fill
            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 45vw"
            onLoad={() => setImageLoaded(true)}
            className={cn(
              "object-contain transition-[transform,opacity] duration-500 group-hover:scale-110 group-hover:-rotate-2",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
          />
        </div>

        {/* Reflejo */}
        <motion.div
          aria-hidden
          style={{ background: glare }}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        {/* Panel inferior de cristal */}
        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 rounded-2xl bg-gradient-to-t from-black/70 to-black/45 p-3 ring-1 ring-white/10 [transform:translateZ(30px)]">
          <div className="min-w-0">
            <p className="font-mono text-[0.7rem] text-white/50 tabular-nums">
              {formatId(entry.id)}
            </p>
            <h3 className="truncate text-base font-semibold text-white">
              {name}
            </h3>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {pokemon ? (
              pokemon.types.map((t) => <TypeBadge key={t} type={t} compact />)
            ) : (
              <Skeleton className="h-5 w-14 rounded-full bg-white/10" />
            )}
          </div>
        </div>
      </motion.button>
    </div>
  )
})

export function PokemonCardSkeleton() {
  return <Skeleton className="aspect-[3/4] w-full rounded-3xl bg-white/5" />
}
