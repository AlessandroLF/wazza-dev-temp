"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import Image from "next/image"
import { AlertTriangle } from "lucide-react"

interface QRCodeDialogProps {
  isOpen: boolean
  onClose: () => void
  onRemove: () => void
  onEdit: () => void
  numberName: string
}

export function QRCodeDialog({ isOpen, onClose, onRemove, onEdit, numberName }: QRCodeDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(numberName)
  const [showConfirmation, setShowConfirmation] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsEditing(false)
      setEditedName(numberName)
      setShowConfirmation(false)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen, numberName])

  const handleSave = () => {
    setIsEditing(false)
    // Here you would typically call a prop function to save the new name
    // For now, we'll just exit edit mode
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedName(numberName) // Reset to original name
  }

  const handleRemoveClick = () => {
    setShowConfirmation(true)
  }

  const handleConfirmRemove = () => {
    setShowConfirmation(false)
    onRemove()
  }

  const handleCancelRemove = () => {
    setShowConfirmation(false)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] max-w-[90vw] bg-white dark:bg-gray-900 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gray-800 dark:bg-gray-900 py-4 px-6 flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3" />
            {isEditing ? (
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-lg font-semibold text-white bg-transparent border-b border-white/30 focus:border-white focus:outline-none px-1"
                autoFocus
              />
            ) : (
              <h2 className="text-lg font-semibold text-white">{numberName}</h2>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 hover:bg-white/10 rounded-lg p-2 transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* QR Code Content */}
        <div className="p-8 flex flex-col items-center bg-white dark:bg-gray-900">
          <div className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">QR scanning</div>

          <div className="border-2 border-gray-900 dark:border-gray-100 p-2 mb-8 bg-white rounded-lg shadow-sm">
            <Image src="/qr-code-generic.png" alt="QR Code" width={200} height={200} className="mx-auto" />
          </div>

          <p className="text-center mb-8 text-gray-600 dark:text-gray-400 text-base">Scan the QR code to connect.</p>

          {showConfirmation && (
            <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm w-full">
              <p className="text-center mb-6 font-semibold text-gray-900 dark:text-gray-100 text-lg">Are you sure?</p>
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
          <div className="flex justify-center gap-4 w-full">
            <button
              onClick={handleRemoveClick}
              className="px-8 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-sm"
            >
              Remove
            </button>
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-8 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-sm"
                >
                  Save
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-sm"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
