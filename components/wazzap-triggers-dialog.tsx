"use client"

import { useState, useEffect, useRef } from "react"
import { X, Plus, Copy } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface WazzapTrigger {
  id: string
  condition: string
  action: string
  active: boolean
}

interface WazzapTriggersDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (triggers: WazzapTrigger[]) => void
  initialTriggers: WazzapTrigger[]
}

export function WazzapTriggersDialog({
  isOpen,
  onClose,
  onSave,
  initialTriggers = [
    { id: "1", condition: "contains message", action: "bot-off", active: true },
    { id: "2", condition: "new contact", action: "welcome", active: false },
    { id: "3", condition: "no response", action: "follow-up", active: false },
  ],
}: WazzapTriggersDialogProps) {
  const [triggers, setTriggers] = useState<WazzapTrigger[]>(initialTriggers)
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
      const firstInput = document.querySelector(".trigger-input") as HTMLInputElement
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
    onSave(triggers)
  }

  const toggleActive = (index: number) => {
    setTriggers((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        active: !updated[index].active,
      }
      return updated
    })
  }

  const updateTriggerCondition = (index: number, value: string) => {
    setTriggers((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        condition: value,
      }
      return updated
    })
  }

  const updateTriggerAction = (index: number, value: string) => {
    setTriggers((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        action: value,
      }
      return updated
    })
  }

  const addNewTrigger = () => {
    if (triggers.length >= 50) {
      // Don't add more triggers if we've reached the limit
      return
    }
    const newId = (triggers.length + 1).toString()
    setTriggers((prev) => [...prev, { id: newId, condition: "contains message", action: "new-tag", active: true }])
  }

  const duplicateTrigger = (index: number) => {
    const triggerToDuplicate = triggers[index]
    const newId = (triggers.length + 1).toString()
    const duplicatedTrigger = {
      ...triggerToDuplicate,
      id: newId,
    }
    setTriggers((prev) => [...prev, duplicatedTrigger])
  }

  const removeTrigger = (index: number) => {
    setTriggers((prev) => prev.filter((_, i) => i !== index))
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

  // Add a function to check if we've reached the trigger limit
  const isAtTriggerLimit = () => {
    return triggers.length >= 50
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] max-w-[90vw] bg-background rounded-lg shadow-lg z-50 flex flex-col overflow-hidden max-h-[90vh]">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-base font-medium">Wazzap Triggers</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto thin-scrollbar max-h-[60vh]" ref={contentRef}>
          <div className="space-y-6">
            <div className="max-h-[300px] overflow-y-auto thin-scrollbar pr-2">
              {triggers.map((trigger, index) => (
                <div key={trigger.id} className="space-y-2 border border-dashed border-gray-200 p-3 rounded-md mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`trigger-${trigger.id}-active`}
                        checked={trigger.active}
                        onCheckedChange={() => toggleActive(index)}
                      />
                      <label
                        htmlFor={`trigger-${trigger.id}-active`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Trigger {trigger.id}:
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => duplicateTrigger(index)}
                        className="text-blue-500 hover:text-blue-700"
                        aria-label="Duplicate trigger"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeTrigger(index)}
                        className="text-red-500 hover:text-red-700"
                        aria-label="Remove trigger"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">(</span>
                    <input
                      type="text"
                      value={trigger.condition}
                      onChange={(e) => updateTriggerCondition(index, e.target.value)}
                      className={`trigger-input w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 transition-colors ${getInputBorderClass(trigger.active)}`}
                      disabled={!trigger.active}
                    />
                    <span className="text-xs text-muted-foreground">|</span>
                    <input
                      type="text"
                      value={trigger.action}
                      onChange={(e) => updateTriggerAction(index, e.target.value)}
                      className={`trigger-input w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 transition-colors ${getInputBorderClass(trigger.active)}`}
                      disabled={!trigger.active}
                    />
                    <span className="text-xs text-muted-foreground">)</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addNewTrigger}
              disabled={isAtTriggerLimit()}
              className={`w-full flex items-center justify-center py-2 border-2 border-dashed rounded-md text-sm transition-colors ${
                isAtTriggerLimit()
                  ? "border-gray-100 text-gray-300 cursor-not-allowed"
                  : "border-gray-200 text-muted-foreground hover:text-foreground hover:border-gray-300"
              }`}
            >
              <Plus className="h-4 w-4 mr-2" />
              {isAtTriggerLimit() ? "Trigger limit reached (50)" : "Add Trigger"}
            </button>
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
