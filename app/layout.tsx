import type React from "react"
import "@/app/globals.css"
import "@/app/theme-transition.css"
import "@/app/dialog-styles.css"
import { Urbanist } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { FallbackThemeToggle } from "@/components/fallback-theme-toggle"

const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-urbanist",
})

export const metadata = {
  title: "Wazzap - WhatsApp Manager",
  description: "Administra tus conexiones de WhatsApp con Go High Level",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="view-transition" content="same-origin" />
      </head>
      <body className={urbanist.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <FallbackThemeToggle />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
