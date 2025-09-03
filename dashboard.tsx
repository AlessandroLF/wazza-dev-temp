"use client"

import { useState, useEffect, useRef } from "react"
import {
  AlertTriangle,
  MessageSquare,
  Plus,
  Shield,
  Smartphone,
  User,
  Briefcase,
  FileText,
  Mic,
  PhoneCall,
  BellRing,
  Tag,
  CircleIcon,
  Users,
  PhoneOff,
  Monitor,
  Megaphone,
  ChevronRight,
  X,
  CheckCircle,
  XCircle,
  Settings,
  Copy,
  Phone,
  Check,
  ExternalLink,
  LogOut,
  Bell,
} from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserDropdown as UserDropdownComponent } from "@/components/user-dropdown"
import { AnimatedNumber } from "@/components/animated-number"
import { CustomTagDialog } from "@/components/custom-tag-dialog"
import { QRCodeDialog } from "@/components/qr-code-dialog"
import { WazzapTriggersDialog } from "@/components/wazzap-triggers-dialog"
import { VoiceSettingsDialog } from "@/components/voice-settings-dialog"
import { WebhookCallSettingsDialog } from "@/components/webhook-call-settings-dialog"
import { GeneralSettingsDialog } from "@/components/general-settings-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import AdminPanel from "@/components/admin-panel"

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState("connections")
  const [adminActiveNav, setAdminActiveNav] = useState("sub-accounts")
  const [showAdminPanel, setShowAdminPanel] = useState(true)
  const [isIntegrationConnected, setIsIntegrationConnected] = useState(false)
  const [isSpintaxActivated, setIsSpintaxActivated] = useState(false)
  const [spintaxSettings, setSpintaxSettings] = useState({
    spintax1: "Hola, Buen día, Qué tal",
    spintax2: "",
    spintax3: "",
    spintax4: "",
    spintax5: "",
    spintax6: "",
    spintax7: "",
    spintax8: "",
    spintax9: "",
    spintax10: "",
  })
  const [isAdminPopoverOpen, setIsAdminPopoverOpen] = useState(false)
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false)
  const [adminPassword, setAdminPassword] = useState("")
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [tagDialogOpen, setTagDialogOpen] = useState(false)
  const [wazzapTriggersDialogOpen, setWazzapTriggersDialogOpen] = useState(false)
  const [voiceSettingsDialogOpen, setVoiceSettingsDialogOpen] = useState(false)
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(null)
  const [newLeadValue, setNewLeadValue] = useState("new-lead")
  const [invalidWaValue, setInvalidWaValue] = useState("invalid-wa")
  const [disconnectedValue, setDisconnectedValue] = useState("disconnected")
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [currentQrNumberName, setCurrentQrNumberName] = useState("")
  const [currentQrIndex, setCurrentQrIndex] = useState<number | null>(null)
  const [webhookCallSettingsDialogOpen, setWebhookCallSettingsDialogOpen] = useState(false)
  const [webhookCallSettings, setWebhookCallSettings] = useState({
    offer: "https://api.example.com/webhook/call-offer",
    accept: "https://api.example.com/webhook/call-accept",
    reject: "https://api.example.com/webhook/call-reject",
    missed: "https://api.example.com/webhook/call-missed",
  })
  const [webhookCallActiveStates, setWebhookCallActiveStates] = useState({
    offer: true,
    accept: false,
    reject: false,
    missed: false,
  })
  const [copyDropdownOpen, setCopyDropdownOpen] = useState(false)
  const [selectedNumbers, setSelectedNumbers] = useState({
    all: false,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  })

  const [expandedFeatures, setExpandedFeatures] = useState<number | null>(null)

  const [generalSettingsDialogOpen, setGeneralSettingsDialogOpen] = useState(false)
  const [generalSettings, setGeneralSettings] = useState({
    disconnectedWebhookUrl: "https://api.example.com/webhook/disconnected",
    n8nApiKey: "",
  })

  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedWhiteLabelUrl, setCopiedWhiteLabelUrl] = useState(false)
  const [whitelabelCopied, setWhitelabelCopied] = useState(false)
  const [copiedSubAccountUrl, setCopiedSubAccountUrl] = useState(false)

  const [expandedStatus, setExpandedStatus] = useState<string | null>(null)
  const [showQRPopup, setShowQRPopup] = useState<string | null>(null)
  const [showManagePanel, setShowManagePanel] = useState(false)
  const [showSettingsPopup, setShowSettingsPopup] = useState(false)

  const [showEditSubAccount, setShowEditSubAccount] = useState(false)
  const [subAccountName, setSubAccountName] = useState("Wazzap Sub-Account")
  const [whatsappLimit, setWhatsappLimit] = useState("50")

  const [showAdminUserDropdown, setShowAdminUserDropdown] = useState(false)
  const adminUserDropdownRef = useRef<HTMLDivElement>(null)

  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState("Wazzap Sub-Account")
  const [isEditingLimit, setIsEditingLimit] = useState(false)
  const [editedLimit, setEditedLimit] = useState("50")

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [showResetPasswordConfirmation, setShowResetPasswordConfirmation] = useState(false)

  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)
  const [confirmationAction, setConfirmationAction] = useState<"delete" | "reset" | null>(null)

  // Add click outside handler for admin user dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (adminUserDropdownRef.current && !adminUserDropdownRef.current.contains(event.target as Node)) {
        setShowAdminUserDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Update the whatsappNumbers array to include status information and feature flags
  const [whatsappNumbers, setWhatsappNumbers] = useState([
    {
      name: "Nair España",
      number: null,
      connected: false,
      status: "disconnected" as const, // disconnected, connected, error, pause
      color: "bg-gray-200",
      assignedUser: "John Doe",
      tagTriggers: {
        newLead: "welcome",
        invalidWa: "invalid-wa",
        disconnected: "disconnected",
      },
      tagTriggersActive: {
        newLead: true,
        invalidWa: true,
        disconnected: false,
      },
      wazzapTriggers: [{ id: "1", condition: "contains message", action: "bot-off", active: true }],
      voiceSettings: {
        processor: "OpenAI" as const,
        openAiVoice: "alloy",
        elevenLabsApiKey: "",
        elevenLabsVoice: "",
        sendTranscription: true,
      },
      priority: 1,
      features: {
        user: false,
        briefcase: false,
        document: false,
        message: false,
        monitor: false,
        transcribe: false,
        calls: false,
        notifications: false,
        groups: false,
        rejectCalls: false,
        transcription: false,
      },
    },
    {
      name: "Tickets",
      number: "+525343535325",
      connected: true,
      status: "connected" as const,
      color: "bg-gray-200",
      assignedUser: "Jane Smith",
      tagTriggers: {
        newLead: "support",
        invalidWa: "invalid-wa",
        disconnected: "disconnected",
      },
      tagTriggersActive: {
        newLead: true,
        invalidWa: false,
        disconnected: false,
      },
      wazzapTriggers: [{ id: "1", condition: "contains message", action: "bot-off", active: true }],
      voiceSettings: {
        processor: "OpenAI" as const,
        openAiVoice: "echo",
        elevenLabsApiKey: "",
        elevenLabsVoice: "",
        sendTranscription: true,
      },
      priority: 2,
      features: {
        user: false,
        briefcase: false,
        document: true,
        message: false,
        monitor: false,
        transcribe: false,
        calls: false,
        notifications: false,
        groups: false,
        rejectCalls: false,
        transcription: false,
      },
    },
    {
      name: "Oxeo - Error",
      number: "+521777242725",
      connected: true,
      status: "error" as const,
      color: "bg-gray-200",
      assignedUser: "John Doe",
      tagTriggers: {
        newLead: "error",
        invalidWa: "invalid-wa",
        disconnected: "disconnected",
      },
      tagTriggersActive: {
        newLead: true,
        invalidWa: false,
        disconnected: false,
      },
      wazzapTriggers: [{ id: "1", condition: "contains message", action: "bot-off", active: true }],
      voiceSettings: {
        processor: "ElevenLabs" as const,
        openAiVoice: "",
        elevenLabsApiKey: "••••••••••••••••••••••••••",
        elevenLabsVoice: "Dorothy (premade)",
        sendTranscription: true,
      },
      priority: 3,
      features: {
        user: false,
        briefcase: true,
        document: false,
        message: true,
        monitor: true,
        transcribe: false,
        calls: false,
        notifications: false,
        groups: false,
        rejectCalls: false,
        transcription: false,
      },
    },
    {
      name: "Pepe",
      number: "+15109940943",
      connected: true,
      status: "pause" as const,
      color: "bg-gray-200",
      assignedUser: "Maria Garcia",
      tagTriggers: {
        newLead: "sales",
        invalidWa: "invalid-wa",
        disconnected: "disconnected",
      },
      tagTriggersActive: {
        newLead: true,
        invalidWa: false,
        disconnected: false,
      },
      wazzapTriggers: [{ id: "1", condition: "contains message", action: "bot-off", active: true }],
      voiceSettings: {
        processor: "OpenAI" as const,
        openAiVoice: "nova",
        elevenLabsApiKey: "",
        elevenLabsVoice: "",
        sendTranscription: false,
      },
      priority: 4,
      features: {
        user: true,
        briefcase: false,
        document: true,
        message: true,
        monitor: true,
        transcribe: false,
        calls: false,
        notifications: false,
        groups: false,
        rejectCalls: false,
        transcription: false,
      },
    },
    {
      name: "Inglaterra",
      number: "+447466531568",
      connected: true,
      status: "connected" as const,
      color: "bg-gray-200",
      assignedUser: "Alex Johnson",
      tagTriggers: {
        newLead: "international",
        invalidWa: "invalid-wa",
        disconnected: "disconnected",
      },
      tagTriggersActive: {
        newLead: true,
        invalidWa: false,
        disconnected: false,
      },
      wazzapTriggers: [{ id: "1", condition: "contains message", action: "bot-off", active: true }],
      voiceSettings: {
        processor: "ElevenLabs" as const,
        openAiVoice: "",
        elevenLabsApiKey: "",
        elevenLabsVoice: "",
        sendTranscription: true,
      },
      priority: 5,
      features: {
        user: false,
        briefcase: false,
        document: false,
        message: true,
        monitor: true,
        transcribe: true,
        calls: false,
        notifications: false,
        groups: false,
        rejectCalls: false,
        transcription: false,
      },
    },
  ])

  // Add a function to get all currently assigned users
  const getAssignedUsers = () => {
    return whatsappNumbers.map((item) => item.assignedUser).filter((user) => user !== "None")
  }

  // Add a function to check if any tag has been customized
  const isTagCustomized = (tagTriggers: { newLead: string; invalidWa: string; disconnected: string }) => {
    return (
      tagTriggers.newLead !== "new-lead" ||
      tagTriggers.invalidWa !== "invalid-wa" ||
      tagTriggers.disconnected !== "disconnected"
    )
  }

  const getActiveFeatureCount = (features: any) => {
    return Object.values(features).filter(Boolean).length
  }

  const getFeatureButtonColor = (activeCount: number, totalCount: number) => {
    const ratio = activeCount / totalCount
    if (ratio === 0) return "bg-gray-100 dark:bg-gray-800 text-gray-400"
    if (ratio === 1) return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
    return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
  }

  const getProgressPercentage = (activeCount: number, totalCount: number) => {
    return (activeCount / totalCount) * 100
  }

  const handleUserSelect = (index: number, user: string) => {
    setWhatsappNumbers((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        assignedUser: user,
      }
      return updated
    })
  }

  // Toggle feature for a specific phone number
  const toggleFeature = (phoneIndex: number, feature: keyof (typeof whatsappNumbers)[0]["features"]) => {
    setWhatsappNumbers((prev) => {
      const updated = [...prev]
      updated[phoneIndex] = {
        ...updated[phoneIndex],
        features: {
          ...updated[phoneIndex].features,
          [feature]: !updated[phoneIndex].features[feature],
        },
      }
      return updated
    })

    console.log(`Toggled ${feature} for ${whatsappNumbers[phoneIndex].name}`)
  }

  // Open tag triggers dialog and set current values
  const openTagDialog = (index: number) => {
    setCurrentEditingIndex(index)
    setNewLeadValue(whatsappNumbers[index].tagTriggers.newLead)
    setInvalidWaValue(whatsappNumbers[index].tagTriggers.invalidWa)
    setDisconnectedValue(whatsappNumbers[index].tagTriggers.disconnected)
    setTagDialogOpen(true)
  }

  // Open wazzap triggers dialog
  const openWazzapTriggersDialog = (index: number) => {
    setCurrentEditingIndex(index)
    setWazzapTriggersDialogOpen(true)
  }

  // Open voice settings dialog
  const openVoiceSettingsDialog = (index: number) => {
    setCurrentEditingIndex(index)
    setVoiceSettingsDialogOpen(true)
  }

  // Open webhook call settings dialog
  const openWebhookCallSettingsDialog = () => {
    setWebhookCallSettingsDialogOpen(true)
  }

  // Open General Settings dialog
  const openGeneralSettingsDialog = () => {
    setGeneralSettingsDialogOpen(true)
  }

  // Save tag trigger values
  const saveTagTriggers = (
    newLeadVal: string,
    invalidWaVal: string,
    disconnectedVal: string,
    activeStates: {
      newLead: boolean
      invalidWa: boolean
      disconnected: boolean
    },
  ) => {
    if (currentEditingIndex !== null) {
      setWhatsappNumbers((prev) => {
        const updated = [...prev]
        updated[currentEditingIndex] = {
          ...updated[currentEditingIndex],
          tagTriggers: {
            newLead: newLeadVal,
            invalidWa: invalidWaVal,
            disconnected: disconnectedVal,
          },
          tagTriggersActive: activeStates,
        }
        return updated
      })
      setTagDialogOpen(false)
    }
  }

  // Save wazzap triggers
  const saveWazzapTriggers = (triggers: any[]) => {
    if (currentEditingIndex !== null) {
      setWhatsappNumbers((prev) => {
        const updated = [...prev]
        updated[currentEditingIndex] = {
          ...updated[currentEditingIndex],
          wazzapTriggers: triggers,
        }
        return updated
      })
      setWazzapTriggersDialogOpen(false)
    }
  }

  // Save voice settings
  const saveVoiceSettings = (settings: any) => {
    if (currentEditingIndex !== null) {
      setWhatsappNumbers((prev) => {
        const updated = [...prev]
        updated[currentEditingIndex] = {
          ...updated[currentEditingIndex],
          voiceSettings: settings,
        }
        return updated
      })
      setVoiceSettingsDialogOpen(false)
    }
  }

  // Save webhook call settings
  const saveWebhookCallSettings = (
    settings: {
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
  ) => {
    setWebhookCallSettings(settings)
    setWebhookCallActiveStates(activeStates)
    setWebhookCallSettingsDialogOpen(false)
  }

  // Save General Settings
  const handleGeneralSettingsSave = (settings: typeof generalSettings) => {
    setGeneralSettings(settings)
    setGeneralSettingsDialogOpen(false)
    console.log("General settings saved:", settings)
  }

  // Change the getTooltipText function to reorder the features
  const getTooltipText = (feature: string) => {
    switch (feature) {
      case "user":
        return "Send User"
      case "briefcase":
        return "Send Name"
      case "document":
        return "Meta Ads"
      case "message":
        return "Private Contact"
      case "monitor":
        return "Wazzap Triggers"
      case "transcribe":
        return "Transcribe Voicenotes"
      case "calls":
        return "Calls"
      case "groups":
        return "WhatsApp Groups"
      case "rejectCalls":
        return "Reject Calls"
      case "transcription":
        return "Transcribe VoiceNotes"
      case "notifications":
        return "Internal"
      default:
        return feature
    }
  }

  // Get status color for the dot
  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "text-green-500"
      case "error":
        return "text-yellow-500"
      case "pause":
        return "text-blue-500"
      case "disconnected":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const openQrDialog = (index: number) => {
    setCurrentQrIndex(index)
    setCurrentQrNumberName(whatsappNumbers[index].name)
    setQrDialogOpen(true)
  }

  const handleRemoveNumber = () => {
    if (currentQrIndex !== null) {
      // Here you would implement the actual removal logic
      console.log(`Removing number at index ${currentQrIndex}`)
      setQrDialogOpen(false)
    }
  }

  const handleEditNumber = () => {
    if (currentQrIndex !== null) {
      // Here you would implement the actual edit logic
      console.log(`Editing number at index ${currentQrIndex}`)
      setQrDialogOpen(false)
    }
  }

  const handleApplySettings = () => {
    // Here you would implement the actual copying logic
    const selectedPhones = Object.entries(selectedNumbers)
      .filter(([key, isSelected]) => isSelected && key !== "all")
      .map(([key]) => {
        const index = Number.parseInt(key) - 1
        return whatsappNumbers[index]?.name || `Number ${key}`
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

  const handleNavChange = (value: string) => {
    setActiveNav(value)
  }

  return (
    <>
      {showAdminPanel ? (
        <AdminPanel onBack={() => setShowAdminPanel(false)} />
      ) : (
        // Main Dashboard View
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
              {/* Logo */}
              <div className="flex items-center gap-4">
                <div className="relative h-8 w-8 rounded-lg overflow-hidden">
                  <Image
                    src="/Cara_Wazzap_1x1.png"
                    alt="Wazzap Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <span className="text-lg font-semibold text-slate-800 dark:text-slate-200">Wazzap</span>
              </div>

              {/* Horizontal Navigation */}
              <nav className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className={`flex items-center gap-2 h-10 px-4 rounded-full transition-all duration-200 ${
                    activeNav === "connections"
                      ? "bg-slate-200 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                  onClick={() => handleNavChange("connections")}
                >
                  <Smartphone className="h-4 w-4" />
                  {activeNav === "connections" && <span className="font-medium">Connections</span>}
                </Button>

                <Button
                  variant="ghost"
                  className={`flex items-center gap-2 h-10 px-3 rounded-full transition-all duration-200 ${
                    activeNav === "commands"
                      ? "bg-slate-200 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                  onClick={() => handleNavChange("commands")}
                >
                  <MessageSquare className="h-4 w-4" />
                  {activeNav === "commands" && <span className="font-medium">Commands</span>}
                </Button>

                <Button
                  variant="ghost"
                  className={`flex items-center gap-2 h-10 px-3 rounded-full transition-all duration-200 ${
                    activeNav === "whitelabel"
                      ? "bg-slate-200 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                  onClick={() => handleNavChange("whitelabel")}
                >
                  <Shield className="h-4 w-4" />
                  {activeNav === "whitelabel" && <span className="font-medium">White label</span>}
                </Button>

                <Button
                  variant="ghost"
                  className={`flex items-center gap-2 h-10 px-3 rounded-full transition-all duration-200 ${
                    activeNav === "settings"
                      ? "bg-slate-200 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                  onClick={() => handleNavChange("settings")}
                >
                  <Settings className="h-4 w-4" />
                  {activeNav === "settings" && <span className="font-medium">Settings</span>}
                </Button>
              </nav>

              {/* User Profile */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200">
                    <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    {/* Red notification dot */}
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                  </button>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setIsAdminPopoverOpen(!isAdminPopoverOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer"
                  >
                    <div className="h-6 w-6 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">A</span>
                    </div>
                  </button>

                  {isAdminPopoverOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 z-50 animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">A</span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-700 dark:text-slate-300">Admin</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">admin@wazzap.mx</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => setShowAdminPanel(true)}
                          className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors w-full"
                        >
                          <span>admin panel</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>

                        <button
                          onClick={() => {
                            console.log("Logging out...")
                            // Add logout logic here
                          }}
                          className="flex items-center gap-2 text-xs text-red-500 hover:text-red-600 transition-colors w-full"
                        >
                          <LogOut className="h-3 w-3" />
                          <span>Log out</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {isAdminPopoverOpen && (
                    <div className="fixed inset-0 z-40" onClick={() => setIsAdminPopoverOpen(false)} />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-20">
            {/* Main Content */}
            <div className="p-6">
              {/* Custom Tag Triggers Dialog */}
              <CustomTagDialog
                isOpen={tagDialogOpen}
                onClose={() => setTagDialogOpen(false)}
                onSave={saveTagTriggers}
                initialNewLeadValue={newLeadValue}
                initialInvalidWaValue={invalidWaValue}
                initialDisconnectedValue={disconnectedValue}
                initialActiveStates={
                  currentEditingIndex !== null
                    ? whatsappNumbers[currentEditingIndex].tagTriggersActive
                    : {
                        newLead: true,
                        invalidWa: false,
                        disconnected: false,
                      }
                }
              />

              {/* Wazzap Triggers Dialog */}
              <WazzapTriggersDialog
                isOpen={wazzapTriggersDialogOpen}
                onClose={() => setWazzapTriggersDialogOpen(false)}
                onSave={saveWazzapTriggers}
                initialTriggers={
                  currentEditingIndex !== null ? whatsappNumbers[currentEditingIndex].wazzapTriggers : []
                }
              />

              {/* Voice Settings Dialog */}
              <VoiceSettingsDialog
                isOpen={voiceSettingsDialogOpen}
                onClose={() => setVoiceSettingsDialogOpen(false)}
                onSave={saveVoiceSettings}
                initialSettings={
                  currentEditingIndex !== null
                    ? whatsappNumbers[currentEditingIndex].voiceSettings
                    : {
                        processor: "OpenAI",
                        openAiVoice: "alloy",
                        elevenLabsApiKey: "",
                        elevenLabsVoice: "",
                        sendTranscription: true,
                      }
                }
              />

              {/* QR Code Dialog */}
              <QRCodeDialog
                isOpen={qrDialogOpen}
                onClose={() => setQrDialogOpen(false)}
                onRemove={handleRemoveNumber}
                onEdit={handleEditNumber}
                numberName={currentQrNumberName}
              />

              {/* Webhook Call Settings Dialog */}
              <WebhookCallSettingsDialog
                isOpen={webhookCallSettingsDialogOpen}
                onClose={() => setWebhookCallSettingsDialogOpen(false)}
                onSave={saveWebhookCallSettings}
                initialWebhookCallSettings={webhookCallSettings}
                initialActiveStates={webhookCallActiveStates}
              />

              {/* General Settings Dialog */}
              <GeneralSettingsDialog
                isOpen={generalSettingsDialogOpen}
                onClose={() => setGeneralSettingsDialogOpen(false)}
                onSave={handleGeneralSettingsSave}
                initialSettings={generalSettings}
              />

              {/* Main content */}
              <div className="container mx-auto p-6">
                <div className="mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                      <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        Wazzap Sub-Account
                      </h2>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card
                      className={`p-6 hover:shadow-md transition-shadow cursor-pointer ${
                        isIntegrationConnected
                          ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                          : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`p-2 rounded-lg ${
                            isIntegrationConnected
                              ? "bg-green-100 dark:bg-green-900/20"
                              : "bg-red-100 dark:bg-red-900/20"
                          }`}
                        >
                          {isIntegrationConnected ? (
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                      </div>
                      <div className="min-h-[60px] flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Status of Integration</p>
                          <div className="text-2xl font-bold">
                            {isIntegrationConnected ? "Connected" : "Disconnected"}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="gap-2 rounded-xl px-4 h-9 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25"
                          onClick={() => setIsIntegrationConnected(!isIntegrationConnected)}
                        >
                          <Plus className="h-3 w-3" />
                          {isIntegrationConnected ? "Disconnect" : "Connect"}
                        </Button>
                      </div>
                    </Card>

                    <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                          <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div
                        className="min-h-[60px] flex items-center
justify-between"
                      >
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">WhatsApp Limit</p>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold">5/10</span>
                            <Badge
                              variant="outline"
                              className="bg-slate-500/10 text-slate-600 border-slate-500/20 text-xs"
                            >
                              50%
                            </Badge>
                          </div>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              className="rounded-xl px-4 h-9 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25"
                            >
                              <Plus className="h-3 w-3" />
                              Add Number
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="rounded-2xl max-w-md">
                            <DialogHeader className="space-y-3">
                              <DialogTitle className="flex items-center justify-center text-lg font-semibold text-slate-800 dark:text-slate-200">
                                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                                New WhatsApp
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label
                                  htmlFor="name"
                                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                  Name:
                                </Label>
                                <Input
                                  id="name"
                                  placeholder="Enter a name for this connection"
                                  className="rounded-lg border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label
                                  htmlFor="priority"
                                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                  Priority:
                                </Label>
                                <Input
                                  id="priority"
                                  defaultValue="1"
                                  className="rounded-lg border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                            <DialogFooter className="flex gap-3 pt-4">
                              <Button
                                variant="outline"
                                className="flex-1 rounded-lg border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 bg-transparent"
                              >
                                Cancel
                              </Button>
                              <Button className="flex-1 bg-blue-500 hover:bg-blue-600 rounded-lg">Save</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </Card>
                  </div>
                </div>

                <Tabs value={activeNav} onValueChange={handleNavChange}>
                  <div className="flex items-center justify-between mb-6">
                    <TabsList className="bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                      <TabsTrigger value="connections" className="rounded-lg px-6">
                        Connections
                      </TabsTrigger>
                      <TabsTrigger value="commands" className="rounded-lg px-6">
                        Commands
                      </TabsTrigger>
                      <TabsTrigger value="whitelabel" className="rounded-lg px-6">
                        White label
                      </TabsTrigger>
                      <TabsTrigger value="settings" className="rounded-lg px-6">
                        Settings
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="commands" className="space-y-6">
                    <Card className="rounded-2xl border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
                      <CardHeader>
                        <CardTitle className="text-xl text-slate-900 dark:text-slate-100">Commands Manual</CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400">
                          Reference guide for available WhatsApp automation commands.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-8">
                        {/* Switch Voice Command */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">#switch_voice</h3>
                            <Button
                              size="sm"
                              onClick={() => navigator.clipboard.writeText("#switch_voice|2|message")}
                              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Copy
                            </Button>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400">
                            The value 999 will choose a random number except the WhatsApp the contact is associated with
                          </p>
                          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
                            <div className="font-mono text-sm text-slate-700 dark:text-slate-300">
                              <strong>Example:</strong> #switch_voice|2|message
                            </div>
                            <div className="font-mono text-sm text-slate-700 dark:text-slate-300">
                              <strong>Example:</strong> #switch_voice|999|message
                            </div>
                          </div>
                        </div>

                        {/* Location Command */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">#location</h3>
                            <Button
                              size="sm"
                              onClick={() =>
                                navigator.clipboard.writeText(
                                  "#location|18.9159721|-99.2388623|Hi World!|Cuernavaca,Morelos",
                                )
                              }
                              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Copy
                            </Button>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400">
                            Sends a location. Specify latitude and longitude to share a specific location.
                          </p>
                          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                            <div className="font-mono text-sm text-slate-700 dark:text-slate-300">
                              <strong>Format:</strong> #location|latitude|longitude|name|direction
                            </div>
                            <div className="font-mono text-sm text-slate-700 dark:text-slate-300 mt-2">
                              <strong>Example:</strong> #location|18.9159721|-99.2388623|Hi World!|Cuernavaca,Morelos
                            </div>
                          </div>
                        </div>

                        {/* Contact Command */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">#contact</h3>
                            <Button
                              size="sm"
                              onClick={() => navigator.clipboard.writeText("#contact|John Doe|521777888123")}
                              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Copy
                            </Button>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400">
                            Sends a contact. Provide the name and number (with country code) of the contact to share.
                          </p>
                          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                            <div className="font-mono text-sm text-slate-700 dark:text-slate-300">
                              <strong>Format:</strong> #contact|Name|Number
                            </div>
                            <div className="font-mono text-sm text-slate-700 dark:text-slate-300 mt-2">
                              <strong>Example:</strong> #contact|John Doe|521777888123
                            </div>
                          </div>
                        </div>

                        {/* Voice Command */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">#voice</h3>
                            <Button
                              size="sm"
                              onClick={() => navigator.clipboard.writeText("#voice|Hello, how are you?")}
                              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Copy
                            </Button>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400">
                            Send personalized voice messages. Requires the ElevenLabs or OpenAI API to be connected.
                            With this command send voice notes.
                          </p>
                          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
                            <div className="font-mono text-sm text-slate-700 dark:text-slate-300">
                              <strong>Format:</strong> #voice|Message
                            </div>
                            <div className="font-mono text-sm text-slate-700 dark:text-slate-300">
                              <strong>Examples:</strong>
                            </div>
                            <div className="font-mono text-sm text-slate-700 dark:text-slate-300 ml-4">
                              #voice|Hello, how are you?
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="connections" className="space-y-6">
                    <Card className="rounded-2xl border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
                      <CardHeader className="flex flex-row items-center justify-between pb-6">
                        <div>
                          <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            Connected WhatsApp Numbers
                          </CardTitle>
                          <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                            Manage your WhatsApp connections and their current status.
                          </CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {whatsappNumbers.map((item, index) => (
                            <div
                              key={index}
                              className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm border border-white/50 dark:border-slate-700/50 p-6 hover:shadow-md transition-all duration-200"
                            >
                              {/* Top row: Priority, Status, Name, and Connect button */}
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {item.priority}
                                  </div>
                                  <CircleIcon className={`h-3 w-3 fill-current ${getStatusColor(item.status)}`} />
                                  <span className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</span>
                                  {item.number && (
                                    <div className="ml-2">
                                      <AnimatedNumber number={item.number} />
                                    </div>
                                  )}
                                  {!item.number && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 px-4 text-sm bg-green-500 text-white border-green-500 hover:bg-green-600 rounded-full font-medium ml-2"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        openQrDialog(index)
                                      }}
                                    >
                                      Connect
                                    </Button>
                                  )}
                                </div>
                              </div>

                              {/* Bottom row: User dropdown, 4 main icons, and three-dots menu */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <UserDropdownComponent
                                    defaultUser={item.assignedUser}
                                    index={index}
                                    totalItems={whatsappNumbers.length}
                                    assignedUsers={getAssignedUsers().filter((user) => user !== item.assignedUser)}
                                    onSelect={(user) => handleUserSelect(index, user)}
                                    showAdminPanel={true}
                                    onAdminPanelClick={() => setShowAdminPanel(true)}
                                  />

                                  <div className="flex items-center gap-2">
                                    <button
                                      className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center justify-center"
                                      onClick={() => openTagDialog(index)}
                                    >
                                      <Tag className="h-4 w-4" />
                                    </button>
                                    <button
                                      className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center justify-center"
                                      onClick={() => openWazzapTriggersDialog(index)}
                                    >
                                      <Monitor className="h-4 w-4" />
                                    </button>
                                    <button
                                      className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center justify-center"
                                      onClick={() => openVoiceSettingsDialog(index)}
                                    >
                                      <Mic className="h-4 w-4" />
                                    </button>
                                    <button
                                      className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center justify-center"
                                      onClick={() => openWebhookCallSettingsDialog()}
                                    >
                                      <PhoneCall className="h-4 w-4" />
                                    </button>
                                    <button
                                      className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center justify-center"
                                      onClick={() => openGeneralSettingsDialog()}
                                    >
                                      <Settings className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>

                                <div className="relative">
                                  <button
                                    onClick={() => setExpandedFeatures(expandedFeatures === index ? null : index)}
                                    className={`w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center ${getFeatureButtonColor(getActiveFeatureCount(item.features), 8)} hover:scale-105`}
                                  >
                                    <div className="relative">
                                      <svg className="w-4 h-4 transform -rotate-90" viewBox="0 0 20 20">
                                        {/* Background circle */}
                                        <circle
                                          cx="10"
                                          cy="10"
                                          r="8"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          opacity="0.2"
                                        />
                                        {/* Progress circle */}
                                        <circle
                                          cx="10"
                                          cy="10"
                                          r="8"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeDasharray={`${2 * Math.PI * 8}`}
                                          strokeDashoffset={`${2 * Math.PI * 8 * (1 - getProgressPercentage(getActiveFeatureCount(item.features), 8) / 100)}`}
                                          className="transition-all duration-500 ease-out"
                                        />
                                      </svg>
                                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-current rounded-full text-xs text-white flex items-center justify-center font-bold">
                                        {getActiveFeatureCount(item.features)}
                                      </div>
                                    </div>
                                  </button>

                                  {expandedFeatures === index && (
                                    <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-50">
                                      {/* Center close button */}
                                      <div className="relative w-48 h-48 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/40 dark:border-white/20 rounded-3xl shadow-2xl">
                                        <button
                                          onClick={() => setExpandedFeatures(null)}
                                          className="absolute w-12 h-12 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-black/30 hover:text-gray-900 dark:hover:text-white transition-all duration-200 shadow-lg flex items-center justify-center z-10"
                                          style={{
                                            left: "50%",
                                            top: "50%",
                                            transform: "translate(-50%, -50%)",
                                          }}
                                        >
                                          <X className="h-5 w-5" />
                                        </button>

                                        {/* Feature buttons arranged in circle */}
                                        {[
                                          { key: "user", icon: User, angle: 0, name: "Send User" },
                                          { key: "briefcase", icon: Briefcase, angle: 45, name: "Send Name" },
                                          { key: "document", icon: Megaphone, angle: 90, name: "Meta Ads" },
                                          { key: "message", icon: MessageSquare, angle: 135, name: "Private Contact" },
                                          {
                                            key: "transcription",
                                            icon: FileText,
                                            angle: 180,
                                            name: "Transcribe VoiceNotes",
                                          },
                                          { key: "groups", icon: Users, angle: 225, name: "WhatsApp Groups" },
                                          { key: "rejectCalls", icon: PhoneOff, angle: 270, name: "Reject Calls" },
                                          { key: "notifications", icon: BellRing, angle: 315, name: "Internal" },
                                        ].map(({ key, icon: Icon, angle, name }) => {
                                          const isActive = item.features[key as keyof typeof item.features]
                                          const radian = (angle * Math.PI) / 180
                                          const radius = 72
                                          const x = Math.cos(radian) * radius
                                          const y = -Math.sin(radian) * radius // Negative to match standard coordinate system

                                          return (
                                            <div key={key} className="relative group">
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  toggleFeature(index, key as keyof typeof item.features)
                                                }}
                                                className={`absolute w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center shadow-lg hover:scale-110 backdrop-blur-md border border-white/20 dark:border-white/10 ${
                                                  isActive
                                                    ? "bg-green-500/90 text-white shadow-green-500/25"
                                                    : "bg-white/20 dark:bg-gray-800/30 text-gray-700 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-gray-700/40"
                                                }`}
                                                style={{
                                                  left: "50%",
                                                  top: "50%",
                                                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                                                }}
                                              >
                                                <Icon className="h-4 w-4 flex-shrink-0" />
                                              </button>
                                              <div
                                                className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black dark:bg-white text-white dark:text-black text-xs px-2 py-1 rounded whitespace-nowrap z-[60] pointer-events-none"
                                                style={{
                                                  left: "50%",
                                                  top: "50%",
                                                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y - 15}px)) translateY(-100%)`,
                                                }}
                                              >
                                                {name}
                                              </div>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="relative"></CardFooter>
                    </Card>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-6">
                    <Card className="rounded-2xl border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
                      <CardHeader>
                        <CardTitle className="text-xl text-slate-900 dark:text-slate-100">General Settings</CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400">
                          Manage the general settings of your Wazzap account.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="openai-key">OpenAI API Key</Label>
                          <div className="flex gap-3">
                            <Input id="openai-key" type="password" placeholder="sk-..." className="rounded-xl" />
                            <Button variant="outline" size="sm" className="rounded-lg bg-transparent">
                              Validate
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="elevenlabs-key">ElevenLabs API Key</Label>
                          <div className="flex gap-3">
                            <Input
                              id="elevenlabs-key"
                              type="password"
                              placeholder="Enter ElevenLabs API key"
                              className="rounded-xl"
                            />
                            <Button variant="outline" size="sm" className="rounded-lg bg-transparent">
                              Validate
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="twilio-sid">Twilio SID</Label>
                          <div className="flex gap-3">
                            <Input id="twilio-sid" placeholder="AC..." className="rounded-xl" />
                            <Button variant="outline" size="sm" className="rounded-lg bg-transparent">
                              Save
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="twilio-token">Twilio Token</Label>
                          <div className="flex gap-3">
                            <Input
                              id="twilio-token"
                              type="password"
                              placeholder="Enter Twilio auth token"
                              className="rounded-xl"
                            />
                            <Button variant="outline" size="sm" className="rounded-lg bg-transparent">
                              Save
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="twilio-number">Twilio Number</Label>
                          <div className="flex gap-3">
                            <Input id="twilio-number" placeholder="+1234567890" className="rounded-xl" />
                            <Button variant="outline" size="sm" className="rounded-lg bg-transparent">
                              Save
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="rounded-xl px-6 h-11 bg-blue-600 hover:bg-blue-700">Save All Changes</Button>
                      </CardFooter>
                    </Card>

                    <Card className="rounded-2xl border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
                      <CardHeader>
                        <CardTitle className="text-xl text-slate-900 dark:text-slate-100">
                          Global Spintax Settings
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400">
                          Configure spintax variables for dynamic message content. Separate options by commas.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="activate-spintax"
                              checked={spintaxSettings.activate}
                              onCheckedChange={(checked) =>
                                setSpintaxSettings((prev) => ({ ...prev, activate: checked as boolean }))
                              }
                            />
                            <Label htmlFor="activate-spintax" className="text-sm font-medium">
                              Activate Spintax
                            </Label>
                          </div>
                          {spintaxSettings.activate && (
                            <Button
                              onClick={() => console.log("Spintax settings saved:", spintaxSettings)}
                              className="rounded-xl bg-blue-600 hover:bg-blue-700"
                            >
                              Save All Changes
                            </Button>
                          )}
                        </div>

                        {spintaxSettings.activate && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label htmlFor="spintax-1">${`{SPINTAX_1}`}</Label>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigator.clipboard.writeText("${SPINTAX_1}")}
                                  className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                                >
                                  <Copy className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                </Button>
                              </div>
                              <Textarea
                                id="spintax-1"
                                placeholder="Hola, Buen día, Qué tal"
                                value={spintaxSettings.spintax1}
                                onChange={(e) => setSpintaxSettings((prev) => ({ ...prev, spintax1: e.target.value }))}
                                className="rounded-xl min-h-[80px] resize-y"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label htmlFor="spintax-2">${`{SPINTAX_2}`}</Label>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigator.clipboard.writeText("${SPINTAX_2}")}
                                  className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                                >
                                  <Copy className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                </Button>
                              </div>
                              <Textarea
                                id="spintax-2"
                                placeholder="Enter comma-separated options"
                                value={spintaxSettings.spintax2}
                                onChange={(e) => setSpintaxSettings((prev) => ({ ...prev, spintax2: e.target.value }))}
                                className="rounded-xl min-h-[80px] resize-y"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label htmlFor="spintax-3">${`{SPINTAX_3}`}</Label>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigator.clipboard.writeText("${SPINTAX_3}")}
                                  className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                                >
                                  <Copy className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                </Button>
                              </div>
                              <Textarea
                                id="spintax-3"
                                placeholder="Enter comma-separated options"
                                value={spintaxSettings.spintax3}
                                onChange={(e) => setSpintaxSettings((prev) => ({ ...prev, spintax3: e.target.value }))}
                                className="rounded-xl min-h-[80px] resize-y"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label htmlFor="spintax-4">${`{SPINTAX_4}`}</Label>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigator.clipboard.writeText("${SPINTAX_4}")}
                                  className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                                >
                                  <Copy className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                </Button>
                              </div>
                              <Textarea
                                id="spintax-4"
                                placeholder="Enter comma-separated options"
                                value={spintaxSettings.spintax4}
                                onChange={(e) => setSpintaxSettings((prev) => ({ ...prev, spintax4: e.target.value }))}
                                className="rounded-xl min-h-[80px] resize-y"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label htmlFor="spintax-5">${`{SPINTAX_5}`}</Label>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigator.clipboard.writeText("${SPINTAX_5}")}
                                  className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                                >
                                  <Copy className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                </Button>
                              </div>
                              <Textarea
                                id="spintax-5"
                                placeholder="Enter comma-separated options"
                                value={spintaxSettings.spintax5}
                                onChange={(e) => setSpintaxSettings((prev) => ({ ...prev, spintax5: e.target.value }))}
                                className="rounded-xl min-h-[80px] resize-y"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label htmlFor="spintax-6">${`{SPINTAX_6}`}</Label>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigator.clipboard.writeText("${SPINTAX_6}")}
                                  className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                                >
                                  <Copy className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                </Button>
                              </div>
                              <Textarea
                                id="spintax-6"
                                placeholder="Enter comma-separated options"
                                value={spintaxSettings.spintax6}
                                onChange={(e) => setSpintaxSettings((prev) => ({ ...prev, spintax6: e.target.value }))}
                                className="rounded-xl min-h-[80px] resize-y"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label htmlFor="spintax-7">${`{SPINTAX_7}`}</Label>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigator.clipboard.writeText("${SPINTAX_7}")}
                                  className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                                >
                                  <Copy className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                </Button>
                              </div>
                              <Textarea
                                id="spintax-7"
                                placeholder="Enter comma-separated options"
                                value={spintaxSettings.spintax7}
                                onChange={(e) => setSpintaxSettings((prev) => ({ ...prev, spintax7: e.target.value }))}
                                className="rounded-xl min-h-[80px] resize-y"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label htmlFor="spintax-8">${`{SPINTAX_8}`}</Label>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigator.clipboard.writeText("${SPINTAX_8}")}
                                  className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                                >
                                  <Copy className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                </Button>
                              </div>
                              <Textarea
                                id="spintax-8"
                                placeholder="Enter comma-separated options"
                                value={spintaxSettings.spintax8}
                                onChange={(e) => setSpintaxSettings((prev) => ({ ...prev, spintax8: e.target.value }))}
                                className="rounded-xl min-h-[80px] resize-y"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label htmlFor="spintax-9">${`{SPINTAX_9}`}</Label>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigator.clipboard.writeText("${SPINTAX_9}")}
                                  className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                                >
                                  <Copy className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                </Button>
                              </div>
                              <Textarea
                                id="spintax-9"
                                placeholder="Enter comma-separated options"
                                value={spintaxSettings.spintax9}
                                onChange={(e) => setSpintaxSettings((prev) => ({ ...prev, spintax9: e.target.value }))}
                                className="rounded-xl min-h-[80px] resize-y"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label htmlFor="spintax-10">${`{SPINTAX_10}`}</Label>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigator.clipboard.writeText("${SPINTAX_10}")}
                                  className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                                >
                                  <Copy className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                </Button>
                              </div>
                              <Textarea
                                id="spintax-10"
                                placeholder="Enter comma-separated options"
                                value={spintaxSettings.spintax10}
                                onChange={(e) => setSpintaxSettings((prev) => ({ ...prev, spintax10: e.target.value }))}
                                className="rounded-xl min-h-[80px] resize-y"
                              />
                            </div>
                          </div>
                        )}
                      </CardContent>

                      {spintaxSettings.activate && (
                        <CardFooter>
                          <Button
                            onClick={() => console.log("Spintax settings saved:", spintaxSettings)}
                            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700"
                          >
                            Save All Changes
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  </TabsContent>

                  <TabsContent value="whitelabel" className="space-y-4">
                    <Card className="rounded-2xl border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
                      <CardHeader className="pb-6">
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                          Whitelabel Settings
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                          Customize with your own brand and simplify settings.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            White label URL
                          </label>
                          <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                            <input
                              type="text"
                              value="https://panel.wazzap/b/dynamicurl"
                              readOnly
                              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-300"
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText("https://panel.wazzap/b/dynamicurl")
                                setWhitelabelCopied(true)
                                setTimeout(() => setWhitelabelCopied(false), 2000)
                              }}
                              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                              title="Copy URL"
                            >
                              {whitelabelCopied ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                              )}
                            </button>
                            <button
                              onClick={() => window.open("https://panel.wazzap/b/dynamicurl", "_blank")}
                              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                              title="Open URL"
                            >
                              <ExternalLink className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>

          {/* QR popup moved to admin panel context above */}

          {isAdminLoginOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-80 shadow-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Admin Access</h2>
                  <button
                    onClick={() => setIsAdminLoginOpen(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter admin password"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (adminPassword) {
                        setIsAdminLoginOpen(false)
                        setAdminPassword("")
                        setIsAdminPanelOpen(true)
                      }
                    }}
                    className="w-full bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-medium transition-colors duration-200"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {isAdminPanelOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Admin Panel</h2>
                  <button
                    onClick={() => setIsAdminPanelOpen(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl"
                  >
                    ×
                  </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Sub-Accounts Stats */}
                  <Card className="rounded-2xl border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        Sub-Accounts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">1</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">of 5 limit</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-600 dark:text-slate-400">Usage</div>
                          <div className="text-lg font-semibold text-blue-600">20%</div>
                        </div>
                      </div>
                      <div className="mt-4 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "20%" }}></div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Numbers Distribution */}
                  <Card className="rounded-2xl border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Phone className="h-5 w-5 text-green-600" />
                        WhatsApp's Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">5</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">of 50 limit</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-600 dark:text-slate-400">Usage</div>
                          <div className="text-lg font-semibold text-green-600">10%</div>
                        </div>
                      </div>
                      <div className="mt-4 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: "10%" }}></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sub-Account Card */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Active Sub-Accounts</h3>
                  <Card className="rounded-2xl border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <span className="text-lg font-bold text-green-600 dark:text-green-400">W</span>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                              Wazzap Sub-Account
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Using 5 of 50 numbers</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">Connected</span>
                          </div>
                          <button
                            onClick={() => setShowEditSubAccount(true)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Manage Sub-Account"
                          >
                            <Settings className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Sub-Account
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 bg-transparent"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Admin Settings
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showEditSubAccount && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl mx-4 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-slate-800 dark:bg-slate-900 text-white rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-yellow-500 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-black">⚠</span>
                </div>
                <h3 className="text-lg font-semibold">Edit Sub-Account</h3>
              </div>
              <button
                onClick={() => setShowEditSubAccount(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 dark:text-slate-100">Name:</label>
                <input
                  type="text"
                  value={subAccountName}
                  onChange={(e) => setSubAccountName(e.target.value)}
                  className="w-full p-3 border-2 border-slate-900 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              {/* WhatsApp Limit Field */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 dark:text-slate-100">Total whatsapp:</label>
                <input
                  type="number"
                  value={whatsappLimit}
                  onChange={(e) => setWhatsappLimit(e.target.value)}
                  className="w-full p-3 border-2 border-slate-900 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              {/* Sub-Account Link */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 dark:text-slate-100">Link Sub-Account:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value="https://panel.wazzap.mx/b/65bd7ea5d5d258b735b49138"
                    readOnly
                    className="flex-1 p-3 border-2 border-slate-900 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm"
                  />
                  <button
                    onClick={() => window.open("https://panel.wazzap.mx/b/65bd7ea5d5d258b735b49138", "_blank")}
                    className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded font-bold transition-colors"
                  >
                    Open
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => {
                    console.log("Edit sub-account:", { subAccountName, whatsappLimit })
                    setShowEditSubAccount(false)
                  }}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded font-bold transition-colors border-2 border-black dark:border-white"
                >
                  Edit
                </button>

                <button
                  onClick={() => {
                    setConfirmationAction("delete")
                    setShowConfirmationDialog(true)
                  }}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded font-bold transition-colors border-2 border-black dark:border-white"
                >
                  Delete
                </button>

                <button
                  onClick={() => {
                    setConfirmationAction("reset")
                    setShowConfirmationDialog(true)
                  }}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded font-bold transition-colors border-2 border-black dark:border-white"
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirmationDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-8 max-w-sm w-full mx-4 border border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">Are you sure?</h3>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    if (confirmationAction === "delete") {
                      console.log("Delete confirmed")
                    } else if (confirmationAction === "reset") {
                      console.log("Reset password confirmed")
                    }
                    setShowEditSubAccount(false)
                    setShowConfirmationDialog(false)
                    setConfirmationAction(null)
                  }}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded font-bold transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() => {
                    setShowConfirmationDialog(false)
                    setConfirmationAction(null)
                  }}
                  className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded font-bold transition-colors"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
