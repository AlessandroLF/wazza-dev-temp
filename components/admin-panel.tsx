"use client";

import { useState, useRef, useEffect } from "react";
import { Users, Settings, Phone, Plus, LogOut, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SubAccountPanel from "./sub-account-panel";
import ImpossibleCheckboxClean from "./impossible-checkbox-clean";
import { useToast } from "@/components/ui/use-toast";

import {
  apiAdminLogin,
  apiAdminCheck,
  apiAdminInfo,
  apiCreateSubaccount,
  apiChangePassword,
  getAuthFromStorage,
  setAuth,
  type AdminData,
  type SubscriptionStats,
  type SubAccountItem,
} from "@/lib/api/admin";

// ---------------- utils ----------------
const pct = (used?: number, total?: number) =>
  !total || total <= 0 || !used ? 0 : Math.round((used / total) * 100);

const POLL_MS = 60_000;

// Hydration-safe, deterministic date (UTC) to avoid SSR/CSR drift
function formatDateUTC(dateStr?: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  }).format(d);
}

type AdminPanelProps = {
  data: AdminData;
};

export default function AdminPanel({ data }: AdminPanelProps) {
  const { toast } = useToast();

  // mount guard (for hydration-safe bits like formatted dates)
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [adminActiveNav, setAdminActiveNav] = useState<"sub-accounts" | "settings">("sub-accounts");
  const [showAdminUserDropdown, setShowAdminUserDropdown] = useState(false);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [showCreateSubAccountModal, setShowCreateSubAccountModal] = useState(false);

  // Create sub-account
  const [newSubAccountName, setNewSubAccountName] = useState("");
  const [newSubAccountWhatsappLimit, setNewSubAccountWhatsappLimit] = useState("1");

  // Change password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Settings
  const [customMenuUrl, setCustomMenuUrl] = useState("https://panel.wazzap.mx/g/{{location.id}}");
  const adminUserDropdownRef = useRef<HTMLDivElement>(null);

  // Live data
  const [adminData, setAdminData] = useState<AdminData>(data);
  const [subscription, setSubscription] = useState<SubscriptionStats | null>(null);
  const [subaccounts, setSubaccounts] = useState<SubAccountItem[]>([]);
  const [stripeUrl, setStripeUrl] = useState<string | null>(null);

  // --------- Queries ----------
  async function refreshAdminData(signal?: AbortSignal) {
    const auth = getAuthFromStorage();
    if (!auth?.jwt) return;

    const { ok, json } = await apiAdminCheck({ signal });

    if (!ok || json?.error || (json?.code && json.code >= 400)) {
      const msg = typeof json?.message === "string" ? json.message.toLowerCase() : "";
      if (msg.includes("invalid or expired token")) {
        console.warn("Token expired — TODO: handle re-auth flow here.");
        return;
      }
      console.warn("admin/check failed", json);
      return;
    }

    if (json?.code === 200 && json?.data) {
      setAdminData(json.data as AdminData);
    }
  }

  async function refreshAdminInfo(signal?: AbortSignal) {
    const auth = getAuthFromStorage();
    if (!auth?.jwt) return;

    const { ok, json } = await apiAdminInfo({ signal });

    if (!ok || json?.error || (json?.code && json.code >= 400)) {
      const msg = typeof json?.message === "string" ? json.message.toLowerCase() : "";
      if (msg.includes("invalid or expired token")) {
        console.warn("Token expired (info) — TODO: handle re-auth flow here.");
        return;
      }
      console.warn("admin/info failed", json);
      return;
    }

    if (json?.code === 200 && json?.data) {
      if (json.data.subscription) setSubscription(json.data.subscription as SubscriptionStats);
      if (Array.isArray(json.data.subaccounts)) setSubaccounts(json.data.subaccounts as SubAccountItem[]);
      if (typeof json.data.stripe === "string") setStripeUrl(json.data.stripe as string);
      if (json.data.user) setAdminData(json.data.user as AdminData); // keep user fresh
    }
  }

  useEffect(() => {
  // just do an immediate refresh; no shared AbortController
  refreshAdminData();

  const iv = setInterval(() => {
    // each tick calls without a stale/aborted signal
    refreshAdminData();
  }, POLL_MS);

  const onStorage = (e: StorageEvent) => {
    if (e.key === "wazzap_auth") refreshAdminData();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    clearInterval(iv);
    window.removeEventListener("storage", onStorage);
  };
}, []);

  useEffect(() => {
    refreshAdminInfo();
  }, []);

  // --------- Mutations ----------
  async function handleCreateSubAccountSave() {
    const auth = getAuthFromStorage();
    if (!auth?.jwt) {
      toast({ variant: "destructive", title: "Not authenticated", description: "Please log in again." });
      return;
    }

    const name = newSubAccountName.trim();
    const instances = Number(newSubAccountWhatsappLimit || "0") || 0;

    if (!name || instances <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid data",
        description: "Please provide a valid name and WhatsApp limit.",
      });
      return;
    }

    const res = await apiCreateSubaccount({ name, instances, type: "GHL" });

    if (!res.ok) {
      const msg = (res.json?.message as string) || res.text || `HTTP ${res.status}`;
      toast({ variant: "destructive", title: "Create failed", description: msg });
      return;
    }

    toast({ title: "Subaccount created", description: (res.json?.message as string) || "Done." });
    setShowCreateSubAccountModal(false);
    setNewSubAccountName("");
    setNewSubAccountWhatsappLimit("1");
    await refreshAdminInfo();
  }

  async function handleChangePassword() {
    const auth = getAuthFromStorage();
    if (!auth?.jwt) {
      toast({ variant: "destructive", title: "Not authenticated", description: "Please log in again." });
      return;
    }
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ variant: "destructive", title: "Missing fields", description: "Fill in all password fields." });
      return;
    }

    const res = await apiChangePassword({
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });

    if (!res.ok) {
      const msg =
        (res.json && typeof res.json?.message === "string" && res.json.message) ||
        res.text ||
        `HTTP ${res.status}`;
      toast({ variant: "destructive", title: "Change password failed", description: msg });
      return;
    }

    const successMsg =
      (res.json && typeof res.json?.message === "string" && res.json.message) ||
      res.text ||
      "The password has been changed successfully.";
    toast({ title: "Password changed", description: successMsg });

    // Immediately re-login to get the *new* JWT
    try {
      const userId = adminData?.customId;
      if (userId) {
        const login = await apiAdminLogin({ userId, password: newPassword });
        if (login.ok && login.json?.code === 200 && login.json?.jwt) {
          // Store via helper (supports multiple userIds)
          setAuth(userId, login.json.jwt, true);
          toast({ title: "Session updated", description: "Your session token was refreshed." });
        } else {
          console.warn("Re-login after password change failed:", login);
        }
      }
    } catch (e) {
      console.warn("Re-login error:", e);
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowChangePasswordForm(false);

    await refreshAdminInfo();
  }

  const handleCancelCreateSubAccount = () => {
    setNewSubAccountName("");
    setNewSubAccountWhatsappLimit("1");
    setShowCreateSubAccountModal(false);
  };

  // ------------------------------ UI ------------------------------
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <img src="/Cara_Wazzap_1x1.png" alt="Wazzap" className="w-8 h-8 rounded-md" />
                <span className="text-xl font-semibold text-slate-900 dark:text-slate-100">Wazzap</span>
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <Button
              variant="ghost"
              className={`flex items-center gap-2 h-10 px-4 rounded-full transition-all duration-200 ${
                adminActiveNav === "sub-accounts"
                  ? "bg-slate-200 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
              onClick={() => setAdminActiveNav("sub-accounts")}
            >
              <Users className="h-4 w-4" />
              {adminActiveNav === "sub-accounts" && <span className="font-medium">Sub-Accounts</span>}
            </Button>

            <Button
              variant="ghost"
              className={`flex items-center gap-2 h-10 px-3 rounded-full transition-all duration-200 ${
                adminActiveNav === "settings"
                  ? "bg-slate-200 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
              onClick={() => setAdminActiveNav("settings")}
            >
              <Settings className="h-4 w-4" />
              {adminActiveNav === "settings" && <span className="font-medium">Settings</span>}
            </Button>
          </nav>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => toast({ title: "Notifications", description: "No new notifications." })}
                className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Notifications"
              >
                <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></div>
              </button>
            </div>

            <div className="relative" ref={adminUserDropdownRef}>
              <button
                onClick={() => setShowAdminUserDropdown(!showAdminUserDropdown)}
                className="h-8 w-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center hover:bg-slate-400 dark:hover:bg-slate-500 transition-colors"
              >
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {(adminData?.name?.[0] || "A").toUpperCase()}
                </span>
              </button>

              {showAdminUserDropdown && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{adminData.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{adminData.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAdminUserDropdown(false);
                      // simplest: full reload (JWT state resets in your storage model)
                      window.location.reload();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-7xl mx-auto">
        {adminActiveNav === "sub-accounts" && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Admin Panel</h1>
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
                      <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {subscription?.subaccounts?.used ?? 1}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        of {subscription?.subaccounts?.total ?? 5} limit
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-600 dark:text-slate-400">Usage</div>
                      <div className="text-lg font-semibold text-blue-600">
                        {pct(subscription?.subaccounts?.used, subscription?.subaccounts?.total)}%
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${pct(
                          subscription?.subaccounts?.used,
                          subscription?.subaccounts?.total
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => setShowCreateSubAccountModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Create Sub-Account
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* WhatsApp's Distribution */}
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
                      <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {subscription?.instances?.used ?? 0}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        of {subscription?.instances?.total ?? 0} limit
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-600 dark:text-slate-400">Usage</div>
                      <div className="text-lg font-semibold text-green-600">
                        {pct(subscription?.instances?.used, subscription?.instances?.total)}%
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${pct(
                          subscription?.instances?.used,
                          subscription?.instances?.total
                        )}%`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sub-Account Management */}
            <SubAccountPanel
              items={subaccounts}
              onChanged={async () => {
                await refreshAdminInfo();
              }}
            />
          </>
        )}

        {adminActiveNav === "settings" && (
          <Card className="rounded-2xl border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900 dark:text-slate-100">Admin Settings</CardTitle>
              <p className="text-slate-600 dark:text-slate-400">
                Configure your admin panel preferences and system settings.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImpossibleCheckboxClean />

              {/* Subscription Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">
                  Subscription Information
                </h4>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Subscription Expires:</span>
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                    {mounted ? formatDateUTC(subscription?.expiredAt) : "—"}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">
                  Custom Menu Link Global URL (Highlevel Integration)
                </h4>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customMenuUrl}
                      onChange={(e) => setCustomMenuUrl(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Enter custom menu link URL"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(customMenuUrl)}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="Copy URL"
                    >
                      <svg
                        className="h-4 w-4 text-slate-500 dark:text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">
                  Account Actions
                </h4>

                {!showChangePasswordForm ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        if (stripeUrl) window.open(stripeUrl, "_blank");
                        else toast({ title: "Manage subscription", description: "Stripe link not available." });
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      Manage Subscription
                    </button>

                    <button
                      onClick={() => setShowChangePasswordForm(true)}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      Change Password
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter current password"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter new password"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleChangePassword}
                        disabled={!currentPassword || !newPassword || !confirmPassword}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setShowChangePasswordForm(false);
                          setCurrentPassword("");
                          setNewPassword("");
                          setConfirmPassword("");
                        }}
                        className="px-4 py-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Sub-Account Modal */}
      {showCreateSubAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Create Sub-Account</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name:</label>
                  <input
                    type="text"
                    value={newSubAccountName}
                    onChange={(e) => setNewSubAccountName(e.target.value)}
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
                    value={newSubAccountWhatsappLimit}
                    onChange={(e) => setNewSubAccountWhatsappLimit(e.target.value)}
                    min="1"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCancelCreateSubAccount}
                  className="flex-1 px-4 py-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSubAccountSave}
                  disabled={!newSubAccountName.trim() || Number(newSubAccountWhatsappLimit) <= 0}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
