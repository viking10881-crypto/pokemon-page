"use client"

import * as React from "react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export type InstallState = {
  /** false en el servidor y en la hidratación: nunca mostrar nada hasta montar. */
  ready: boolean
  installed: boolean
  canPrompt: boolean
  isIOS: boolean
  isMobile: boolean
  dismissed: boolean
}

const DISMISS_KEY = "pokedex:install-card-dismissed"

const SERVER_STATE: InstallState = {
  ready: false,
  installed: false,
  canPrompt: false,
  isIOS: false,
  isMobile: false,
  dismissed: true,
}

let deferredPrompt: BeforeInstallPromptEvent | null = null
let justInstalled = false
let dismissedThisSession = false
let snapshot: InstallState = SERVER_STATE
const listeners = new Set<() => void>()

function readDismissed() {
  if (dismissedThisSession) return true
  try {
    return window.localStorage.getItem(DISMISS_KEY) === "1"
  } catch {
    return false
  }
}

function detectIOS() {
  const ua = navigator.userAgent
  // iPadOS se identifica como Mac: se distingue por la pantalla táctil.
  const iPadAsMac = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1
  return /iPad|iPhone|iPod/.test(ua) || iPadAsMac
}

function detectStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function computeSnapshot(): InstallState {
  const isIOS = detectIOS()
  return {
    ready: true,
    installed: justInstalled || detectStandalone(),
    canPrompt: deferredPrompt !== null,
    isIOS,
    isMobile: isIOS || /Android|Mobi/i.test(navigator.userAgent),
    dismissed: readDismissed(),
  }
}

function emit() {
  snapshot = computeSnapshot()
  listeners.forEach((listener) => listener())
}

// Se registra al cargar el módulo: beforeinstallprompt se dispara una sola vez y muy pronto.
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault()
    deferredPrompt = event as BeforeInstallPromptEvent
    emit()
  })
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null
    justInstalled = true
    emit()
  })
  window.matchMedia("(display-mode: standalone)").addEventListener("change", emit)
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (!snapshot.ready) emit()
  return () => listeners.delete(listener)
}

export function useInstallState() {
  return React.useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => SERVER_STATE
  )
}

/** Muestra el diálogo nativo de instalación (Chrome/Edge/Android). */
export async function promptInstall() {
  const event = deferredPrompt
  if (!event) return "unavailable" as const
  await event.prompt()
  const { outcome } = await event.userChoice
  // El evento solo puede usarse una vez.
  deferredPrompt = null
  emit()
  return outcome
}

export function dismissInstallCard() {
  dismissedThisSession = true
  try {
    window.localStorage.setItem(DISMISS_KEY, "1")
  } catch {
    // Almacenamiento bloqueado (modo privado): se oculta solo en esta sesión.
  }
  emit()
}
