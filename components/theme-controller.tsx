"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

export function ThemeController() {
  const { theme, setTheme } = useTheme()
  const initialized = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Function to initialize theme settings without Tweakpane
    const initThemeSettings = () => {
      if (initialized.current) return

      try {
        const config = {
          theme: theme || "system",
          perspective: 400,
          distance: 0.75,
          duration: 1.2,
          invert: true,
        }

        const update = () => {
          document.documentElement.dataset.theme = config.theme
          document.documentElement.dataset.invert = config.invert.toString()
          document.documentElement.style.setProperty("--perspective", `${config.perspective}vmax`)
          document.documentElement.style.setProperty("--distance", `-${config.distance}`)
          document.documentElement.style.setProperty("--duration", `${config.duration}s`)

          // Update the theme using next-themes
          setTheme(config.theme)
        }

        update()
        initialized.current = true
      } catch (error) {
        // Silently handle errors
      }
    }

    // Initialize theme settings
    initThemeSettings()
  }, [theme, setTheme])

  return null
}
