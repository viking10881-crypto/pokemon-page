"use client"

import * as React from "react"
import { DownloadIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { InstallStepsDialog } from "@/components/pwa/install-steps-dialog"
import { dismissInstallCard, promptInstall, useInstallState } from "@/lib/pwa/install-store"

/** Invitación discreta a instalar: solo en móvil, si no está instalada ni se cerró antes. */
export function InstallCard() {
  const state = useInstallState()
  const [stepsOpen, setStepsOpen] = React.useState(false)

  const visible =
    state.ready &&
    state.isMobile &&
    !state.installed &&
    !state.dismissed &&
    (state.canPrompt || state.isIOS)

  return (
    <>
      {visible && (
        <aside
          aria-label="Instalar la app"
          className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-[#0b0b10]/95 p-3 shadow-2xl ring-1 shadow-black/60 ring-white/10 animate-in fade-in slide-in-from-bottom-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-192.png" alt="" className="size-11 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Instala la Pokédex</p>
            <p className="truncate text-xs text-muted-foreground">
              Úsala a pantalla completa.
            </p>
          </div>
          {/* En iOS ningún navegador puede abrir el diálogo nativo: siempre pasos. */}
          {state.canPrompt && !state.isIOS ? (
            <Button size="sm" onClick={() => void promptInstall()}>
              <DownloadIcon data-icon="inline-start" />
              Instalar
            </Button>
          ) : (
            <Button size="sm" onClick={() => setStepsOpen(true)}>
              Cómo instalar
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={dismissInstallCard}
            aria-label="Cerrar invitación de instalación"
          >
            <XIcon />
          </Button>
        </aside>
      )}
      <InstallStepsDialog open={stepsOpen} onOpenChange={setStepsOpen} platform="ios" />
    </>
  )
}
