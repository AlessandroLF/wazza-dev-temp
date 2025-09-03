"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FallbackThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }

    // Use View Transitions API if available
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        document.documentElement.dataset.theme = theme || "system"
        document.documentElement.dataset.invert = "true"
        document.documentElement.style.setProperty("--perspective", "400vmax")
        document.documentElement.style.setProperty("--distance", "-0.75")
        document.documentElement.style.setProperty("--duration", "1.2s")
      })
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/40"
        onClick={toggleTheme}
      >
        {theme === "light" && <Sun className="h-5 w-5" />}
        {theme === "dark" && <Moon className="h-5 w-5" />}
        {theme === "system" && <Monitor className="h-5 w-5" />}
      </Button>
    </div>
  )
}
