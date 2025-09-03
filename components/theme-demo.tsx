"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

export function ThemeDemo() {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)

    // Set up the theme transition effect
    document.documentElement.dataset.invert = "true"
    document.documentElement.style.setProperty("--perspective", "400vmax")
    document.documentElement.style.setProperty("--distance", "-0.75")
    document.documentElement.style.setProperty("--duration", "1.2s")
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 p-3 bg-background/80 backdrop-blur-sm rounded-lg border border-border/40 max-w-[200px]">
      <p className="text-xs text-muted-foreground">
        <span className="font-medium">3D Theme:</span> {theme}
      </p>
      <p className="text-xs text-muted-foreground mt-1">Click the icon in the bottom right to toggle themes</p>
    </div>
  )
}
