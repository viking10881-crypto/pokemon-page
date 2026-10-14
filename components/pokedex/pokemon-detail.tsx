"use client"

import * as React from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronRightIcon as ArrowIcon,
  DownloadIcon,
  LoaderIcon,
  SparklesIcon,
  Volume2Icon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { TypeBadge } from "@/components/pokedex/type-badge"
import { useAsync } from "@/hooks/use-async"
import {
  artworkUrl,
  fetchAbility,
  fetchEvolutionStages,
  fetchPokemon,
  fetchSpecies,
  formatId,
  formatName,
  MAX_ID,
  type Pokemon,
  type PokemonSpecies,
} from "@/lib/pokeapi"
import { STAT_LABELS, typeMeta, wallpaperGradient } from "@/lib/pokemon-meta"
import { downloadWallpaper } from "@/lib/wallpaper"

type PokemonDetailProps = {
  id: number | null
  onClose: () => void
  onNavigate: (id: number) => void
  shiny: boolean
  onShinyChange: (shiny: boolean) => void
}

export function PokemonDetail({
  id,
  onClose,
  onNavigate,
  shiny,
  onShinyChange,
}: PokemonDetailProps) {
  const { data: pokemon } = useAsync(id ? `pokemon-${id}` : null, () =>
    fetchPokemon(id!)
  )
  const { data: species } = useAsync(id ? `species-${id}` : null, () =>
    fetchSpecies(id!)
  )

  // Navegación con flechas del teclado
  React.useEffect(() => {
    if (!id) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" && id < MAX_ID) onNavigate(id + 1)
      if (event.key === "ArrowLeft" && id > 1) onNavigate(id - 1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [id, onNavigate])

  return (
    <Dialog open={id !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92svh] gap-0 overflow-y-auto rounded-3xl bg-[#0b0b10] p-0 ring-white/10 sm:max-w-5xl md:grid md:grid-cols-[1.1fr_1fr] md:overflow-hidden">
        {id !== null && (
          <>
            <WallpaperPanel
              id={id}
              pokemon={pokemon}
              shiny={shiny}
              onNavigate={onNavigate}
            />
            <InfoPanel
              id={id}
              pokemon={pokemon}
              species={species}
              shiny={shiny}
              onShinyChange={onShinyChange}
              onNavigate={onNavigate}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function WallpaperPanel({
  id,
  pokemon,
  shiny,
  onNavigate,
}: {
  id: number
  pokemon?: Pokemon
  shiny: boolean
  onNavigate: (id: number) => void
}) {
  const name = formatName(pokemon?.name ?? "")

  return (
    <div
      className="relative min-h-[380px] overflow-hidden transition-[background] duration-700 md:min-h-[620px]"
      style={{ background: wallpaperGradient(pokemon?.types ?? []) }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.09)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent)] bg-[size:16px_16px]" />

      <span className="absolute top-2 left-5 font-mono text-[7rem] leading-none font-black tracking-tighter text-white/[0.07] select-none md:text-[9rem]">
        {String(id).padStart(3, "0")}
      </span>

      <span className="absolute top-1/2 right-4 origin-center translate-x-1/2 -translate-y-1/2 rotate-90 text-6xl font-black tracking-tighter whitespace-nowrap text-transparent uppercase [-webkit-text-stroke:1.5px_rgba(255,255,255,0.18)] select-none md:text-7xl">
        {name}
      </span>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${id}-${shiny}`}
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          className="absolute inset-10 md:inset-14"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative size-full"
          >
            <Image
              src={artworkUrl(id, shiny)}
              alt={name}
              fill
              priority
              sizes="(min-width: 768px) 520px, 90vw"
              className="object-contain drop-shadow-[0_30px_35px_rgba(0,0,0,0.6)]"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-white/15 bg-black/30 text-white backdrop-blur hover:bg-black/50"
          disabled={id <= 1}
          onClick={() => onNavigate(id - 1)}
          aria-label="Pokémon anterior"
        >
          <ChevronLeftIcon />
        </Button>
        <span className="rounded-full bg-black/30 px-3 py-1 font-mono text-xs text-white/60 backdrop-blur">
          ← → para navegar
        </span>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-white/15 bg-black/30 text-white backdrop-blur hover:bg-black/50"
          disabled={id >= MAX_ID}
          onClick={() => onNavigate(id + 1)}
          aria-label="Pokémon siguiente"
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  )
}

function InfoPanel({
  id,
  pokemon,
  species,
  shiny,
  onShinyChange,
  onNavigate,
}: {
  id: number
  pokemon?: Pokemon
  species?: PokemonSpecies
  shiny: boolean
  onShinyChange: (shiny: boolean) => void
  onNavigate: (id: number) => void
}) {
  const [downloading, setDownloading] = React.useState(false)

  const playCry = () => {
    if (!pokemon?.cry) return
    const audio = new Audio(pokemon.cry)
    audio.volume = 0.35
    void audio.play()
  }

  const handleDownload = async () => {
    if (!pokemon) return
    setDownloading(true)
    try {
      await downloadWallpaper(pokemon, shiny)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-col gap-5 p-6 md:overflow-y-auto md:p-8">
      <header className="flex flex-col gap-2 pr-8">
        <span className="font-mono text-sm text-muted-foreground tabular-nums">
          {formatId(id)}
        </span>
        <DialogTitle className="text-3xl font-bold tracking-tight md:text-4xl">
          {pokemon ? formatName(pokemon.name) : "Cargando…"}
        </DialogTitle>
        <DialogDescription>
          {species?.genus ?? "Cargando especie…"}
        </DialogDescription>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {pokemon?.types.map((t) => <TypeBadge key={t} type={t} />)}
          {species?.isLegendary && (
            <Badge variant="outline" className="h-6 border-amber-400/40 text-amber-300">
              Legendario
            </Badge>
          )}
          {species?.isMythical && (
            <Badge variant="outline" className="h-6 border-fuchsia-400/40 text-fuchsia-300">
              Singular
            </Badge>
          )}
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <div className="mr-auto flex items-center gap-2">
          <Switch id="shiny" checked={shiny} onCheckedChange={onShinyChange} />
          <Label htmlFor="shiny" className="gap-1.5">
            <SparklesIcon className="size-3.5 text-amber-300" />
            Variocolor
          </Label>
        </div>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                onClick={playCry}
                disabled={!pokemon?.cry}
                aria-label="Reproducir grito"
              />
            }
          >
            <Volume2Icon />
          </TooltipTrigger>
          <TooltipContent>Escuchar su grito</TooltipContent>
        </Tooltip>
        <Button variant="outline" onClick={handleDownload} disabled={!pokemon || downloading}>
          {downloading ? (
            <LoaderIcon data-icon="inline-start" className="animate-spin" />
          ) : (
            <DownloadIcon data-icon="inline-start" />
          )}
          Wallpaper
        </Button>
      </div>

      <Separator />

      <Tabs defaultValue="info" className="gap-4">
        <TabsList className="w-full">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          <TabsTrigger value="evolution">Evolución</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="flex flex-col gap-5">
          {species ? (
            <p className="leading-relaxed text-pretty text-muted-foreground">
              {species.flavorText ?? "Sin descripción disponible."}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          )}

          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Metric label="Altura" value={pokemon && `${pokemon.height / 10} m`} />
            <Metric label="Peso" value={pokemon && `${pokemon.weight / 10} kg`} />
            <Metric label="Generación" value={species?.generation} />
            <Metric label="Exp. base" value={pokemon?.baseExperience ?? (pokemon && "—")} />
          </dl>

          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Habilidades
            </h4>
            {pokemon?.abilities.map((a) => (
              <AbilityItem key={a.name} name={a.name} hidden={a.hidden} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stats">
          {pokemon ? <Stats pokemon={pokemon} /> : <Skeleton className="h-56 w-full" />}
        </TabsContent>

        <TabsContent value="evolution">
          {species?.evolutionChainUrl ? (
            <Evolution
              url={species.evolutionChainUrl}
              currentId={id}
              shiny={shiny}
              onNavigate={onNavigate}
            />
          ) : (
            <Skeleton className="h-32 w-full" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Metric({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-muted/40 p-3 ring-1 ring-white/5">
      <dt className="text-[0.7rem] tracking-wider text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1 font-mono text-base font-semibold tabular-nums">
        {value ?? <Skeleton className="h-5 w-12" />}
      </dd>
    </div>
  )
}

function AbilityItem({ name, hidden }: { name: string; hidden: boolean }) {
  const { data } = useAsync(`ability-${name}`, () => fetchAbility(name))

  return (
    <div className="rounded-xl bg-muted/40 p-3 ring-1 ring-white/5">
      <div className="flex items-center gap-2">
        <span className="font-medium">{data?.name ?? formatName(name)}</span>
        {hidden && (
          <Badge variant="secondary" className="text-[0.65rem]">
            Oculta
          </Badge>
        )}
      </div>
      {data ? (
        data.description && (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {data.description}
          </p>
        )
      ) : (
        <Skeleton className="mt-2 h-3 w-3/4" />
      )}
    </div>
  )
}

function Stats({ pokemon }: { pokemon: Pokemon }) {
  const color = typeMeta(pokemon.types[0]).color
  const total = pokemon.stats.reduce((sum, s) => sum + s.value, 0)

  return (
    <div className="flex flex-col gap-3" style={{ "--bar": color } as React.CSSProperties}>
      {pokemon.stats.map((stat, i) => (
        <div key={stat.name} className="grid grid-cols-[6rem_2.5rem_1fr] items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {STAT_LABELS[stat.name] ?? stat.name}
          </span>
          <span className="text-right font-mono text-sm font-semibold tabular-nums">
            {stat.value}
          </span>
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Progress
              value={Math.min(100, (stat.value / 180) * 100)}
              aria-label={STAT_LABELS[stat.name]}
              className="[&_[data-slot=progress-indicator]]:bg-(--bar) [&_[data-slot=progress-track]]:h-2"
            />
          </motion.div>
        </div>
      ))}
      <Separator className="my-1" />
      <div className="grid grid-cols-[6rem_2.5rem_1fr] items-center gap-3">
        <span className="text-xs font-medium">Total</span>
        <span className="text-right font-mono text-sm font-bold tabular-nums">{total}</span>
      </div>
    </div>
  )
}

function Evolution({
  url,
  currentId,
  shiny,
  onNavigate,
}: {
  url: string
  currentId: number
  shiny: boolean
  onNavigate: (id: number) => void
}) {
  const { data: stages } = useAsync(url, () => fetchEvolutionStages(url))

  if (!stages) return <Skeleton className="h-32 w-full" />
  if (stages.length === 1 && stages[0].length === 1) {
    return (
      <p className="text-sm text-muted-foreground">Este Pokémon no evoluciona.</p>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {stages.map((stage, i) => (
        <React.Fragment key={i}>
          {i > 0 && <ArrowIcon className="size-4 shrink-0 text-muted-foreground" />}
          <div className="flex flex-col gap-2">
            {stage.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onNavigate(p.id)}
                data-active={p.id === currentId}
                className="group flex w-24 flex-col items-center rounded-2xl bg-muted/40 p-2 ring-1 ring-white/5 transition hover:bg-muted data-[active=true]:ring-2 data-[active=true]:ring-white/40"
              >
                <div className="relative size-16">
                  <Image
                    src={artworkUrl(p.id, shiny)}
                    alt={formatName(p.name)}
                    fill
                    sizes="64px"
                    className="object-contain transition-transform group-hover:scale-110"
                  />
                </div>
                <span className="mt-1 w-full truncate text-center text-xs font-medium">
                  {formatName(p.name)}
                </span>
              </button>
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}
