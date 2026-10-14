import {
  BrainIcon,
  BugIcon,
  CircleIcon,
  CrownIcon,
  DropletsIcon,
  FeatherIcon,
  FlameIcon,
  GemIcon,
  GhostIcon,
  LeafIcon,
  MoonIcon,
  MountainIcon,
  ShieldIcon,
  SkullIcon,
  SnowflakeIcon,
  SparklesIcon,
  SwordsIcon,
  ZapIcon,
  type LucideIcon,
} from "lucide-react"

export type TypeMeta = { label: string; color: string; icon: LucideIcon }

export const TYPES: Record<string, TypeMeta> = {
  normal: { label: "Normal", color: "#A8A77A", icon: CircleIcon },
  fire: { label: "Fuego", color: "#EE8130", icon: FlameIcon },
  water: { label: "Agua", color: "#6390F0", icon: DropletsIcon },
  electric: { label: "Eléctrico", color: "#F7D02C", icon: ZapIcon },
  grass: { label: "Planta", color: "#7AC74C", icon: LeafIcon },
  ice: { label: "Hielo", color: "#96D9D6", icon: SnowflakeIcon },
  fighting: { label: "Lucha", color: "#C22E28", icon: SwordsIcon },
  poison: { label: "Veneno", color: "#A33EA1", icon: SkullIcon },
  ground: { label: "Tierra", color: "#E2BF65", icon: MountainIcon },
  flying: { label: "Volador", color: "#A98FF3", icon: FeatherIcon },
  psychic: { label: "Psíquico", color: "#F95587", icon: BrainIcon },
  bug: { label: "Bicho", color: "#A6B91A", icon: BugIcon },
  rock: { label: "Roca", color: "#B6A136", icon: GemIcon },
  ghost: { label: "Fantasma", color: "#735797", icon: GhostIcon },
  dragon: { label: "Dragón", color: "#6F35FC", icon: CrownIcon },
  dark: { label: "Siniestro", color: "#705746", icon: MoonIcon },
  steel: { label: "Acero", color: "#B7B7CE", icon: ShieldIcon },
  fairy: { label: "Hada", color: "#D685AD", icon: SparklesIcon },
}

export const TYPE_NAMES = Object.keys(TYPES)

export function typeMeta(type: string): TypeMeta {
  return TYPES[type] ?? TYPES.normal
}

export const STAT_LABELS: Record<string, string> = {
  hp: "PS",
  attack: "Ataque",
  defense: "Defensa",
  "special-attack": "At. Esp.",
  "special-defense": "Def. Esp.",
  speed: "Velocidad",
}

export const GENERATIONS = [
  { id: "1", label: "I", region: "Kanto", range: [1, 151] },
  { id: "2", label: "II", region: "Johto", range: [152, 251] },
  { id: "3", label: "III", region: "Hoenn", range: [252, 386] },
  { id: "4", label: "IV", region: "Sinnoh", range: [387, 493] },
  { id: "5", label: "V", region: "Teselia", range: [494, 649] },
  { id: "6", label: "VI", region: "Kalos", range: [650, 721] },
  { id: "7", label: "VII", region: "Alola", range: [722, 809] },
  { id: "8", label: "VIII", region: "Galar", range: [810, 905] },
  { id: "9", label: "IX", region: "Paldea", range: [906, 1025] },
] as const

/** Gradiente tipo "wallpaper" a partir de uno o dos tipos. */
export function wallpaperGradient(types: string[]) {
  const a = typeMeta(types[0] ?? "normal").color
  const b = typeMeta(types[1] ?? types[0] ?? "normal").color
  return [
    `radial-gradient(120% 80% at 50% 35%, ${a}cc 0%, ${a}33 45%, transparent 70%)`,
    `radial-gradient(90% 60% at 100% 100%, ${b}99 0%, transparent 60%)`,
    `linear-gradient(160deg, #0b0b10 0%, #050507 100%)`,
  ].join(", ")
}
