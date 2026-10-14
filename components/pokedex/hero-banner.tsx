"use client"

import { ArrowDownIcon, SearchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Kbd } from "@/components/ui/kbd"
import { Spotlight } from "@/components/ui/spotlight"
import { PikachuTracker } from "@/components/pokedex/pikachu-tracker"

const HIGHLIGHTS = [
  { value: "1025", label: "Pokémon" },
  { value: "18", label: "Tipos" },
  { value: "9", label: "Generaciones" },
]

export function HeroBanner({ onSearch }: { onSearch: () => void }) {
  return (
    <Card className="relative h-auto w-full gap-0 overflow-hidden rounded-3xl bg-black/[0.96] py-0 ring-white/10 md:h-[560px]">
      <Spotlight
        size={420}
        className="from-yellow-300/30 via-amber-400/15 to-transparent"
      />

      {/* Haz de luz estático + Pokéball de fondo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-0 h-[600px] w-[600px] rotate-[-25deg] bg-[conic-gradient(from_200deg_at_50%_0%,transparent_0deg,rgba(255,255,255,0.12)_20deg,transparent_40deg)] blur-2xl md:left-40"
      />
      <PokeballOutline className="pointer-events-none absolute -bottom-32 -left-24 size-[420px] text-white/[0.04]" />

      <div className="flex h-full flex-col md:flex-row">
        <div className="relative z-10 flex flex-1 flex-col justify-center gap-6 p-8 md:p-12">
          <Badge
            variant="outline"
            className="h-6 border-white/15 bg-white/5 px-3 text-neutral-300 backdrop-blur"
          >
            <span className="size-1.5 animate-pulse rounded-full bg-red-500" />
            Pokédex interactiva · PokéAPI
          </Badge>

          <h1 className="bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-4xl leading-[1.05] font-bold tracking-tight text-transparent md:text-6xl">
            Atrápalos a todos,
            <br />
            en otra dimensión.
          </h1>

          <p className="max-w-md text-pretty text-neutral-300">
            Explora cada Pokémon como si fuera un fondo de pantalla: arte
            oficial, tipos, estadísticas, habilidades y evoluciones, todo en
            tiempo real.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-neutral-200"
              render={<a href="#pokedex" />}
              nativeButton={false}
            >
              Explorar Pokédex
              <ArrowDownIcon data-icon="inline-end" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/15 bg-white/5 text-neutral-200 hover:bg-white/10"
              onClick={onSearch}
            >
              <SearchIcon data-icon="inline-start" />
              Buscar
              <Kbd>⌘K</Kbd>
            </Button>
          </div>

          <dl className="mt-2 flex gap-8">
            {HIGHLIGHTS.map((h) => (
              <div key={h.label}>
                <dt className="text-xs tracking-widest text-neutral-500 uppercase">
                  {h.label}
                </dt>
                <dd className="font-mono text-2xl font-semibold text-neutral-100 tabular-nums">
                  {h.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative h-[340px] flex-1 md:h-full">
          <PikachuTracker className="h-full w-full px-6 pt-10 pb-10 md:px-10 md:pt-16" />
        </div>
      </div>
    </Card>
  )
}

function PokeballOutline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden>
      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="4" />
      <path d="M4 50h30M66 50h30" stroke="currentColor" strokeWidth="4" />
      <circle cx="50" cy="50" r="14" stroke="currentColor" strokeWidth="4" />
    </svg>
  )
}
