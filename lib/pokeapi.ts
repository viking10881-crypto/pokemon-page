const API = "https://pokeapi.co/api/v2"
const SPRITES =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon"

export const MAX_ID = 1025

export type PokemonIndexEntry = { id: number; name: string }

export type PokemonStat = { name: string; value: number }

export type Pokemon = {
  id: number
  name: string
  types: string[]
  stats: PokemonStat[]
  abilities: { name: string; hidden: boolean }[]
  height: number
  weight: number
  baseExperience: number | null
  cry: string | null
}

export type PokemonSpecies = {
  genus: string | null
  flavorText: string | null
  generation: string
  isLegendary: boolean
  isMythical: boolean
  captureRate: number
  evolutionChainUrl: string | null
}

export type Ability = { name: string; description: string | null }

export type EvolutionStage = PokemonIndexEntry[]

// Cache de promesas: cada recurso se pide una sola vez por sesión.
const cache = new Map<string, Promise<unknown>>()

function cachedJson<T>(url: string): Promise<T> {
  let hit = cache.get(url) as Promise<T> | undefined
  if (!hit) {
    hit = fetch(url).then((res) => {
      if (!res.ok) throw new Error(`PokéAPI ${res.status}: ${url}`)
      return res.json() as Promise<T>
    })
    hit.catch(() => cache.delete(url))
    cache.set(url, hit)
  }
  return hit
}

function idFromUrl(url: string) {
  return Number(url.split("/").filter(Boolean).pop())
}

type NamedResource = { name: string; url: string }
type Localized = { language: { name: string } }

function pickLang<T extends Localized>(entries: T[]) {
  return (
    entries.find((e) => e.language.name === "es") ??
    entries.find((e) => e.language.name === "en")
  )
}

function cleanText(text: string) {
  return text.replace(/[\f\n\r­]+/g, " ").replace(/\s+/g, " ").trim()
}

export function artworkUrl(id: number, shiny = false) {
  return `${SPRITES}/other/official-artwork/${shiny ? "shiny/" : ""}${id}.png`
}

export function formatId(id: number) {
  return `#${String(id).padStart(4, "0")}`
}

export function formatName(name: string) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export async function fetchIndex(): Promise<PokemonIndexEntry[]> {
  const data = await cachedJson<{ results: NamedResource[] }>(
    `${API}/pokemon?limit=${MAX_ID}&offset=0`
  )
  return data.results.map((r) => ({ id: idFromUrl(r.url), name: r.name }))
}

export async function fetchPokemon(id: number): Promise<Pokemon> {
  const data = await cachedJson<{
    id: number
    name: string
    types: { type: NamedResource }[]
    stats: { base_stat: number; stat: NamedResource }[]
    abilities: { ability: NamedResource; is_hidden: boolean }[]
    height: number
    weight: number
    base_experience: number | null
    cries?: { latest: string | null }
  }>(`${API}/pokemon/${id}`)

  return {
    id: data.id,
    name: data.name,
    types: data.types.map((t) => t.type.name),
    stats: data.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
    abilities: data.abilities.map((a) => ({
      name: a.ability.name,
      hidden: a.is_hidden,
    })),
    height: data.height,
    weight: data.weight,
    baseExperience: data.base_experience,
    cry: data.cries?.latest ?? null,
  }
}

export async function fetchSpecies(id: number): Promise<PokemonSpecies> {
  const data = await cachedJson<{
    genera: (Localized & { genus: string })[]
    flavor_text_entries: (Localized & { flavor_text: string })[]
    generation: NamedResource
    is_legendary: boolean
    is_mythical: boolean
    capture_rate: number
    evolution_chain: { url: string } | null
  }>(`${API}/pokemon-species/${id}`)

  // Las entradas más recientes suelen estar al final de la lista.
  const flavor = pickLang([...data.flavor_text_entries].reverse())

  return {
    genus: pickLang(data.genera)?.genus ?? null,
    flavorText: flavor ? cleanText(flavor.flavor_text) : null,
    generation: data.generation.name.replace("generation-", "").toUpperCase(),
    isLegendary: data.is_legendary,
    isMythical: data.is_mythical,
    captureRate: data.capture_rate,
    evolutionChainUrl: data.evolution_chain?.url ?? null,
  }
}

export async function fetchAbility(name: string): Promise<Ability> {
  const data = await cachedJson<{
    names: (Localized & { name: string })[]
    flavor_text_entries: (Localized & { flavor_text: string })[]
  }>(`${API}/ability/${name}`)

  const flavor = pickLang([...data.flavor_text_entries].reverse())
  return {
    name: pickLang(data.names)?.name ?? formatName(name),
    description: flavor ? cleanText(flavor.flavor_text) : null,
  }
}

type ChainLink = { species: NamedResource; evolves_to: ChainLink[] }

export async function fetchEvolutionStages(
  url: string
): Promise<EvolutionStage[]> {
  const data = await cachedJson<{ chain: ChainLink }>(url)
  const stages: EvolutionStage[] = []

  const walk = (links: ChainLink[], depth: number) => {
    if (!links.length) return
    stages[depth] ??= []
    for (const link of links) {
      const id = idFromUrl(link.species.url)
      if (id <= MAX_ID) stages[depth].push({ id, name: link.species.name })
      walk(link.evolves_to, depth + 1)
    }
  }
  walk([data.chain], 0)

  return stages.filter((s) => s.length)
}

export async function fetchTypeMembers(type: string): Promise<Set<number>> {
  const data = await cachedJson<{ pokemon: { pokemon: NamedResource }[] }>(
    `${API}/type/${type}`
  )
  return new Set(
    data.pokemon.map((p) => idFromUrl(p.pokemon.url)).filter((id) => id <= MAX_ID)
  )
}
