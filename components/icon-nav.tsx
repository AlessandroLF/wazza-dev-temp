"use client"

import type React from "react"

import { Check, User, Briefcase, FileText, MessageSquare, Monitor, Mic, PhoneCall, BellRing } from "lucide-react"
import { useState } from "react"

interface IconNavProps {
  phoneIndex: number
  features: {
    user: boolean
    briefcase: boolean
    document: boolean
    message: boolean
    monitor: boolean
    transcribe: boolean
    calls: boolean
    notifications: boolean
  }
  onToggle: (phoneIndex: number, feature: keyof IconNavProps["features"]) => void
}

export function IconNav({ phoneIndex, features, onToggle }: IconNavProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

  const handleToggle = (feature: keyof typeof features, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggle(phoneIndex, feature)
  }

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
      case "notifications":
        return "Internal Notifications"
      default:
        return feature
    }
  }

  return (
    <nav>
      <ul className="flex gap-2 nav flex-wrap">
        <li>
          <button
            className={`feature-icon-btn ${features.user ? "feature-active" : ""}`}
            onClick={(e) => handleToggle("user", e)}
            onMouseEnter={() => setActiveTooltip("user")}
            onMouseLeave={() => setActiveTooltip(null)}
            aria-label="Toggle Send User Feature"
          >
            <User className="h-4 w-4" />
            {features.user && (
              <span className="feature-checkmark">
                <Check className="h-3 w-3" />
              </span>
            )}
            {activeTooltip === "user" && <div className="tooltip-text">{getTooltipText("user")}</div>}
          </button>
        </li>
        <li>
          <button
            className={`feature-icon-btn ${features.briefcase ? "feature-active" : ""}`}
            onClick={(e) => handleToggle("briefcase", e)}
            onMouseEnter={() => setActiveTooltip("briefcase")}
            onMouseLeave={() => setActiveTooltip(null)}
            aria-label="Toggle Send Name Feature"
          >
            <Briefcase className="h-4 w-4" />
            {features.briefcase && (
              <span className="feature-checkmark">
                <Check className="h-3 w-3" />
              </span>
            )}
            {activeTooltip === "briefcase" && <div className="tooltip-text">{getTooltipText("briefcase")}</div>}
          </button>
        </li>
        <li>
          <button
            className={`feature-icon-btn ${features.document ? "feature-active" : ""}`}
            onClick={(e) => handleToggle("document", e)}
            onMouseEnter={() => setActiveTooltip("document")}
            onMouseLeave={() => setActiveTooltip(null)}
            aria-label="Toggle Meta Ads Feature"
          >
            <FileText className="h-4 w-4" />
            {features.document && (
              <span className="feature-checkmark">
                <Check className="h-3 w-3" />
              </span>
            )}
            {activeTooltip === "document" && <div className="tooltip-text">{getTooltipText("document")}</div>}
          </button>
        </li>
        <li>
          <button
            className={`feature-icon-btn ${features.message ? "feature-active" : ""}`}
            onClick={(e) => handleToggle("message", e)}
            onMouseEnter={() => setActiveTooltip("message")}
            onMouseLeave={() => setActiveTooltip(null)}
            aria-label="Toggle Private Contact Feature"
          >
            <MessageSquare className="h-4 w-4" />
            {features.message && (
              <span className="feature-checkmark">
                <Check className="h-3 w-3" />
              </span>
            )}
            {activeTooltip === "message" && <div className="tooltip-text">{getTooltipText("message")}</div>}
          </button>
        </li>
        <li>
          <button
            className={`feature-icon-btn ${features.monitor ? "feature-active" : ""}`}
            onClick={(e) => handleToggle("monitor", e)}
            onMouseEnter={() => setActiveTooltip("monitor")}
            onMouseLeave={() => setActiveTooltip(null)}
            aria-label="Toggle Wazzap Triggers Feature"
          >
            <Monitor className="h-4 w-4" />
            {features.monitor && (
              <span className="feature-checkmark">
                <Check className="h-3 w-3" />
              </span>
            )}
            {activeTooltip === "monitor" && <div className="tooltip-text">{getTooltipText("monitor")}</div>}
          </button>
        </li>
        <li>
          <button
            className={`feature-icon-btn ${features.transcribe ? "feature-active" : ""}`}
            onClick={(e) => handleToggle("transcribe", e)}
            onMouseEnter={() => setActiveTooltip("transcribe")}
            onMouseLeave={() => setActiveTooltip(null)}
            aria-label="Toggle Transcribe Voicenotes Feature"
          >
            <Mic className="h-4 w-4" />
            {features.transcribe && (
              <span className="feature-checkmark">
                <Check className="h-3 w-3" />
              </span>
            )}
            {activeTooltip === "transcribe" && <div className="tooltip-text">{getTooltipText("transcribe")}</div>}
          </button>
        </li>
        <li>
          <button
            className={`feature-icon-btn ${features.calls ? "feature-active" : ""}`}
            onClick={(e) => handleToggle("calls", e)}
            onMouseEnter={() => setActiveTooltip("calls")}
            onMouseLeave={() => setActiveTooltip(null)}
            aria-label="Toggle Calls Feature"
          >
            <PhoneCall className="h-4 w-4" />
            {features.calls && (
              <span className="feature-checkmark">
                <Check className="h-3 w-3" />
              </span>
            )}
            {activeTooltip === "calls" && <div className="tooltip-text">{getTooltipText("calls")}</div>}
          </button>
        </li>
        <li>
          <button
            className={`feature-icon-btn ${features.notifications ? "feature-active" : ""}`}
            onClick={(e) => handleToggle("notifications", e)}
            onMouseEnter={() => setActiveTooltip("notifications")}
            onMouseLeave={() => setActiveTooltip(null)}
            aria-label="Toggle Internal Notifications Feature"
          >
            <BellRing className="h-4 w-4" />
            {features.notifications && (
              <span className="feature-checkmark">
                <Check className="h-3 w-3" />
              </span>
            )}
            {activeTooltip === "notifications" && <div className="tooltip-text">{getTooltipText("notifications")}</div>}
          </button>
        </li>
      </ul>
    </nav>
  )
}
