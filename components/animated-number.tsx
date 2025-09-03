"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import { Eye, EyeOff, Edit, X, Check, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AnimatedNumberProps {
  number: string | null
  className?: string
  numberName?: string
  priority?: number
}

export function AnimatedNumber({ number, className, numberName = "España", priority = 2 }: AnimatedNumberProps) {
  const [visible, setVisible] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(numberName)
  const [editedPriority, setEditedPriority] = useState(priority)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const displayNumber = number || ""

  // Format the number with spaces for better readability if it exists
  const formattedNumber = number ? number.replace(/(\+\d{2})(\d{3})(\d{3})(\d{4})/, "$1 $2 $3 $4") : ""

  // Get the last 4 digits to always show
  const lastFourDigits = number && number.length > 4 ? number.slice(-4) : ""

  const handleEdit = () => {
    setShowDialog(true)
  }

  const handleSave = () => {
    setIsEditing(false)
    // Here you would typically save the name and priority changes
    console.log("Saving name:", editedName, "priority:", editedPriority)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedName(numberName)
    setEditedPriority(priority)
  }

  const handleRemove = () => {
    setShowConfirmation(true)
  }

  const handleConfirmRemove = () => {
    // Here you would typically handle number removal
    console.log("Removing number:", number)
    setShowDialog(false)
    setShowConfirmation(false)
  }

  const handleCancelRemove = () => {
    setShowConfirmation(false)
  }

  return (
    <>
      <div className={cn("relative flex items-center", className)}>
        {number ? (
          <>
            <div
              className={cn("number-display relative flex items-center h-6 px-1 py-0 bg-transparent text-sm font-mono")}
              data-visible={visible}
            >
              {!visible && number ? (
                <div className="flex items-center">
                  <span className="dots">
                    {Array.from({ length: Math.min(number.length - 4, 8) }).map((_, i) => (
                      <span key={i} className="opacity-70 transition-all" style={{ animationDelay: `${i * 0.05}s` }}>
                        •
                      </span>
                    ))}
                  </span>
                  <span>{lastFourDigits}</span>
                </div>
              ) : (
                <span>{formattedNumber}</span>
              )}
            </div>

            <div className="flex">
              <button
                type="button"
                className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setVisible(!visible)}
                aria-label={visible ? "Hide number" : "Show number"}
              >
                {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>

              <button
                type="button"
                className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Edit number"
                onClick={handleEdit}
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-3 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Conectar
          </Button>
        )}
      </div>

      {showDialog &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md mx-auto my-auto overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="bg-gray-800 dark:bg-gray-900 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  {number || numberName === "España" ? (
                    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">E</span>
                    </div>
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  )}
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editedPriority}
                        onChange={(e) => setEditedPriority(Number.parseInt(e.target.value) || 1)}
                        className="w-12 text-lg font-semibold bg-transparent border-b border-gray-400 text-white focus:outline-none focus:border-white text-center"
                        min="1"
                        max="99"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-white">{priority}</span>
                    )}
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="text-lg font-semibold bg-transparent border-b border-gray-400 text-white focus:outline-none focus:border-white"
                        autoFocus
                      />
                    ) : (
                      <h3 className="text-lg font-semibold text-white">{number ? numberName : `Nair ${numberName}`}</h3>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowDialog(false)}
                  className="text-white hover:bg-gray-700 rounded p-1 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 bg-white dark:bg-gray-900 flex-1 overflow-y-auto">
                {number || numberName === "España" ? (
                  // Connected status content (also applies to Nair España)
                  <div className="text-center mb-6">
                    {number && <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{formattedNumber}</p>}
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="font-medium">WhatsApp Status Connected</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // QR scanning content for disconnected numbers
                  <div className="text-center mb-6">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">QR scanning</h4>

                    {/* QR Code placeholder */}
                    <div className="mb-4 flex justify-center">
                      <div className="w-48 h-48 border-2 border-gray-900 dark:border-gray-100 rounded-lg flex items-center justify-center bg-white">
                        <div className="w-40 h-40 bg-gray-900 dark:bg-gray-100 rounded grid grid-cols-8 gap-1 p-2">
                          {Array.from({ length: 64 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-full h-full ${
                                Math.random() > 0.5 ? "bg-white dark:bg-gray-900" : "bg-gray-900 dark:bg-gray-100"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400">Scan the QR code to connect.</p>
                  </div>
                )}

                {showConfirmation && (
                  <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <p className="text-center text-gray-900 dark:text-gray-100 font-semibold text-lg mb-6">
                      Are you sure?
                    </p>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={handleConfirmRemove}
                        className="px-8 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        Yes
                      </button>
                      <button
                        onClick={handleCancelRemove}
                        className="px-8 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        No
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 w-full flex-wrap">
                  <button
                    onClick={handleRemove}
                    className={`px-6 py-2 rounded font-medium transition-colors ${
                      number
                        ? "border-2 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                        : "bg-red-500 text-white hover:bg-red-600"
                    }`}
                  >
                    Remove
                  </button>
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleCancel}
                        className="px-6 py-2 border-2 border-gray-300 rounded text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-green-500 text-white rounded font-medium hover:bg-green-600 transition-colors flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Save
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 transition-colors"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>,
          window.document.body,
        )}
    </>
  )
}
