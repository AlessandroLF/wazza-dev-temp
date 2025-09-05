// /lib/api/admin.ts

const API_BASE = "https://dev-api-front.wazzap.me";

// ---------- Types ----------
export type AdminData = {
  customId: string;
  name: string;
  email: string;
  phone: string;
  contactId: string;
  code: string;
};

export type SubscriptionStats = {
  expiredAt: string;
  subaccounts: { total: number; used: number; available: number };
  instances: { total: number; used: number; available: number };
};

export type SubAccountItem = {
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

// ---------- Auth storage (multi-userId) ----------
const STORAGE_KEY = "wazzap_auth";

type AuthStore =
  | { activeUserId?: string; accounts: Record<string, string> } // new multi format
  | { userId: string; jwt: string }; // legacy single format

function readAuthStore(): AuthStore | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthStore) : null;
  } catch {
    return null;
  }
}

function writeAuthStore(store: AuthStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    // trigger storage event for other tabs/views that listen
    localStorage.setItem(`${STORAGE_KEY}_ts`, String(Date.now()));
  } catch {}
}

// Back-compat + multi-user aware getter
export function getAuth(userId?: string): { userId: string; jwt: string } | null {
  const store = readAuthStore();
  if (!store) return null;

  // legacy {userId, jwt}
  if ("jwt" in store && typeof store.jwt === "string" && typeof store.userId === "string") {
    return userId && userId !== store.userId ? null : { userId: store.userId, jwt: store.jwt };
  }

  // multi
  const multi = store as { activeUserId?: string; accounts: Record<string, string> };
  const id = userId ?? multi.activeUserId;
  if (!id) return null;
  const jwt = multi.accounts?.[id];
  return jwt ? { userId: id, jwt } : null;
}

// Set/replace jwt for a userId and optionally mark active (default true)
export function setAuth(userId: string, jwt: string, makeActive = true) {
  const store = readAuthStore();
  let next: AuthStore;

  if (!store) {
    next = { activeUserId: makeActive ? userId : undefined, accounts: { [userId]: jwt } };
  } else if ("jwt" in store) {
    // migrate legacy to multi
    next = {
      activeUserId: makeActive ? userId : store.userId,
      accounts: { [store.userId]: store.jwt, [userId]: jwt },
    };
  } else {
    const multi = store as { activeUserId?: string; accounts: Record<string, string> };
    next = {
      activeUserId: makeActive ? userId : multi.activeUserId,
      accounts: { ...(multi.accounts || {}), [userId]: jwt },
    };
  }

  writeAuthStore(next);
}

export function removeAuth(userId: string) {
  const store = readAuthStore();
  if (!store) return;

  if ("jwt" in store) {
    if (store.userId === userId) localStorage.removeItem(STORAGE_KEY);
    return;
  }

  const multi = store as { activeUserId?: string; accounts: Record<string, string> };
  const accounts = { ...(multi.accounts || {}) };
  delete accounts[userId];

  const next: AuthStore = { activeUserId: multi.activeUserId, accounts };
  if (next.activeUserId === userId) {
    // pick any remaining as active
    const remaining = Object.keys(accounts);
    next.activeUserId = remaining[0];
  }
  if (Object.keys(accounts).length === 0) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    writeAuthStore(next);
  }
}

export function setActiveUser(userId: string) {
  const store = readAuthStore();
  if (!store) return;
  if ("jwt" in store) {
    if (store.userId !== userId) return; // not present in legacy
    return; // already "active"
  }
  const multi = store as { activeUserId?: string; accounts: Record<string, string> };
  if (!multi.accounts?.[userId]) return;
  writeAuthStore({ ...multi, activeUserId: userId });
}

// Back-compat export name used in your components
export function getAuthFromStorage() {
  return getAuth(); // active one by default
}

// ---------- API calls (unchanged request shapes) ----------
export async function apiAdminLogin(params: { userId: string; password: string }) {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ id: params.userId, password: params.password }),
  });
  let json: any = null;
  try {
    json = await res.json();
  } catch {}
  return { ok: res.ok, status: res.status, json };
}

export async function apiAdminCheck(opts?: { signal?: AbortSignal }) {
  const auth = getAuth();
  if (!auth?.jwt) return { ok: false, status: 0, json: null };
  const res = await fetch(`${API_BASE}/admin/check`, {
    method: "GET",
    headers: { Authorization: auth.jwt, "Content-Type": "application/json" },
    cache: "no-store",
    signal: opts?.signal,
  });
  let json: any = null;
  try {
    json = await res.json();
  } catch {}
  return { ok: res.ok, status: res.status, json };
}

export async function apiAdminInfo(opts?: { signal?: AbortSignal }) {
  const auth = getAuth();
  if (!auth?.jwt) return { ok: false, status: 0, json: null };
  const res = await fetch(`${API_BASE}/admin/info`, {
    method: "GET",
    headers: { Authorization: auth.jwt, "Content-Type": "application/json" },
    cache: "no-store",
    signal: opts?.signal,
  });
  let json: any = null;
  try {
    json = await res.json();
  } catch {}
  return { ok: res.ok, status: res.status, json };
}

export async function apiCreateSubaccount(body: { name: string; type?: "GHL"; instances: number }) {
  const auth = getAuth();
  if (!auth?.jwt) return { ok: false, status: 0, text: "", json: null };
  const res = await fetch(`${API_BASE}/admin/subaccount`, {
    method: "POST",
    headers: { Authorization: auth.jwt, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ name: body.name, type: body.type ?? "GHL", instances: body.instances }),
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { ok: res.ok, status: res.status, text, json };
}

export async function apiChangePassword(body: {
  current_password: string;
  new_password: string;
  confirm_password: string;
}) {
  const auth = getAuth();
  if (!auth?.jwt) return { ok: false, status: 0, text: "", json: null };
  const res = await fetch(`${API_BASE}/admin/subaccount/change`, {
    method: "PUT",
    headers: { Authorization: auth.jwt, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { ok: res.ok, status: res.status, text, json };
}

export async function apiDeleteSubaccount(customId: string) {
  const auth = getAuth();
  if (!auth?.jwt) return { ok: false, status: 0, text: "", json: null };
  const res = await fetch(`${API_BASE}/admin/subaccount/${customId}`, {
    method: "DELETE",
    headers: { Authorization: auth.jwt, "Content-Type": "application/json" },
    body: JSON.stringify({}), // empty JSON body
    cache: "no-store",
  });
  const raw = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(raw);
  } catch {}
  return { ok: res.ok, status: res.status, text: raw, json };
}

export async function apiResetSubaccountPassword(subaccountId: string) {
  const auth = getAuth();
  if (!auth?.jwt) return { ok: false, status: 0, text: "", json: null };
  const res = await fetch(`${API_BASE}/admin/subaccount/reset/${subaccountId}`, {
    method: "PUT",
    headers: { Authorization: auth.jwt, "Content-Type": "application/json" },
    body: JSON.stringify({}), // empty body
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { ok: res.ok, status: res.status, text, json };
}

export async function apiDisconnectSubaccount(subaccountId: string) {
  const auth = getAuth();
  if (!auth?.jwt) return { ok: false, status: 0, text: "", json: null };
  const res = await fetch(`${API_BASE}/admin/subaccount/disconnect/${subaccountId}`, {
    method: "PUT",
    headers: { Authorization: auth.jwt, "Content-Type": "application/json" },
    body: JSON.stringify({}), // empty body
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { ok: res.ok, status: res.status, text, json };
}

export async function apiUpdateSubaccount(customId: string, body: { name: string; instances: number }) {
  const auth = getAuth();
  if (!auth?.jwt) return { ok: false, status: 0, text: "", json: null };
  const res = await fetch(`${API_BASE}/admin/subaccount/${customId}`, {
    method: "PUT",
    headers: { Authorization: auth.jwt, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { ok: res.ok, status: res.status, text, json };
}
