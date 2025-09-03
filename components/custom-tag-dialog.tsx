"use client"

import { useState, useEffect, useRef } from "react"
import { X, Copy } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface CustomTagDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (
    newLeadValue: string,
    invalidWaValue: string,
    disconnectedValue: string,
    activeStates: {
      newLead: boolean
      invalidWa: boolean
      disconnected: boolean
    },
  ) => void
  initialNewLeadValue: string
  initialInvalidWaValue: string
  initialDisconnectedValue: string
  initialActiveStates?: {
    newLead: boolean
    invalidWa: boolean
    disconnected: boolean
  }
}

export function CustomTagDialog({
  isOpen,
  onClose,
  onSave,
  initialNewLeadValue,
  initialInvalidWaValue,
  initialDisconnectedValue,
  initialActiveStates = {
    newLead: true,
    invalidWa: false,
    disconnected: false,
  },
}: CustomTagDialogProps) {
  const [newLeadValue, setNewLeadValue] = useState(initialNewLeadValue)
  const [invalidWaValue, setInvalidWaValue] = useState(initialInvalidWaValue)
  const [disconnectedValue, setDisconnectedValue] = useState(initialDisconnectedValue)
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
      const firstInput = document.querySelector(".tag-input") as HTMLInputElement
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
    onSave(newLeadValue, invalidWaValue, disconnectedValue, activeStates)
  }

  const toggleActive = (field: "newLead" | "invalidWa" | "disconnected") => {
    setActiveStates((prev) => ({
      ...prev,
      [field]: !prev[field],
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
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-background rounded-lg shadow-lg z-50 flex flex-col overflow-hidden max-h-[90vh]">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-base font-medium">Tag Triggers</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto thin-scrollbar max-h-[60vh]" ref={contentRef}>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="new-lead-active"
                    checked={activeStates.newLead}
                    onCheckedChange={() => toggleActive("newLead")}
                  />
                  <label
                    htmlFor="new-lead-active"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    new-lead:
                  </label>
                </div>
                <button
                  onClick={() => {
                    // Copy new-lead settings to clipboard
                    navigator.clipboard
                      .writeText(newLeadValue)
                      .then(() => {
                        console.log("Copied new-lead value to clipboard:", newLeadValue)
                      })
                      .catch((err) => {
                        console.error("Failed to copy:", err)
                      })
                  }}
                  className="text-blue-500 hover:text-blue-700"
                  aria-label="Copy new-lead value"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <input
                type="text"
                value={newLeadValue}
                onChange={(e) => setNewLeadValue(e.target.value)}
                className={`tag-input w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 transition-colors ${getInputBorderClass(activeStates.newLead)}`}
                disabled={!activeStates.newLead}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="invalid-wa-active"
                    checked={activeStates.invalidWa}
                    onCheckedChange={() => toggleActive("invalidWa")}
                  />
                  <label
                    htmlFor="invalid-wa-active"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    invalid-wa:
                  </label>
                </div>
                <button
                  onClick={() => {
                    // Copy invalid-wa settings to clipboard
                    navigator.clipboard
                      .writeText(invalidWaValue)
                      .then(() => {
                        console.log("Copied invalid-wa value to clipboard:", invalidWaValue)
                      })
                      .catch((err) => {
                        console.error("Failed to copy:", err)
                      })
                  }}
                  className="text-blue-500 hover:text-blue-700"
                  aria-label="Copy invalid-wa value"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <input
                type="text"
                value={invalidWaValue}
                onChange={(e) => setInvalidWaValue(e.target.value)}
                className={`tag-input w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 transition-colors ${getInputBorderClass(activeStates.invalidWa)}`}
                disabled={!activeStates.invalidWa}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="disconnected-active"
                    checked={activeStates.disconnected}
                    onCheckedChange={() => toggleActive("disconnected")}
                  />
                  <label
                    htmlFor="disconnected-active"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    disconnected:
                  </label>
                </div>
                <button
                  onClick={() => {
                    // Copy disconnected settings to clipboard
                    navigator.clipboard
                      .writeText(disconnectedValue)
                      .then(() => {
                        console.log("Copied disconnected value to clipboard:", disconnectedValue)
                      })
                      .catch((err) => {
                        console.error("Failed to copy:", err)
                      })
                  }}
                  className="text-blue-500 hover:text-blue-700"
                  aria-label="Copy disconnected value"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <input
                type="text"
                value={disconnectedValue}
                onChange={(e) => setDisconnectedValue(e.target.value)}
                className={`tag-input w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 transition-colors ${getInputBorderClass(activeStates.disconnected)}`}
                disabled={!activeStates.disconnected}
              />
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
