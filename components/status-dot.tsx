"use client"

import { useState } from "react"

type StatusType = "connected" | "disconnected" | "error" | "pause"

interface StatusDotProps {
  status: StatusType
}

export function StatusDot({ status }: StatusDotProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case "connected":
        return "bg-green-500"
      case "error":
        return "bg-yellow-500"
      case "disconnected":
        return "bg-red-500"
      case "pause":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: StatusType) => {
    switch (status) {
      case "connected":
        return "Conectado"
      case "error":
        return "Con errores"
      case "disconnected":
        return "No conectado"
      case "pause":
        return "En pausa"
      default:
        return "Estado desconocido"
    }
  }

  return (
    <div className="relative inline-flex justify-center">
      <div
        className={`h-3 w-3 rounded-full ${getStatusColor(status)} cursor-help transition-all duration-200 hover:scale-110`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      />

      {showTooltip && (
        <div
          className="absolute z-50 bg-popover text-popover-foreground px-3 py-1.5 text-xs rounded-md shadow-md whitespace-nowrap -top-8 left-1/2 -translate-x-1/2"
          style={{
            animation: "tooltip-appear 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        >
          {getStatusText(status)}
        </div>
      )}
    </div>
  )
}
