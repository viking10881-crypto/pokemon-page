"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { RotateCcwIcon, SearchIcon, SparklesIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Kbd } from "@/components/ui/kbd"
import { Label } from "@/components/ui/label"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { AmbientBackground } from "@/components/pokedex/ambient-background"
import { HeroBanner } from "@/components/pokedex/hero-banner"
import {
  PokemonCard,
  PokemonCardSkeleton,
} from "@/components/pokedex/pokemon-card"
import { PokemonDetail } from "@/components/pokedex/pokemon-detail"
import { InstallCard } from "@/components/pwa/install-card"
import { InstallOption } from "@/components/pwa/install-option"
import { useAsync } from "@/hooks/use-async"
import {
  fetchIndex,
  fetchTypeMembers,
  formatId,
  formatName,
  MAX_ID,
} from "@/lib/pokeapi"
import { GENERATIONS, TYPE_NAMES, typeMeta } from "@/lib/pokemon-meta"

const PAGE_SIZE = 24

export function PokedexApp() {
  const index = useAsync("index", fetchIndex)

  const [query, setQuery] = React.useState("")
  const [type, setType] = React.useState<string | null>(null)
  const [generation, setGeneration] = React.useState<string | null>(null)
  const [shiny, setShiny] = React.useState(false)
  const [visible, setVisible] = React.useState(PAGE_SIZE)
  const [selected, setSelected] = React.useState<number | null>(null)
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [accent, setAccent] = React.useState<string[]>([])

  const typeMembers = useAsync(type ? `type-${type}` : null, () =>
    fetchTypeMembers(type!)
  )

  const filtered = React.useMemo(() => {
    const list = index.data ?? []
    const q = query.trim().toLowerCase().replace(/^#/, "")
    const gen = GENERATIONS.find((g) => g.id === generation)

    return list.filter((p) => {
      if (gen && (p.id < gen.range[0] || p.id > gen.range[1])) return false
      if (type && typeMembers.data && !typeMembers.data.has(p.id)) return false
      if (q && !p.name.includes(q) && String(p.id) !== q.replace(/^0+/, ""))
        return false
      return true
    })
  }, [index.data, query, generation, type, typeMembers.data])

  const shown = filtered.slice(0, visible)
  const loadingList = index.loading || typeMembers.loading
  const hasFilters = Boolean(query || type || generation)

  const resetPaging = () => setVisible(PAGE_SIZE)
  const clearFilters = () => {
    setQuery("")
    setType(null)
    setGeneration(null)
    resetPaging()
  }

  // Accesos directos del manifest: ?accion=buscar | ?accion=aleatorio | ?pokemon=25.
  // Se leen una vez al montar (no antes: la página es estática y leer la URL en
  // el render rompería la hidratación) y se limpia la URL para no repetirlos.
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const action = params.get("accion")
    const pokemon = Number(params.get("pokemon"))
    if (!action && !pokemon) return

    window.history.replaceState(null, "", window.location.pathname)
    if (action === "buscar") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza una sola vez desde la URL
      setCommandOpen(true)
    } else {
      const id =
        action === "aleatorio"
          ? 1 + Math.floor(Math.random() * MAX_ID)
          : pokemon
      if (Number.isInteger(id) && id >= 1 && id <= MAX_ID) setSelected(id)
    }
  }, [])

  // Atajo ⌘K / Ctrl+K
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setCommandOpen((open) => !open)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // Scroll infinito
  const sentinel = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const node = sentinel.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible((v) => v + PAGE_SIZE),
      { rootMargin: "600px" }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [shown.length, filtered.length])

  const openPokemon = React.useCallback((id: number) => setSelected(id), [])
  const handleHover = React.useCallback(
    (types: string[]) =>
      setAccent((prev) => (prev.join() === types.join() ? prev : types)),
    []
  )

  return (
    <>
      <AmbientBackground types={type ? [type] : accent} />

      <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-[max(1rem,env(safe-area-inset-left))] pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] md:px-8 md:py-10">
        <HeroBanner onSearch={() => setCommandOpen(true)} />

        <section id="pokedex" className="flex scroll-mt-6 flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Pokédex
            </h2>
            <p className="text-muted-foreground">
              Pasa el cursor por una tarjeta para teñir el fondo con su tipo.
              Haz clic para abrirla a pantalla completa.
            </p>
          </div>

          {/* Barra de filtros */}
          <div className="sticky top-3 z-20 flex flex-col gap-3 rounded-2xl bg-[#0b0b10]/90 p-3 shadow-lg ring-1 shadow-black/40 ring-white/10">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <InputGroup className="h-10 md:max-w-sm">
                <InputGroupAddon>
                  <SearchIcon />
                </InputGroupAddon>
                <InputGroupInput
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    resetPaging()
                  }}
                  placeholder="Nombre o número…"
                  aria-label="Buscar Pokémon"
                />
                <InputGroupAddon align="inline-end">
                  {query ? (
                    <InputGroupButton
                      size="icon-xs"
                      onClick={() => setQuery("")}
                      aria-label="Limpiar búsqueda"
                    >
                      <XIcon />
                    </InputGroupButton>
                  ) : (
                    <Kbd>⌘K</Kbd>
                  )}
                </InputGroupAddon>
              </InputGroup>

              <ScrollArea className="min-w-0 flex-1">
                <ToggleGroup
                  variant="outline"
                  size="sm"
                  spacing={1}
                  value={generation ? [generation] : []}
                  onValueChange={(v) => {
                    setGeneration(v[0] ?? null)
                    resetPaging()
                  }}
                  aria-label="Generación"
                  className="pb-2 md:pb-0"
                >
                  {GENERATIONS.map((g) => (
                    <ToggleGroupItem
                      key={g.id}
                      value={g.id}
                      title={g.region}
                      className="font-mono data-pressed:bg-white data-pressed:text-black"
                    >
                      {g.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>

              <div className="flex items-center gap-2">
                <Switch
                  id="shiny-grid"
                  checked={shiny}
                  onCheckedChange={setShiny}
                />
                <Label
                  htmlFor="shiny-grid"
                  className="gap-1.5 whitespace-nowrap"
                >
                  <SparklesIcon className="size-3.5 text-amber-300" />
                  Variocolor
                </Label>
              </div>
            </div>

            <ScrollArea className="w-full">
              <ToggleGroup
                size="sm"
                spacing={1}
                value={type ? [type] : []}
                onValueChange={(v) => {
                  setType(v[0] ?? null)
                  resetPaging()
                }}
                aria-label="Tipo"
                className="pb-2"
              >
                {TYPE_NAMES.map((t) => {
                  const meta = typeMeta(t)
                  const Icon = meta.icon
                  return (
                    <ToggleGroupItem
                      key={t}
                      value={t}
                      style={{ "--type": meta.color } as React.CSSProperties}
                      className="rounded-full px-3 text-white/70 ring-1 ring-white/10 hover:bg-white/10 hover:text-white data-pressed:bg-(--type) data-pressed:text-white data-pressed:ring-white/30"
                    >
                      <Icon
                        style={{ color: "var(--type)" }}
                        className="in-data-pressed:text-white!"
                      />
                      {meta.label}
                    </ToggleGroupItem>
                  )
                })}
              </ToggleGroup>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
              <span className="font-mono tabular-nums">
                {loadingList ? "Cargando…" : `${filtered.length} Pokémon`}
              </span>
              {hasFilters && (
                <Button variant="ghost" size="xs" onClick={clearFilters}>
                  <RotateCcwIcon data-icon="inline-start" />
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>

          {/* Rejilla */}
          {index.error ? (
            <StateCard
              title="No pudimos conectar con PokéAPI"
              description="Revisa tu conexión e inténtalo de nuevo."
              action={
                <Button onClick={() => window.location.reload()}>
                  Reintentar
                </Button>
              }
            />
          ) : !loadingList && filtered.length === 0 ? (
            <StateCard
              title="Ningún Pokémon coincide"
              description="Prueba con otro nombre, tipo o generación."
              action={<Button onClick={clearFilters}>Limpiar filtros</Button>}
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
              {loadingList
                ? Array.from({ length: 10 }, (_, i) => (
                    <PokemonCardSkeleton key={i} />
                  ))
                : shown.map((entry, i) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: (i % PAGE_SIZE) * 0.025,
                      }}
                    >
                      <PokemonCard
                        entry={entry}
                        shiny={shiny}
                        onOpen={openPokemon}
                        onHover={handleHover}
                      />
                    </motion.div>
                  ))}
            </div>
          )}

          {!loadingList && shown.length < filtered.length && (
            <div ref={sentinel} className="flex justify-center py-6">
              <Button
                variant="outline"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
              >
                Cargar más
              </Button>
            </div>
          )}
        </section>

        <footer className="flex flex-col items-center gap-4 pb-20 text-center text-xs text-muted-foreground md:pb-6">
          <InstallOption />
          <p>
            Datos de{" "}
            <a
              href="https://pokeapi.co"
              className="underline underline-offset-4 hover:text-foreground"
            >
              PokéAPI
            </a>
            . Pokémon y sus nombres son marcas de Nintendo, Game Freak y The
            Pokémon Company.
          </p>
        </footer>
      </main>

      <InstallCard />

      <PokemonDetail
        id={selected}
        onClose={() => setSelected(null)}
        onNavigate={openPokemon}
        shiny={shiny}
        onShinyChange={setShiny}
      />

      <CommandDialog
        open={commandOpen}
        onOpenChange={setCommandOpen}
        title="Buscar Pokémon"
        description="Escribe un nombre o número"
      >
        <Command>
          <CommandInput placeholder="Pikachu, 150, char…" />
          <CommandList>
            <CommandEmpty>Sin resultados.</CommandEmpty>
            <CommandGroup heading="Pokémon">
              {index.data?.map((p) => (
                <CommandItem
                  key={p.id}
                  value={`${p.id} ${p.name}`}
                  onSelect={() => {
                    setCommandOpen(false)
                    setSelected(p.id)
                  }}
                >
                  <span className="w-12 font-mono text-xs text-muted-foreground tabular-nums">
                    {formatId(p.id)}
                  </span>
                  {formatName(p.name)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}

function StateCard({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action: React.ReactNode
}) {
  return (
    <Card className="mx-auto w-full max-w-md bg-black/40 text-center backdrop-blur">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{action}</CardContent>
    </Card>
  )
}
