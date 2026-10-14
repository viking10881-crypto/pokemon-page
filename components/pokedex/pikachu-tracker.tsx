"use client"

import * as React from "react"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion"

import { cn } from "@/lib/utils"

const CRY_URL =
  "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/25.ogg"

const YELLOW = "#FFD43B"
const SHADE = "#F2B705"
const INK = "#2b1d0e"
const RED = "#E8392F"

/** Pikachu en SVG que sigue el cursor con la mirada, como la escena 3D de Spline. */
export function PikachuTracker({ className }: { className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  // Posición del cursor normalizada (-1..1) respecto al centro de Pikachu.
  const mx = useMotionValue(0)
  const my = useMotionValue(0)

  React.useEffect(() => {
    if (reduceMotion) return
    // El centro se cachea y solo se recalcula al hacer scroll/resize,
    // así pointermove no fuerza lecturas de layout.
    const center = { x: 0, y: 0 }
    const measure = () => {
      const rect = ref.current?.getBoundingClientRect()
      if (!rect) return
      center.x = rect.left + rect.width / 2
      center.y = rect.top + rect.height * 0.4
    }
    measure()

    const clamp = (v: number) => Math.max(-1, Math.min(1, v))
    const onMove = (event: PointerEvent) => {
      mx.set(clamp((event.clientX - center.x) / (window.innerWidth * 0.45)))
      my.set(clamp((event.clientY - center.y) / (window.innerHeight * 0.45)))
    }
    const onLeave = () => {
      mx.set(0)
      my.set(0)
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("scroll", measure, { passive: true })
    window.addEventListener("resize", measure)
    document.addEventListener("pointerleave", onLeave)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("scroll", measure)
      window.removeEventListener("resize", measure)
      document.removeEventListener("pointerleave", onLeave)
    }
  }, [mx, my, reduceMotion])

  // Cada parte con su propia inercia: los ojos se adelantan, la cabeza
  // los sigue y orejas/cuerpo llegan después con un ligero rebote.
  const eyeSx = useSpring(mx, { stiffness: 160, damping: 24, mass: 0.6 })
  const eyeSy = useSpring(my, { stiffness: 160, damping: 24, mass: 0.6 })
  const headSx = useSpring(mx, { stiffness: 70, damping: 15, mass: 1 })
  const headSy = useSpring(my, { stiffness: 70, damping: 15, mass: 1 })
  const earSx = useSpring(mx, { stiffness: 45, damping: 7, mass: 1 })
  const bodySx = useSpring(mx, { stiffness: 35, damping: 12, mass: 1.2 })

  const headX = useTransform(headSx, [-1, 1], [-14, 14])
  const headY = useTransform(headSy, [-1, 1], [-10, 8])
  const headRotate = useTransform(headSx, [-1, 1], [-9, 9])
  const eyeX = useTransform(eyeSx, [-1, 1], [-7, 7])
  const eyeY = useTransform(eyeSy, [-1, 1], [-6, 6])
  const shineX = useTransform(eyeSx, [-1, 1], [-2, 2])
  const noseX = useTransform(headSx, [-1, 1], [-4, 4])
  const bodyRotate = useTransform(bodySx, [-1, 1], [-3, 3])
  const earLeft = useTransform(earSx, [-1, 1], [-10, 6])
  const earRight = useTransform(earSx, [-1, 1], [-6, 10])
  const shadowScale = useTransform(bodySx, [-1, 0, 1], [0.92, 1, 0.92])

  // Parpadeo aleatorio
  const [blink, setBlink] = React.useState(false)
  React.useEffect(() => {
    if (reduceMotion) return
    let timer: ReturnType<typeof setTimeout>
    const schedule = () => {
      timer = setTimeout(() => {
        setBlink(true)
        timer = setTimeout(() => {
          setBlink(false)
          schedule()
        }, 140)
      }, 2200 + Math.random() * 3000)
    }
    schedule()
    return () => clearTimeout(timer)
  }, [reduceMotion])

  // Clic: grito + descarga eléctrica
  const [charged, setCharged] = React.useState(false)
  const audio = React.useRef<HTMLAudioElement | null>(null)
  const thunder = () => {
    audio.current ??= new Audio(CRY_URL)
    audio.current.volume = 0.35
    audio.current.currentTime = 0
    void audio.current.play().catch(() => {})
    setCharged(true)
    setTimeout(() => setCharged(false), 1200)
  }

  return (
    <div ref={ref} className={cn("relative flex items-end justify-center", className)}>
      {/* Halo eléctrico */}
      <motion.div
        aria-hidden
        animate={{ opacity: charged ? 0.75 : 0.35, scale: charged ? 1.15 : 1 }}
        transition={{ duration: 0.3 }}
        className="pointer-events-none absolute top-1/2 left-1/2 size-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,212,59,0.4)_0%,rgba(255,212,59,0.12)_40%,transparent_70%)] will-change-[transform,opacity]"
      />

      <motion.button
        type="button"
        onClick={thunder}
        aria-label="Pikachu: haz clic para que lance un rayo"
        whileTap={{ scale: 0.96 }}
        animate={charged && !reduceMotion ? { x: [0, -3, 3, -2, 2, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="relative h-full max-h-[480px] w-full transform-gpu cursor-pointer outline-none focus-visible:rounded-3xl focus-visible:ring-2 focus-visible:ring-yellow-300/70"
      >
        <svg viewBox="0 0 400 520" className="size-full overflow-visible" aria-hidden>
          <defs>
            <clipPath id="pika-ear">
              <path d="M138,155 C108,112 74,58 56,8 C96,30 152,78 188,140 Z" />
            </clipPath>
            <clipPath id="pika-tail">
              <path d={TAIL} />
            </clipPath>
            <radialGradient id="pika-body" cx="40%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#FFE680" />
              <stop offset="60%" stopColor={YELLOW} />
              <stop offset="100%" stopColor={SHADE} />
            </radialGradient>
          </defs>

          {/* Sombra en el suelo */}
          <motion.ellipse
            cx="200"
            cy="492"
            rx="110"
            ry="14"
            fill="black"
            opacity="0.45"
            style={{ scaleX: shadowScale }}
          />

          <motion.g style={{ rotate: bodyRotate, originX: "200px", originY: "480px" }}>
            {/* Cola */}
            <motion.g
              animate={reduceMotion ? undefined : { rotate: [-4, 5, -4] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              style={{ originX: "255px", originY: "390px" }}
            >
              <g clipPath="url(#pika-tail)">
                <path d={TAIL} fill="url(#pika-body)" />
                <circle cx="252" cy="392" r="34" fill="#8B5A2B" />
              </g>
              <path d={TAIL} fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
            </motion.g>

            {/* Cuerpo con respiración */}
            <motion.g
              animate={reduceMotion ? undefined : { scaleY: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ originX: "200px", originY: "470px" }}
            >
              <ellipse cx="200" cy="372" rx="86" ry="96" fill="url(#pika-body)" stroke={INK} strokeWidth="3" />
              <ellipse cx="158" cy="462" rx="30" ry="14" fill={YELLOW} stroke={INK} strokeWidth="3" />
              <ellipse cx="242" cy="462" rx="30" ry="14" fill={YELLOW} stroke={INK} strokeWidth="3" />
              <ellipse cx="160" cy="348" rx="15" ry="30" transform="rotate(-38 160 348)" fill={YELLOW} stroke={INK} strokeWidth="3" />
              <ellipse cx="240" cy="348" rx="15" ry="30" transform="rotate(38 240 348)" fill={YELLOW} stroke={INK} strokeWidth="3" />
            </motion.g>

            {/* Cabeza */}
            <motion.g style={{ x: headX, y: headY, rotate: headRotate, originX: "200px", originY: "260px" }}>
              <Ear rotate={earLeft} />
              <g transform="translate(400,0) scale(-1,1)">
                <Ear rotate={earRight} mirrored />
              </g>

              <ellipse cx="200" cy="212" rx="110" ry="86" fill="url(#pika-body)" stroke={INK} strokeWidth="3" />

              {/* Mejillas */}
              <Cheek cx={126} cy={244} charged={charged} />
              <Cheek cx={274} cy={244} charged={charged} />

              {/* Ojos */}
              <Eye x={158} y={200} eyeX={eyeX} eyeY={eyeY} shineX={shineX} blink={blink} />
              <Eye x={242} y={200} eyeX={eyeX} eyeY={eyeY} shineX={shineX} blink={blink} />

              {/* Nariz y boca */}
              <motion.g style={{ x: noseX }}>
                <ellipse cx="200" cy="224" rx="4" ry="2.5" fill={INK} />
                <AnimatePresence mode="wait" initial={false}>
                  {charged ? (
                    <motion.g
                      key="open"
                      initial={{ scaleY: 0.2, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      exit={{ scaleY: 0.2, opacity: 0 }}
                      style={{ originX: "200px", originY: "234px" }}
                    >
                      <path d="M182,234 Q200,272 218,234 Q200,242 182,234 Z" fill="#7a1f1a" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
                      <path d="M190,252 Q200,246 210,252 Q200,266 190,252 Z" fill="#f47c7c" />
                    </motion.g>
                  ) : (
                    <motion.path
                      key="closed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      d="M184,234 Q192,244 200,235 Q208,244 216,234"
                      fill="none"
                      stroke={INK}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  )}
                </AnimatePresence>
              </motion.g>
            </motion.g>
          </motion.g>

          {/* Rayos */}
          <AnimatePresence>
            {charged && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.4, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1 }}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              >
                {BOLTS.map((d) => (
                  <g key={d}>
                    <path d={d} stroke="#FFD43B" strokeWidth="14" opacity="0.3" />
                    <path d={d} stroke="#FFF59D" strokeWidth="5" />
                  </g>
                ))}
              </motion.g>
            )}
          </AnimatePresence>
        </svg>
      </motion.button>

      <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/5 px-3 py-1 text-xs whitespace-nowrap text-neutral-400 ring-1 ring-white/10">
        Haz clic en Pikachu ⚡
      </span>
    </div>
  )
}

const TAIL =
  "M262,402 L300,368 L284,360 L346,300 L322,292 L382,206 L296,262 L316,274 L254,330 L274,340 L236,378 Z"

const BOLTS = [
  "M70,250 L40,232 L58,224 L22,200",
  "M66,280 L30,292 L46,302 L8,320",
  "M330,250 L360,232 L342,224 L378,200",
  "M334,280 L370,292 L354,302 L392,320",
  "M200,96 L188,60 L204,58 L192,20",
]

function Ear({ rotate, mirrored = false }: { rotate: MotionValue<number>; mirrored?: boolean }) {
  // En la oreja reflejada la rotación se invierte por el scale(-1,1).
  const r = useTransform(rotate, (v) => (mirrored ? -v : v))
  return (
    <motion.g style={{ rotate: r, originX: "165px", originY: "150px" }}>
      <g clipPath="url(#pika-ear)">
        <path d="M138,155 C108,112 74,58 56,8 C96,30 152,78 188,140 Z" fill="url(#pika-body)" />
        <circle cx="56" cy="8" r="52" fill={INK} />
      </g>
      <path
        d="M138,155 C108,112 74,58 56,8 C96,30 152,78 188,140 Z"
        fill="none"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </motion.g>
  )
}

function Eye({
  x,
  y,
  eyeX,
  eyeY,
  shineX,
  blink,
}: {
  x: number
  y: number
  eyeX: MotionValue<number>
  eyeY: MotionValue<number>
  shineX: MotionValue<number>
  blink: boolean
}) {
  return (
    <g transform={`translate(${x},${y})`}>
      <motion.g style={{ x: eyeX, y: eyeY }}>
        <motion.g
          animate={{ scaleY: blink ? 0.08 : 1 }}
          transition={{ duration: 0.07 }}
          style={{ originX: "0px", originY: "0px" }}
        >
          <ellipse rx="17" ry="19" fill={INK} />
          <motion.g style={{ x: shineX }}>
            <circle cx="-5" cy="-7" r="6.5" fill="white" />
            <circle cx="5" cy="6" r="2.5" fill="white" opacity="0.7" />
          </motion.g>
        </motion.g>
      </motion.g>
    </g>
  )
}

function Cheek({ cx, cy, charged }: { cx: number; cy: number; charged: boolean }) {
  return (
    <g>
      <motion.circle
        cx={cx}
        cy={cy}
        r="34"
        fill="#FFE066"
        initial={false}
        animate={{ opacity: charged ? 0.55 : 0 }}
        transition={{ duration: 0.2 }}
      />
      <motion.circle
        cx={cx}
        cy={cy}
        r="22"
        stroke={INK}
        strokeWidth="2.5"
        initial={false}
        animate={{ fill: charged ? "#FF6B5E" : RED }}
        transition={{ duration: 0.2 }}
      />
    </g>
  )
}
