"use client"

import { AnimatePresence, motion } from "framer-motion"

import { typeMeta } from "@/lib/pokemon-meta"

const GLOW =
  "absolute [mask-image:radial-gradient(closest-side,black,transparent)] will-change-[opacity]"

/**
 * Fondo fijo tipo wallpaper que se tiñe con el tipo del Pokémon activo.
 * El cambio de color es un fundido de opacidad entre capas (solo compositor),
 * sin `filter: blur()` ni transiciones de color que obliguen a repintar.
 */
export function AmbientBackground({ types }: { types: string[] }) {
  const a = types[0] ? typeMeta(types[0]).color : "#ef4444"
  const b = types[1] || types[0] ? typeMeta(types[1] ?? types[0]).color : "#6366f1"

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#06060a] [transform:translateZ(0)]"
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={`a-${a}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className={`${GLOW} -top-1/3 -left-1/3 size-[90vmax]`}
          style={{ backgroundColor: a }}
        />
      </AnimatePresence>
      <AnimatePresence initial={false}>
        <motion.div
          key={`b-${b}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className={`${GLOW} -right-1/3 -bottom-1/2 size-[80vmax]`}
          style={{ backgroundColor: b }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)] bg-[size:64px_64px]" />
      <div className="noise absolute inset-0 opacity-[0.035]" />
    </div>
  )
}
