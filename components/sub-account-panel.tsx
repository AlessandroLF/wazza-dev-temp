"use client"

import { useState } from "react"
import { Edit, Check, Copy, ExternalLink, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type SubAccountItem = {
  type: string
  name: string
  locationId: string
  customId: string
  whiteId: string
  sessions: number
  isConnected: boolean
  status: boolean
  refreshAt: string | null
}

function getAuthFromStorage() {
  try {
    const raw = localStorage.getItem("wazzap_auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.jwt === "string") return parsed as { userId: string; jwt: string };
  } catch {}
  return null;
}

async function handleDeleteSubaccount(customId: string) {
  const auth = getAuthFromStorage?.() ?? JSON.parse(localStorage.getItem("wazzap_auth") || "null");
  const jwt = auth?.jwt;
  if (!jwt) {
    alert("Not authenticated. Please log in again.");
    return;
  }

  try {
    const res = await fetch(`/api/wazzap/subaccount/${customId}`, {
      method: "DELETE",
      headers: {
        Authorization: jwt,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}), // empty JSON body
      cache: "no-store",
    });

    const raw = await res.text();
    let msg = raw;
    try {
      const json = JSON.parse(raw);
      msg = json?.message || raw;
    } catch {}

    if (!res.ok) {
      alert(`Delete failed: ${msg || `HTTP ${res.status}`}`);
      return;
    }

    alert(msg || "The subaccount was successfully deleted.");
    // TODO: trigger refresh in parent
  } catch (err: any) {
    alert(`Network error: ${err?.message || err}`);
  }
}

async function resetSubaccountPassword(subaccountId: string) {
  const auth = getAuthFromStorage()
  if (!auth?.jwt) {
    alert("Not authenticated")
    return
  }

  try {
    const res = await fetch(`https://dev-api-front.wazzap.me/admin/subaccount/reset/${subaccountId}`,
      {
        method: "PUT",
        headers: {
          Authorization: auth.jwt,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}), // empty body
      }
    )

    const text = await res.text()
    try {
      const json = JSON.parse(text)
      alert(JSON.stringify(json))
    } catch {
      alert(text)
    }
  } catch (err: any) {
    alert(`Network error: ${err?.message || err}`)
  }
}

async function disconnectSubaccount(subaccountId: string) {
  const auth = getAuthFromStorage()
  if (!auth?.jwt) {
    alert("Not authenticated")
    return
  }

  try {
    const res = await fetch(`https://dev-api-front.wazzap.me/admin/subaccount/disconnect/${subaccountId}`,
      {
        method: "PUT",
        headers: {
          Authorization: auth.jwt,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}), // empty body
      }
    )

    const text = await res.text()
    try {
      const json = JSON.parse(text)
      alert(JSON.stringify(json))
    } catch {
      alert(text)
    }
  } catch (err: any) {
    alert(`Network error: ${err?.message || err}`)
  }
}

export default function SubAccountPanel({
  items = [],
  onNavigateToSubAccount,
}: {
  items?: SubAccountItem[]
  onNavigateToSubAccount?: () => void
}) {
  const [managedIndex, setManagedIndex] = useState<number | null>(null)
  const [expanded, setExpanded] = useState<{ idx: number | null; color: "red" | "blue" | "yellow" | "green" | null }>({
    idx: null,
    color: null,
  })
  const [copiedWhiteLabelUrl, setCopiedWhiteLabelUrl] = useState(false)
  const [copiedSubAccountUrl, setCopiedSubAccountUrl] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState<{
    show: boolean
    action: string
    type: "delete" | "reset" | "disconnect"
    targetId?: string
  }>({
    show: false,
    action: "",
    type: "delete",
  })

  return (
    <>
      <div className="mb-6 group">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Active Sub-Accounts</h3>

        {items.map((item, i) => (
          <Card
            key={item.customId || `${item.name}-${i}`}
            className="rounded-2xl border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 mb-6"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {item.name?.[0]?.toUpperCase() || "W"}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{item.name}</h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {item.sessions} whatsapp limit
                      </span>
                    </div>

                    {/* Status dots (kept hardwired) */}
                    <div className="flex items-center gap-4 text-sm mt-1">
                      <button
                        className="flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded px-2 py-1 transition-colors"
                        onClick={() =>
                          setExpanded((prev) =>
                            prev.idx === i && prev.color === "red" ? { idx: null, color: null } : { idx: i, color: "red" },
                          )
                        }
                      >
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        <span className="text-slate-600 dark:text-slate-400">1</span>
                      </button>
                      <button
                        className="flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded px-2 py-1 transition-colors"
                        onClick={() =>
                          setExpanded((prev) =>
                            prev.idx === i && prev.color === "blue" ? { idx: null, color: null } : { idx: i, color: "blue" },
                          )
                        }
                      >
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        <span className="text-slate-600 dark:text-slate-400">1</span>
                      </button>
                      <button
                        className="flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded px-2 py-1 transition-colors"
                        onClick={() =>
                          setExpanded((prev) =>
                            prev.idx === i && prev.color === "yellow"
                              ? { idx: null, color: null }
                              : { idx: i, color: "yellow" },
                          )
                        }
                      >
                        <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                        <span className="text-slate-600 dark:text-slate-400">1</span>
                      </button>
                      <button
                        className="flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded px-2 py-1 transition-colors"
                        onClick={() =>
                          setExpanded((prev) =>
                            prev.idx === i && prev.color === "green"
                              ? { idx: null, color: null }
                              : { idx: i, color: "green" },
                          )
                        }
                      >
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-slate-600 dark:text-slate-400">2</span>
                      </button>
                      <button
                        onClick={() => {
                          console.log("Refreshing connection status...")
                          // Add refresh logic here
                        }}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                        title="Refresh status"
                      >
                        <RefreshCw className="h-3 w-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300" />
                      </button>
                    </div>

                    {expanded.idx === i && expanded.color && (
                      <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        {expanded.color === "red" && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                <span className="font-medium text-slate-900 dark:text-slate-100">Nair España</span>
                                <span className="text-slate-500 dark:text-slate-400">•••••••••</span>
                              </div>
                              <button
                                onClick={() => alert("Edit connection (red)")}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                                title="Edit connection"
                              >
                                <Edit className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                              </button>
                            </div>
                          </div>
                        )}
                        {expanded.color === "blue" && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                <span className="font-medium text-slate-900 dark:text-slate-100">Pepe</span>
                                <span className="text-slate-500 dark:text-slate-400">•••••••0943</span>
                              </div>
                              <button
                                onClick={() => alert("Edit connection (blue)")}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                                title="Edit connection"
                              >
                                <Edit className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                              </button>
                            </div>
                          </div>
                        )}
                        {expanded.color === "yellow" && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                                <span className="font-medium text-slate-900 dark:text-slate-100">Oxeo - Error</span>
                                <span className="text-slate-500 dark:text-slate-400">•••••••2725</span>
                              </div>
                              <button
                                onClick={() => alert("Edit connection (yellow)")}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                                title="Edit connection"
                              >
                                <Edit className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                              </button>
                            </div>
                          </div>
                        )}
                        {expanded.color === "green" && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              <span className="font-medium text-slate-900 dark:text-slate-100">Tickets</span>
                              <span className="text-slate-500 dark:text-slate-400">•••••••5325</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              <span className="font-medium text-slate-900 dark:text-slate-100">Inglaterra</span>
                              <span className="text-slate-500 dark:text-slate-400">•••••••1568</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${item.isConnected ? "bg-green-500" : "bg-red-500"}`} />
                    <span
                      className={`text-sm font-medium ${
                        item.isConnected ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {item.isConnected ? "Connected" : "Disconnected"}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 bg-transparent"
                    onClick={() => setManagedIndex((prev) => (prev === i ? null : i))}
                  >
                    Manage
                  </Button>
                </div>
              </div>

              {/* Manage panel (kept hardwired), shown per-card */}
              {managedIndex === i && (
                <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Sub-Account URL</p>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-600">
                      <span className="text-sm text-slate-700 dark:text-slate-300 font-mono truncate flex-1">
                        https://wazzap.app/sub/wazzap-sub-account
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText("https://wazzap.app/sub/wazzap-sub-account")
                          setCopiedSubAccountUrl(true)
                          setTimeout(() => setCopiedSubAccountUrl(false), 2000)
                        }}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                        title="Copy Sub-Account URL"
                      >
                        {copiedSubAccountUrl ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          if (onNavigateToSubAccount) {
                            onNavigateToSubAccount()
                          } else {
                            window.open("https://wazzap.app/sub/wazzap-sub-account", "_blank")
                          }
                        }}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                        title="Go to Sub-Account"
                      >
                        <ExternalLink className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">White label URL</p>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-600">
                      <span className="text-sm text-slate-700 dark:text-slate-300 font-mono truncate flex-1">
                        https://your-domain.com/wazzap-sub-account
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText("https://your-domain.com/wazzap-sub-account")
                          setCopiedWhiteLabelUrl(true)
                          setTimeout(() => setCopiedWhiteLabelUrl(false), 2000)
                        }}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                        title="Copy White label URL"
                      >
                        {copiedWhiteLabelUrl ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        )}
                      </button>
                      <button
                        onClick={() => window.open("https://your-domain.com/wazzap-sub-account", "_blank")}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                        title="Open White label URL"
                      >
                        <ExternalLink className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex flex-wrap gap-3 justify-center">
                      <button
                        onClick={() => {
                          setShowConfirmation({
                            show: true,
                            action: "delete sub-account",
                            type: "delete",
                            targetId: item.customId,
                          })
                        }}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors text-sm"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => {
                          setShowConfirmation({
                            show: true,
                            action: "reset password",
                            type: "reset",
                            targetId: item.customId,
                          })
                        }}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors text-sm"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => {
                          setShowConfirmation({
                            show: true,
                            action: "disconnect sub-account",
                            type: "disconnect",
                            targetId: item.customId,
                          })
                        }}
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors text-sm"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

      </div>

      {showConfirmation.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md mx-4 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Are you sure?</h3>
              {showConfirmation.type === "delete" && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Deletes everything: settings, CRM connection, and numbers.
                </p>
              )}
              {showConfirmation.type === "reset" && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Password will reset to default → admin</p>
              )}
              {showConfirmation.type === "disconnect" && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Disconnect CRM — numbers remain linked.</p>
              )}
              <div className="flex gap-3 justify-center mt-6">
                <button
                  onClick={async () => {
                    try {
                      if (showConfirmation.type === "delete" && showConfirmation.targetId) {
                        await handleDeleteSubaccount(showConfirmation.targetId)
                      } else if (showConfirmation.type === "reset" && showConfirmation.targetId) {
                        await resetSubaccountPassword(showConfirmation.targetId)
                      } else if (showConfirmation.type === "disconnect" && showConfirmation.targetId) {
                        await disconnectSubaccount(showConfirmation.targetId)
                      } else {
                        console.log(showConfirmation.action)
                      }
                    } finally {
                      setShowConfirmation({ show: false, action: "", type: "delete", targetId: undefined })
                    }
                  }}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowConfirmation({ show: false, action: "", type: "delete" })}
                  className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
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
