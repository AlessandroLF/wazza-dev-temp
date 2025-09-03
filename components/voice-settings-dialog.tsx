"use client"

import { useState, useEffect, useRef } from "react"
import { X, ChevronDown, Check, Copy } from "lucide-react"

interface VoiceSettingsDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (settings: VoiceSettings) => void
  initialSettings: VoiceSettings
}

interface VoiceSettings {
  processor: "OpenAI" | "ElevenLabs"
  openAiVoice: string
  elevenLabsVoice: string
}

export function VoiceSettingsDialog({
  isOpen,
  onClose,
  onSave,
  initialSettings = {
    processor: "OpenAI",
    openAiVoice: "alloy",
    elevenLabsVoice: "",
  },
}: VoiceSettingsDialogProps) {
  const [settings, setSettings] = useState<VoiceSettings>(initialSettings)
  const [processorDropdownOpen, setProcessorDropdownOpen] = useState(false)
  const [openAiVoiceDropdownOpen, setOpenAiVoiceDropdownOpen] = useState(false)
  const [elevenLabsVoiceDropdownOpen, setElevenLabsVoiceDropdownOpen] = useState(false)
  const [elevenLabsVoices, setElevenLabsVoices] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
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
  const processorRef = useRef<HTMLDivElement>(null)
  const openAiVoiceRef = useRef<HTMLDivElement>(null)
  const elevenLabsVoiceRef = useRef<HTMLDivElement>(null)
  const copyDropdownRef = useRef<HTMLDivElement>(null)

  const openAiVoices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"]

  useEffect(() => {
    if (isOpen) {
      // Prevent body scrolling when dialog is open
      document.body.style.overflow = "hidden"
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
      if (processorRef.current && !processorRef.current.contains(e.target as Node)) {
        setProcessorDropdownOpen(false)
      }
      if (openAiVoiceRef.current && !openAiVoiceRef.current.contains(e.target as Node)) {
        setOpenAiVoiceDropdownOpen(false)
      }
      if (elevenLabsVoiceRef.current && !elevenLabsVoiceRef.current.contains(e.target as Node)) {
        setElevenLabsVoiceDropdownOpen(false)
      }
      if (copyDropdownRef.current && !copyDropdownRef.current.contains(e.target as Node)) {
        setCopyDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!isOpen) return null

  const handleSave = () => {
    onSave(settings)
  }

  const selectProcessor = (processor: "OpenAI" | "ElevenLabs") => {
    setSettings((prev) => ({
      ...prev,
      processor,
    }))
    setProcessorDropdownOpen(false)
  }

  const selectOpenAiVoice = (voice: string) => {
    setSettings((prev) => ({
      ...prev,
      openAiVoice: voice,
    }))
    setOpenAiVoiceDropdownOpen(false)
  }

  const selectElevenLabsVoice = (voice: string) => {
    setSettings((prev) => ({
      ...prev,
      elevenLabsVoice: voice,
    }))
    setElevenLabsVoiceDropdownOpen(false)
  }

  const fetchVoices = () => {
    // Simulate fetching voices from ElevenLabs API
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setElevenLabsVoices([
        "Dorothy (premade)",
        "Rachel (premade)",
        "Josh (premade)",
        "Emily (premade)",
        "Michael (premade)",
      ])
      setSettings((prev) => ({
        ...prev,
        elevenLabsVoice: "Dorothy (premade)",
      }))
    }, 1000)
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
    console.log("Copying settings to selected numbers:", selectedNumbers)
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
          <h2 className="text-base font-medium">Voice Settings</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto thin-scrollbar max-h-[60vh]" ref={contentRef}>
          <div className="space-y-6">
            {/* Processor Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Processor</label>
              <div className="relative" ref={processorRef}>
                <div
                  className="flex items-center justify-between w-full px-3 py-2 text-sm border rounded-md cursor-pointer"
                  onClick={() => setProcessorDropdownOpen(!processorDropdownOpen)}
                >
                  <span>{settings.processor}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </div>

                {processorDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
                    {["OpenAI", "ElevenLabs"].map((processor) => (
                      <div
                        key={processor}
                        className="flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-muted"
                        onClick={() => selectProcessor(processor as "OpenAI" | "ElevenLabs")}
                      >
                        <span>{processor}</span>
                        {settings.processor === processor && <Check className="h-4 w-4 text-primary" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* OpenAI specific settings */}
            {settings.processor === "OpenAI" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium">OpenAI Voice</label>
                <div className="relative" ref={openAiVoiceRef}>
                  <div
                    className="flex items-center justify-between w-full px-3 py-2 text-sm border rounded-md cursor-pointer"
                    onClick={() => setOpenAiVoiceDropdownOpen(!openAiVoiceDropdownOpen)}
                  >
                    <span>{settings.openAiVoice}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </div>

                  {openAiVoiceDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {openAiVoices.map((voice) => (
                        <div
                          key={voice}
                          className="flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-muted"
                          onClick={() => selectOpenAiVoice(voice)}
                        >
                          <span>{voice}</span>
                          {settings.openAiVoice === voice && <Check className="h-4 w-4 text-primary" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ElevenLabs specific settings */}
            {settings.processor === "ElevenLabs" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium">Voice ElevenLabs</label>
                  <button
                    onClick={fetchVoices}
                    className="px-3 py-1 text-sm bg-black text-white rounded-md hover:bg-gray-800"
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Fetch voices!"}
                  </button>
                </div>
                <div className="relative" ref={elevenLabsVoiceRef}>
                  <div
                    className="flex items-center justify-between w-full px-3 py-2 text-sm border rounded-md cursor-pointer"
                    onClick={() => setElevenLabsVoiceDropdownOpen(!elevenLabsVoiceDropdownOpen)}
                  >
                    <span>{settings.elevenLabsVoice || "---"}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </div>

                  {elevenLabsVoiceDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {elevenLabsVoices.length > 0 ? (
                        elevenLabsVoices.map((voice) => (
                          <div
                            key={voice}
                            className="flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-muted"
                            onClick={() => selectElevenLabsVoice(voice)}
                          >
                            <span>{voice}</span>
                            {settings.elevenLabsVoice === voice && <Check className="h-4 w-4 text-primary" />}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          <span>---</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
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
            className="px-6 py-2 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 transition-colors"
          >
            Save changes
          </button>
        </div>
      </div>
    </>
  )
}
