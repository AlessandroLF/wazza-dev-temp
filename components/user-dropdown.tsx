"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Check, Wand2 } from "lucide-react"
import { createPortal } from "react-dom"

interface UserDropdownProps {
  defaultUser?: string
  users?: string[]
  index?: number
  totalItems?: number
  assignedUsers?: string[]
  onSelect?: (user: string) => void
  showAdminPanel?: boolean
  onAdminPanelClick?: () => void
}

export function UserDropdown({
  defaultUser = "John Doe",
  users = [
    "None",
    "John Doe",
    "Jane Smith",
    "Alex Johnson",
    "Maria Garcia",
    "Carlos Rodriguez",
    "Sarah Williams",
    "Michael Brown",
    "Emily Davis",
    "David Wilson",
    "Lisa Martinez",
    "Robert Taylor",
  ],
  index = 0,
  totalItems = 5,
  assignedUsers = [],
  onSelect,
  showAdminPanel = true,
  onAdminPanelClick,
}: UserDropdownProps) {
  const [selectedUser, setSelectedUser] = useState(defaultUser)
  const [isOpen, setIsOpen] = useState(false)
  const [openUpwards, setOpenUpwards] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const [isAutoSwitchActive, setIsAutoSwitchActive] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const magicButtonRef = useRef<HTMLButtonElement>(null)

  // Determine if dropdown should open upwards based on position
  useEffect(() => {
    if (index >= totalItems - 2) {
      setOpenUpwards(true)
    }
  }, [index, totalItems])

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: openUpwards ? rect.top - 192 : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      })
    }
  }, [isOpen, openUpwards])

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (user: string) => {
    setSelectedUser(user)
    setIsOpen(false)
    if (onSelect) {
      onSelect(user)
    }
  }

  const availableUsers = users.filter(
    (user) => user === "None" || user === selectedUser || !assignedUsers.includes(user),
  )

  const dropdownContent = isOpen && (
    <div
      ref={dropdownRef}
      className="fixed z-[9999] rounded-md shadow-lg bg-popover border border-border overflow-hidden"
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
      }}
    >
      <div className="py-1 max-h-48 overflow-y-auto thin-scrollbar">
        {availableUsers.map((user) => (
          <button
            key={user}
            className="flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-muted/50 text-left"
            onClick={() => handleSelect(user)}
          >
            <span>{user}</span>
            {selectedUser === user && <Check className="h-4 w-4 text-primary" />}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="relative inline-flex items-center gap-1 text-left">
      <button
        ref={buttonRef}
        type="button"
        className="inline-flex items-center justify-between w-40 px-3 py-1 text-sm bg-background border border-border rounded-md hover:bg-muted/50 focus:outline-none focus:ring-1 focus:ring-primary"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{selectedUser}</span>
        <ChevronDown className="h-3.5 w-3.5 ml-2 opacity-70" />
      </button>

      <div className="relative">
        <button
          ref={magicButtonRef}
          type="button"
          className={`inline-flex items-center justify-center w-8 h-8 rounded-md border transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-primary ${
            isAutoSwitchActive
              ? "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 shadow-md shadow-purple-200/50 dark:shadow-purple-900/50"
              : "bg-background border-border text-muted-foreground hover:bg-muted/50"
          }`}
          onClick={() => setIsAutoSwitchActive(!isAutoSwitchActive)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Wand2 className="h-3.5 w-3.5" />
        </button>

        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded-md whitespace-nowrap z-50">
            Auto Switch
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black"></div>
          </div>
        )}
      </div>

      {typeof document !== "undefined" && dropdownContent && createPortal(dropdownContent, document.body)}
    </div>
  )
}
