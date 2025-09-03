"use client"

import { useState, useEffect, useRef } from "react"
import { X, Copy, Eye, EyeOff } from "lucide-react"

interface GeneralSettingsDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (settings: {
    disconnectedWebhookUrl: string
    n8nApiKey: string
  }) => void
  initialSettings: {
    disconnectedWebhookUrl: string
    n8nApiKey: string
  }
}

export function GeneralSettingsDialog({ isOpen, onClose, onSave, initialSettings }: GeneralSettingsDialogProps) {
  const [settings, setSettings] = useState(initialSettings)
  const [showApiKey, setShowApiKey] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      const firstInput = document.querySelector(".general-input") as HTMLInputElement
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100)
      }
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSave = () => {
    onSave(settings)
  }

  const handleInputChange = (field: keyof typeof settings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const generateApiKey = () => {
    if (settings.n8nApiKey) {
      setShowConfirmation(true)
      return
    }

    performGeneration()
  }

  const performGeneration = () => {
    setIsGenerating(true)
    setShowConfirmation(false)
    setTimeout(() => {
      const newApiKey = `n8n_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
      setSettings((prev) => ({
        ...prev,
        n8nApiKey: newApiKey,
      }))
      setIsGenerating(false)
    }, 1000)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log(`Copied ${label} to clipboard:`, text)
      })
      .catch((err) => {
        console.error("Failed to copy:", err)
      })
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] max-w-[90vw] bg-background rounded-lg shadow-lg z-50 flex flex-col overflow-hidden max-h-[90vh]">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-base font-medium">General Settings</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto thin-scrollbar max-h-[60vh]" ref={contentRef}>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none">Number disconnected webhook url:</label>
                <button
                  onClick={() => copyToClipboard(settings.disconnectedWebhookUrl, "disconnected webhook URL")}
                  className="text-blue-500 hover:text-blue-700"
                  aria-label="Copy disconnected webhook URL"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <input
                type="text"
                value={settings.disconnectedWebhookUrl}
                onChange={(e) => handleInputChange("disconnectedWebhookUrl", e.target.value)}
                className="general-input w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="https://your-webhook.com/disconnected"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none">Apikey for n8n:</label>
                <div className="flex items-center gap-2">
                  {settings.n8nApiKey && (
                    <>
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label={showApiKey ? "Hide API key" : "Show API key"}
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(settings.n8nApiKey, "n8n API key")}
                        className="text-blue-500 hover:text-blue-700"
                        aria-label="Copy n8n API key"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  {!showConfirmation ? (
                    <button
                      onClick={generateApiKey}
                      disabled={isGenerating}
                      className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 transition-colors"
                    >
                      {isGenerating ? "Generating..." : settings.n8nApiKey ? "Re-Generate" : "Generate"}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-2">
                      <span className="text-xs text-yellow-800 dark:text-yellow-200 whitespace-nowrap">
                        Other apikeys will expire. Sure?
                      </span>
                      <button
                        onClick={performGeneration}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setShowConfirmation(false)}
                        className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                      >
                        No
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <input
                type={showApiKey ? "text" : "password"}
                value={settings.n8nApiKey}
                onChange={(e) => handleInputChange("n8nApiKey", e.target.value)}
                className="general-input w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Generated API key will appear here"
                readOnly={!showApiKey}
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Save changes
          </button>
        </div>
      </div>
    </>
  )
}
