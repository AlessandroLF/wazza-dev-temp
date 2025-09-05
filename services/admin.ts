// services/admin.ts
import { http } from "@/lib/http";
import { z } from "zod";

// ---- shared helpers ----
function getAuthFromStorage() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("wazzap_auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.jwt === "string" && typeof parsed.userId === "string") {
      return parsed as { userId: string; jwt: string };
    }
  } catch {}
  return null;
}

function authHeaders() {
  const auth = getAuthFromStorage();
  return auth?.jwt ? { Authorization: auth.jwt } : {};
}

// ---- zod schemas (keeps the component safer) ----
export const AdminDataZ = z.object({
  customId: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  contactId: z.string(),
  code: z.string(),
});
export type AdminData = z.infer<typeof AdminDataZ>;

const SubAccountItemZ = z.object({
  type: z.string(),
  name: z.string(),
  locationId: z.string(),
  customId: z.string(),
  whiteId: z.string(),
  sessions: z.number(),
  isConnected: z.boolean(),
  status: z.boolean(),
  refreshAt: z.string().nullable(),
});
export type SubAccountItem = z.infer<typeof SubAccountItemZ>;

const SubscriptionStatsZ = z.object({
  expiredAt: z.string(),
  subaccounts: z.object({ total: z.number(), used: z.number(), available: z.number() }),
  instances: z.object({ total: z.number(), used: z.number(), available: z.number() }),
});
export type SubscriptionStats = z.infer<typeof SubscriptionStatsZ>;

const ApiEnvelopeZ = z.object({
  code: z.number(),
  message: z.string().optional(),
});

// ---- endpoints ----

// GET /admin/check  -> { code:200, data: AdminData }
export async function adminCheck(opts?: { signal?: AbortSignal }): Promise<AdminData | null> {
  const json = await http.get<unknown>("/admin/check", {
    headers: { ...authHeaders() },
    signal: opts?.signal,
  });

  const env = ApiEnvelopeZ.extend({ data: AdminDataZ.optional() }).safeParse(json);
  if (!env.success || env.data.code >= 400) return null;
  return env.data.data ?? null;
}

// GET /admin/info -> { code:200, data: { subscription, subaccounts, stripe?, user? } }
export async function adminInfo(opts?: { signal?: AbortSignal }): Promise<{
  subscription: SubscriptionStats | null;
  subaccounts: SubAccountItem[];
  stripeUrl: string | null;
  user: AdminData | null;
}> {
  const json = await http.get<unknown>("/admin/info", {
    headers: { ...authHeaders() },
    signal: opts?.signal,
  });

  const InfoZ = ApiEnvelopeZ.extend({
    data: z.object({
      subscription: SubscriptionStatsZ.optional(),
      subaccounts: z.array(SubAccountItemZ).optional(),
      stripe: z.string().optional(),
      user: AdminDataZ.optional(),
    }),
  });

  const parsed = InfoZ.safeParse(json);
  if (!parsed.success || parsed.data.code >= 400) {
    return { subscription: null, subaccounts: [], stripeUrl: null, user: null };
  }

  return {
    subscription: parsed.data.data.subscription ?? null,
    subaccounts: parsed.data.data.subaccounts ?? [],
    stripeUrl: parsed.data.data.stripe ?? null,
    user: parsed.data.data.user ?? null,
  };
}

// POST /admin/subaccount -> text or { message }
export async function createSubaccount(args: { name: string; instances: number; type?: string }) {
  const json = await http.post<unknown>(
    "/admin/subaccount",
    { name: args.name, type: args.type ?? "GHL", instances: args.instances },
    { headers: { ...authHeaders(), Accept: "application/json" } }
  );

  // Some responses may be plain text; we normalized http to JSON. If API returns {message}, prefer it.
  const MsgZ = z.object({ message: z.string().optional() });
  const p = MsgZ.safeParse(json);
  return p.success ? (p.data.message ?? "The subaccount was successfully created") : "The subaccount was successfully created";
}

// PUT /admin/subaccount/change -> text or { message }
export async function changePassword(args: {
  current_password: string;
  new_password: string;
  confirm_password: string;
}) {
  const json = await http.put<unknown>(
    "/admin/subaccount/change",
    args,
    { headers: { ...authHeaders() } }
  );

  const MsgZ = z.object({ message: z.string().optional() });
  const p = MsgZ.safeParse(json);
  return p.success ? (p.data.message ?? "The password has been changed successfully.") : "The password has been changed successfully.";
}
