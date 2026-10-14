"use client"

import { EllipsisVerticalIcon, PlusSquareIcon, ShareIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const IOS_STEPS = [
  { icon: null, text: "Abre esta página en Safari." },
  { icon: ShareIcon, text: "Toca el botón Compartir en la barra inferior." },
  { icon: PlusSquareIcon, text: "Desliza y elige «Agregar a inicio»." },
  { icon: null, text: "Toca «Agregar» arriba a la derecha." },
]

const BROWSER_STEPS = [
  { icon: EllipsisVerticalIcon, text: "Abre el menú del navegador." },
  { icon: PlusSquareIcon, text: "Elige «Instalar app» o «Agregar a pantalla de inicio»." },
  { icon: null, text: "Confirma la instalación." },
]

export function InstallStepsDialog({
  open,
  onOpenChange,
  platform,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  platform: "ios" | "other"
}) {
  const steps = platform === "ios" ? IOS_STEPS : BROWSER_STEPS

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0b0b10] sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Instalar Pokédex</DialogTitle>
          <DialogDescription>
            {platform === "ios"
              ? "En iPhone y iPad se instala desde Safari en cuatro pasos."
              : "Tu navegador no muestra un botón de instalación, pero puedes hacerlo desde su menú."}
          </DialogDescription>
        </DialogHeader>
        <ol className="flex flex-col gap-3" data-testid="install-steps">
          {steps.map((step, i) => (
            <li key={step.text} className="flex items-center gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10 font-mono text-xs">
                {i + 1}
              </span>
              <span className="flex-1 text-sm">{step.text}</span>
              {step.icon && <step.icon className="size-4 text-muted-foreground" />}
            </li>
          ))}
        </ol>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Entendido</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
