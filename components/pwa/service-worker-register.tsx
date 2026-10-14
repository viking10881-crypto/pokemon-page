"use client"

import * as React from "react"

// Importar el store aquí (en el layout) hace que escuche beforeinstallprompt lo antes posible.
import "@/lib/pwa/install-store"

export function ServiceWorkerRegister() {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => {
        // Sin SW la app sigue funcionando; solo se pierde el modo sin conexión.
      })
  }, [])

  return null
}
