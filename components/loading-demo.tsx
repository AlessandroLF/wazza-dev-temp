"use client"

import { Button } from "@/components/ui/button"
import { useLoading } from "@/context/loading-context"
import { useState } from "react"

export function LoadingDemo() {
  const { startLoading, stopLoading } = useLoading()
  const [isSimulating, setIsSimulating] = useState(false)

  // Simulate loading for 3 seconds when button is clicked
  const simulateLoading = () => {
    if (isSimulating) return

    setIsSimulating(true)
    startLoading()

    setTimeout(() => {
      stopLoading()
      setIsSimulating(false)
    }, 3000)
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Button
        onClick={simulateLoading}
        disabled={isSimulating}
        variant="outline"
        className="bg-background/80 backdrop-blur-sm border border-border/40"
      >
        {isSimulating ? "Loading..." : "Show Loading Text"}
      </Button>
    </div>
  )
}
