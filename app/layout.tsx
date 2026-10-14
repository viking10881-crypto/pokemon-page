import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Pokédex Wallpaper",
  description:
    "Pokédex interactiva con estética wallpaper: arte oficial, tipos, estadísticas y evoluciones vía PokéAPI.",
  applicationName: "Pokédex Wallpaper",
  appleWebApp: {
    capable: true,
    title: "Pokédex",
    statusBarStyle: "black-translucent",
  },
}

// La app es siempre oscura, así que el color de la barra es el mismo en ambos esquemas.
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#06060a" },
    { media: "(prefers-color-scheme: dark)", color: "#06060a" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body>
        <ThemeProvider forcedTheme="dark" defaultTheme="dark">
          <TooltipProvider>{children}</TooltipProvider>
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  )
}
