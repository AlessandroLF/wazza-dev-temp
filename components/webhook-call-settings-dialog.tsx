"use client"

import { useState, useEffect, useRef } from "react"
import { X, Copy } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface WebhookCallSettingsDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (
    webhookCallSettings: {
      offer: string
      accept: string
      reject: string
      missed: string
    },
    activeStates: {
      offer: boolean
      accept: boolean
      reject: boolean
      missed: boolean
    },
  ) => void
  initialWebhookCallSettings: {
    offer: string
    accept: string
    reject: string
    missed: string
  }
  initialActiveStates?: {
    offer: boolean
    accept: boolean
    reject: boolean
    missed: boolean
  }
}

export function WebhookCallSettingsDialog({
  isOpen,
  onClose,
  onSave,
  initialWebhookCallSettings,
  initialActiveStates = {
    offer: true,
    accept: false,
    reject: false,
    missed: false,
  },
}: WebhookCallSettingsDialogProps) {
  const [webhookCallSettings, setWebhookCallSettings] = useState(initialWebhookCallSettings)
  const [activeStates, setActiveStates] = useState(initialActiveStates)
  const [copyDropdownOpen, setCopyDropdownOpen] = useState(false)
  const [selectedNumbers, setSelectedNumbers] = useState<{ [key: string]: boolean }>({
    all: false,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  })
  const contentRef = useRef<HTMLDivElement>(null)
  const copyDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      // Prevent body scrolling when dialog is open
      document.body.style.overflow = "hidden"

      // Focus the first input when dialog opens
      const firstInput = document.querySelector(".webhook-input") as HTMLInputElement
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100)
      }
    } else {
      // Re-enable body scrolling when dialog closes
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (copyDropdownRef.current && !copyDropdownRef.current.contains(e.target as Node)) {
        setCopyDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!isOpen) return null

  const handleSave = () => {
    onSave(webhookCallSettings, activeStates)
  }

  const toggleActive = (field: "offer" | "accept" | "reject" | "missed") => {
    setActiveStates((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handleInputChange = (field: keyof typeof webhookCallSettings, value: string) => {
    setWebhookCallSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const getInputBorderClass = (isActive: boolean) => {
    return isActive
      ? "border-green-500 focus:border-green-600 focus:ring-green-500"
      : "border-red-300 focus:border-red-400 focus:ring-red-300"
  }

  const handleCheckboxChange = (key: string) => {
    if (key === "all") {
      const newState = !selectedNumbers.all
      const updatedNumbers = { ...selectedNumbers }

      // Update all checkboxes based on "Copy to all" state
      Object.keys(updatedNumbers).forEach((k) => {
        updatedNumbers[k] = newState
      })

      setSelectedNumbers(updatedNumbers)
    } else {
      setSelectedNumbers((prev) => ({
        ...prev,
        [key]: !prev[key],
        // If individual checkbox is unchecked, also uncheck "all"
        ...(prev[key] ? { all: false } : {}),
      }))
    }
  }

  const handleApplySettings = () => {
    // Here you would implement the actual copying logic
    const selectedPhones = Object.entries(selectedNumbers)
      .filter(([key, isSelected]) => isSelected && key !== "all")
      .map(([key]) => {
        const phoneNames = ["Nair España", "Tickets", "Oxeo - Error", "Pepe", "Inglaterra"]
        return `${key} ${phoneNames[Number.parseInt(key) - 1] || ""}`
      })

    console.log("Copying settings to selected phones:", selectedPhones)
    setCopyDropdownOpen(false)
    // Reset selections after applying
    setSelectedNumbers({
      all: false,
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
    })
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] max-w-[90vw] bg-background rounded-lg shadow-lg z-50 flex flex-col overflow-hidden max-h-[90vh]">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-base font-medium">Webhook Call Settings</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto thin-scrollbar max-h-[60vh]" ref={contentRef}>
          <div className="space-y-6">
            <div className="max-h-[200px] overflow-y-auto thin-scrollbar pr-2">
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="offer-active"
                      checked={activeStates.offer}
                      onCheckedChange={() => toggleActive("offer")}
                    />
                    <label
                      htmlFor="offer-active"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Webhook Call Offer:
                    </label>
                  </div>
                  <button
                    onClick={() => {
                      // Copy offer webhook URL to clipboard
                      navigator.clipboard
                        .writeText(webhookCallSettings.offer)
                        .then(() => {
                          console.log("Copied offer webhook URL to clipboard:", webhookCallSettings.offer)
                        })
                        .catch((err) => {
                          console.error("Failed to copy:", err)
                        })
                    }}
                    className="text-blue-500 hover:text-blue-700"
                    aria-label="Copy offer webhook URL"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={webhookCallSettings.offer}
                  onChange={(e) => handleInputChange("offer", e.target.value)}
                  className={`webhook-input w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 transition-colors ${getInputBorderClass(
                    activeStates.offer,
                  )}`}
                  disabled={!activeStates.offer}
                  placeholder="https://your-webhook.com/call-offer"
                />
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="accept-active"
                      checked={activeStates.accept}
                      onCheckedChange={() => toggleActive("accept")}
                    />
                    <label
                      htmlFor="accept-active"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Webhook Call Accept:
                    </label>
                  </div>
                  <button
                    onClick={() => {
                      // Copy accept webhook URL to clipboard
                      navigator.clipboard
                        .writeText(webhookCallSettings.accept)
                        .then(() => {
                          console.log("Copied accept webhook URL to clipboard:", webhookCallSettings.accept)
                        })
                        .catch((err) => {
                          console.error("Failed to copy:", err)
                        })
                    }}
                    className="text-blue-500 hover:text-blue-700"
                    aria-label="Copy accept webhook URL"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={webhookCallSettings.accept}
                  onChange={(e) => handleInputChange("accept", e.target.value)}
                  className={`webhook-input w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 transition-colors ${getInputBorderClass(
                    activeStates.accept,
                  )}`}
                  disabled={!activeStates.accept}
                  placeholder="https://your-webhook.com/call-accept"
                />
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="reject-active"
                      checked={activeStates.reject}
                      onCheckedChange={() => toggleActive("reject")}
                    />
                    <label
                      htmlFor="reject-active"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Webhook Call Reject:
                    </label>
                  </div>
                  <button
                    onClick={() => {
                      // Copy reject webhook URL to clipboard
                      navigator.clipboard
                        .writeText(webhookCallSettings.reject)
                        .then(() => {
                          console.log("Copied reject webhook URL to clipboard:", webhookCallSettings.reject)
                        })
                        .catch((err) => {
                          console.error("Failed to copy:", err)
                        })
                    }}
                    className="text-blue-500 hover:text-blue-700"
                    aria-label="Copy reject webhook URL"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={webhookCallSettings.reject}
                  onChange={(e) => handleInputChange("reject", e.target.value)}
                  className={`webhook-input w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 transition-colors ${getInputBorderClass(
                    activeStates.reject,
                  )}`}
                  disabled={!activeStates.reject}
                  placeholder="https://your-webhook.com/call-reject"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="missed-active"
                      checked={activeStates.missed}
                      onCheckedChange={() => toggleActive("missed")}
                    />
                    <label
                      htmlFor="missed-active"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Webhook Call Missed:
                    </label>
                  </div>
                  <button
                    onClick={() => {
                      // Copy missed webhook URL to clipboard
                      navigator.clipboard
                        .writeText(webhookCallSettings.missed)
                        .then(() => {
                          console.log("Copied missed webhook URL to clipboard:", webhookCallSettings.missed)
                        })
                        .catch((err) => {
                          console.error("Failed to copy:", err)
                        })
                    }}
                    className="text-blue-500 hover:text-blue-700"
                    aria-label="Copy missed webhook URL"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={webhookCallSettings.missed}
                  onChange={(e) => handleInputChange("missed", e.target.value)}
                  className={`webhook-input w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 transition-colors ${getInputBorderClass(
                    activeStates.missed,
                  )}`}
                  disabled={!activeStates.missed}
                  placeholder="https://your-webhook.com/call-missed"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex justify-between items-center">
          <div className="relative" ref={copyDropdownRef}>
            <button
              type="button"
              onClick={() => setCopyDropdownOpen(!copyDropdownOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
              aria-label="Copy settings"
            >
              <Copy className="h-5 w-5 text-gray-500" />
            </button>

            {copyDropdownOpen && (
              <div className="absolute left-0 bottom-full mb-2 w-64 bg-background border rounded-md shadow-lg z-50">
                <div className="p-3 border-b">
                  <h3 className="text-sm font-medium">Copy settings to</h3>
                </div>
                <div className="p-2 max-h-[100px] overflow-y-auto thin-scrollbar">
                  <label className="flex items-center p-2 hover:bg-muted/50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      className="mr-2 h-4 w-4 rounded border-gray-300"
                      checked={selectedNumbers.all}
                      onChange={() => handleCheckboxChange("all")}
                    />
                    <span className="text-sm">Copy to all</span>
                  </label>

                  {[
                    { id: "1", name: "Nair España" },
                    { id: "2", name: "Tickets" },
                    { id: "3", name: "Oxeo - Error" },
                    { id: "4", name: "Pepe" },
                    { id: "5", name: "Inglaterra" },
                  ].map((phone) => (
                    <label key={phone.id} className="flex items-center p-2 hover:bg-muted/50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        className="mr-2 h-4 w-4 rounded border-gray-300"
                        checked={selectedNumbers[phone.id]}
                        onChange={() => handleCheckboxChange(phone.id)}
                      />
                      <span className="text-sm">
                        {phone.id} {phone.name}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="p-3 border-t">
                  <button
                    onClick={handleApplySettings}
                    className="w-full py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

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
