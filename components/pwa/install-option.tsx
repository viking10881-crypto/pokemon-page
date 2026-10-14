"use client"

import * as React from "react"
import { CheckIcon, SmartphoneIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { InstallStepsDialog } from "@/components/pwa/install-steps-dialog"
import { promptInstall, useInstallState } from "@/lib/pwa/install-store"

/** Opción permanente "Instalar en este dispositivo" (independiente de la tarjeta). */
export function InstallOption() {
  const state = useInstallState()
  const [stepsOpen, setStepsOpen] = React.useState(false)

  if (!state.ready) return null

  if (state.installed) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <CheckIcon className="size-3.5" />
        App instalada en este dispositivo
      </span>
    )
  }

  const handleClick = async () => {
    if (state.canPrompt && !state.isIOS) {
      const outcome = await promptInstall()
      if (outcome !== "unavailable") return
    }
    setStepsOpen(true)
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleClick}>
        <SmartphoneIcon data-icon="inline-start" />
        Instalar en este dispositivo
      </Button>
      <InstallStepsDialog
        open={stepsOpen}
        onOpenChange={setStepsOpen}
        platform={state.isIOS ? "ios" : "other"}
      />
    </>
  )
}
