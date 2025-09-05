"use client";

import { useState } from "react";
import { Edit, Check, Copy, ExternalLink, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

import {
  apiDeleteSubaccount,
  apiResetSubaccountPassword,
  apiDisconnectSubaccount,
  apiUpdateSubaccount,
} from "@/lib/api/admin"; // ← adjust path if needed

type SubAccountItem = {
  type: string;
  name: string;
  locationId: string;
  customId: string;
  whiteId: string;
  sessions: number;
  isConnected: boolean;
  status: boolean;
  refreshAt: string | null;
};

export default function SubAccountPanel({
  items = [],
  onNavigateToSubAccount,
  onChanged, // parent can pass a refetch handler to update the list after mutations
}: {
  items?: SubAccountItem[];
  onNavigateToSubAccount?: () => void;
  onChanged?: () => void | Promise<void>;
}) {
  const { toast } = useToast();

  const [managedIndex, setManagedIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<{
    idx: number | null;
    color: "red" | "blue" | "yellow" | "green" | null;
  }>({ idx: null, color: null });

  const [copiedWhiteLabelUrl, setCopiedWhiteLabelUrl] = useState(false);
  const [copiedSubAccountUrl, setCopiedSubAccountUrl] = useState(false);

  const [showConfirmation, setShowConfirmation] = useState<{
    show: boolean;
    action: string;
    type: "delete" | "reset" | "disconnect";
    targetId?: string;
  }>({ show: false, action: "", type: "delete" });

  // ---- EDIT modal state ----
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editInstances, setEditInstances] = useState("1");
  const [editSubmitting, setEditSubmitting] = useState(false);

  async function afterMutationRefresh() {
    if (onChanged) {
      await onChanged();
    } else {
      window.location.reload();
    }
  }

  const msgError = (title: string, description?: string) =>
    toast({ variant: "destructive", title, description });

  async function confirmAndRun() {
    try {
      if (showConfirmation.type === "delete" && showConfirmation.targetId) {
        const res = await apiDeleteSubaccount(showConfirmation.targetId);
        if (!res.ok) {
          msgError(
            "Delete failed",
            (res.json?.message as string) || res.text || `HTTP ${res.status}`
          );
          return;
        }
        toast({
          title: "Subaccount deleted",
          description:
            (res.json?.message as string) || "The subaccount was successfully deleted.",
        });
        await afterMutationRefresh();
      } else if (showConfirmation.type === "reset" && showConfirmation.targetId) {
        const res = await apiResetSubaccountPassword(showConfirmation.targetId);
        const desc =
          (res.json?.message as string) ||
          res.text ||
          "Password reset to default (admin).";
        toast({ title: "Password reset", description: desc });
      } else if (showConfirmation.type === "disconnect" && showConfirmation.targetId) {
        const res = await apiDisconnectSubaccount(showConfirmation.targetId);
        if (!res.ok) {
          msgError(
            "Disconnect failed",
            (res.json?.message as string) || res.text || `HTTP ${res.status}`
          );
          return;
        }
        toast({
          title: "Disconnected",
          description:
            (res.json?.message as string) ||
            "Sub-account disconnected successfully.",
        });
        await afterMutationRefresh();
      } else {
        // no-op
      }
    } catch (err: any) {
      msgError("Network error", err?.message || String(err));
    } finally {
      setShowConfirmation({ show: false, action: "", type: "delete", targetId: undefined });
    }
  }

  function openEditModal(item: SubAccountItem) {
    setEditTargetId(item.customId);
    setEditName(item.name || "");
    setEditInstances(String(item.sessions ?? 1));
    setShowEditModal(true);
  }

  async function handleEditSave() {
    if (!editTargetId) return;
    const name = editName.trim();
    const instances = Number(editInstances || "0") || 0;
    if (!name || instances <= 0) {
      msgError("Invalid input", "Please provide a valid name and whatsapp limit.");
      return;
    }

    setEditSubmitting(true);
    try {
      const res = await apiUpdateSubaccount(editTargetId, { name, instances });
      if (!res.ok) {
        const msg =
          (res.json?.message as string) || res.text || `HTTP ${res.status}`;
        msgError("Update failed", msg);
        return;
      }
      toast({
        title: "Subaccount updated",
        description:
          (res.json?.message as string) || "Subaccount updated successfully.",
      });
      setShowEditModal(false);
      setEditTargetId(null);
      await afterMutationRefresh();
    } catch (err: any) {
      msgError("Network error", err?.message || String(err));
    } finally {
      setEditSubmitting(false);
    }
  }

  return (
    <>
      <div className="mb-6 group">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Active Sub-Accounts
        </h3>

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
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {item.name}
                      </h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {item.sessions} whatsapp limit
                      </span>
                    </div>

                    {/* Status dots (kept demo) */}
                    <div className="flex items-center gap-4 text-sm mt-1">
                      <button
                        className="flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded px-2 py-1 transition-colors"
                        onClick={() =>
                          setExpanded((prev) =>
                            prev.idx === i && prev.color === "red"
                              ? { idx: null, color: null }
                              : { idx: i, color: "red" }
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
                            prev.idx === i && prev.color === "blue"
                              ? { idx: null, color: null }
                              : { idx: i, color: "blue" }
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
                              : { idx: i, color: "yellow" }
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
                              : { idx: i, color: "green" }
                          )
                        }
                      >
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-slate-600 dark:text-slate-400">2</span>
                      </button>
                      <button
                        onClick={() => {
                          console.log("Refreshing connection status...");
                          // Optional: wire a status endpoint here
                        }}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                        title="Refresh status"
                      >
                        <RefreshCw className="h-3 w-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300" />
                      </button>
                    </div>

                    {expanded.idx === i && expanded.color && (
                      <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        {/* demo content retained */}
                        {expanded.color === "red" && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                <span className="font-medium text-slate-900 dark:text-slate-100">Nair España</span>
                                <span className="text-slate-500 dark:text-slate-400">•••••••••</span>
                              </div>
                              <button
                                onClick={() => toast({ title: "Edit connection (demo)" })}
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
                                onClick={() => toast({ title: "Edit connection (demo)" })}
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
                                onClick={() => toast({ title: "Edit connection (demo)" })}
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
                    <div
                      className={`h-2 w-2 rounded-full ${
                        item.isConnected ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        item.isConnected
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
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

              {/* Manage panel */}
              {managedIndex === i && (
                <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Sub-Account URL
                    </p>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-600">
                      {(() => {
                        const subUrl = `https://wazzap.app/b/${item.customId}`;
                        return (
                          <>
                            <span className="text-sm text-slate-700 dark:text-slate-300 font-mono truncate flex-1">
                              {subUrl}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(subUrl);
                                setCopiedSubAccountUrl(true);
                                setTimeout(() => setCopiedSubAccountUrl(false), 2000);
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
                                  onNavigateToSubAccount();
                                } else {
                                  window.open(subUrl, "_blank");
                                }
                              }}
                              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                              title="Go to Sub-Account"
                            >
                              <ExternalLink className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            </button>
                          </>
                        );
                      })()}
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
                          navigator.clipboard.writeText("https://your-domain.com/wazzap-sub-account");
                          setCopiedWhiteLabelUrl(true);
                          setTimeout(() => setCopiedWhiteLabelUrl(false), 2000);
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
                        onClick={() =>
                          window.open("https://your-domain.com/wazzap-sub-account", "_blank")
                        }
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                        title="Open White label URL"
                      >
                        <ExternalLink className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      </button>
                    </div>
                  </div>

                  {/* Action buttons row (now includes EDIT) */}
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex flex-wrap gap-3 justify-center">
                      <button
                        onClick={() => openEditModal(item)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setShowConfirmation({
                            show: true,
                            action: "delete sub-account",
                            type: "delete",
                            targetId: item.customId,
                          });
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
                          });
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
                          });
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

      {/* Confirmation modal */}
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
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Password will reset to default → admin
                </p>
              )}
              {showConfirmation.type === "disconnect" && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Disconnect CRM — numbers remain linked.
                </p>
              )}
              <div className="flex gap-3 justify-center mt-6">
                <button
                  onClick={confirmAndRun}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() =>
                    setShowConfirmation({ show: false, action: "", type: "delete" })
                  }
                  className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Sub-Account modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Edit Sub-Account
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name:</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter sub-account name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    WhatsApp Limit:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editInstances}
                    onChange={(e) => setEditInstances(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditTargetId(null);
                  }}
                  className="flex-1 px-4 py-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={editSubmitting || !editName.trim() || Number(editInstances) <= 0}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  {editSubmitting ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
