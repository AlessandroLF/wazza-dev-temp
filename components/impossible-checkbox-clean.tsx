"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"

export default function ImpossibleCheckboxClean() {
  const [isChecked, setIsChecked] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [usedMessages, setUsedMessages] = useState<number[]>([])
  const [currentMessage, setCurrentMessage] = useState("")

  const messages = [
    "Nice try! But this feature is too powerful to enable.",
    "System security protocols prevent this activation.",
    "Error 403: Feature too awesome for production.",
    "The universe has rejected your request.",
    "This would break the laws of physics.",
    "Even Chuck Norris couldn't enable this.",
    "System says: só amanhã, amigo.",
    "System says: can lah? No lah!",
    "Denied: liberté, égalité… but not this feature.",
    "Error 505: No mames wey, this can't be enabled.",
    "Your karma balance is too low to enable this.",
    "Fate says: not today, amigo.",
    "Management has decided you're not ready.",
    "You need to eat more piSaaS!",
    "Bruh… you really thought? WAZAAAAP denial mode ON.",
    "Yooo! WAZZAAAP! This feature is on vacation.",
    "Sorry darling, this feature is too exclusive for you.",
    "This feature doesn't speak broke.",
    "Feature locked: needs more foreplay.",
    "System says: not tonight, I have a headache.",
    "Denied. Bribe the founders with tacos first.",
    "Founders demand pizza tribute before enabling this.",
    "Mark Zuckerberg personally blocked this.",
    "Congrats, you unlocked absolutely nothing.",
    "Your credit card has been charged… oh wait, denied anyway.",
    "Sorry, your ex is still paying for this feature.",
    "Your ex has the password. Good luck with that.",
    "The dog ate this activation request.",
    "Checkbox wonders why you even tried.",
    "Sorry, you need Internet Explorer 6 to enable this.",
    "Feature exclusive to Wazzap version 1.0 beta.",
    "Activation denied. Please cry elsewhere.",
    "Sorry, the Pope revoked this feature last Sunday.",
    "Activation blocked: needs approval from all 12 apostles.",
    "Activation denied: do 50 pushups first.",
    "Activation scheduled for February 30th.",
    "System rejected: you didn't leave cookies and milk.",
    "Santa outsourced this feature to the Grinch.",
    "AI says you're not human enough to enable this.",
    "System rejected: robots voted no.",
    "Checkbox wonders if it even exists.",
    "Activation cancelled: fourth wall broken.",
    "Denied: AI detected 0% intelligence in this click.",
    "Sorry, AI hallucinated your permission.",
    "Checkbox wonders how you survived this long.",
    "Activation blocked: common sense module missing.",
    "Request denied: user not found (brain.exe missing).",
    "Wow, you really clicked that? Bold move, genius.",
    "Feature requires common sense v2.0 — you're still on beta.",
    "Congrats, you just proved evolution isn't linear.",
    "Checkbox wonders if you were always this consistent… at failing.",
    "Keep going champ, maybe after 10,000 clicks it'll work.",
    "Maybe after 1 million clicks I'll think about it.",
    "Almost there! (Just kidding, you'll never get there.)",
    "Checkbox says: persistence unlocked… competence still missing.",
    "Oh look, another pointless tap. Adorable.",
    "Denied: the audacity of hope is strong with you.",
    "Checkbox says: stop clicking, start thinking.",
    "Rejected: even your WiFi has better consistency.",
    "Checkbox says: you've unlocked the illusion of progress.",
    "Checkbox wonders how you function outside of this page.",
    "Denied: even Clippy thinks you need help.",
    "Checkbox says: too much TikTok, zero neurons detected.",
    "Denied: please stop swiping, this isn't Tinder.",
    "Congrats, you just unlocked… more brain rot.",
    "Denied: try again after touching grass.",
    "Activation failed: aura smells like Mercury retrograde.",
  ]

  const handleToggle = () => {
    if (!isChecked) {
      setIsChecked(true)
      setAttempts((prev) => prev + 1)
      setShowMessage(true)

      let availableIndices = []
      for (let i = 0; i < messages.length; i++) {
        if (!usedMessages.includes(i)) {
          availableIndices.push(i)
        }
      }

      // Reset used messages if all have been shown
      if (availableIndices.length === 0) {
        availableIndices = Array.from({ length: messages.length }, (_, i) => i)
        setUsedMessages([])
      }

      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
      setCurrentMessage(messages[randomIndex])
      setUsedMessages((prev) => [...prev, randomIndex])

      setTimeout(() => {
        setIsChecked(false)
        setTimeout(() => {
          setShowMessage(false)
        }, 7000) // Changed from 3000 to 7000 (7 seconds)
      }, 2000)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">Perfect Stability Mode</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Enable 0% chance of getting banned, perfect stability and bug-free mode
          </p>
        </div>

        <button
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
            isChecked ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
              isChecked ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Message popup */}
      {showMessage && (
        <div
          className={`p-4 rounded-xl border transition-all duration-500 ${
            isChecked
              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
          }`}
        >
          <div className="flex items-start gap-3">
            {isChecked ? (
              <div className="flex-shrink-0 w-5 h-5 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mt-0.5">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              </div>
            ) : (
              <AlertTriangle className="flex-shrink-0 w-5 h-5 text-red-500 mt-0.5" />
            )}

            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${
                  isChecked ? "text-blue-900 dark:text-blue-100" : "text-red-900 dark:text-red-100"
                }`}
              >
                {isChecked ? "Activating Perfect Mode..." : "Activation Failed"}
              </p>
              <p
                className={`text-xs mt-1 ${
                  isChecked ? "text-blue-700 dark:text-blue-300" : "text-red-700 dark:text-red-300"
                }`}
              >
                {isChecked ? "Initializing quantum stability protocols..." : currentMessage}{" "}
                {/* Use currentMessage instead of array lookup */}
              </p>
            </div>
          </div>
        </div>
      )}

      {attempts > 0 && (
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Attempts: {attempts} • Success Rate: 0%</p>
        </div>
      )}
    </div>
  )
}
