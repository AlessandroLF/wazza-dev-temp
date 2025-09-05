// lib/http.ts
export class HttpError<T = unknown> extends Error {
  status: number;
  data?: T;
  constructor(message: string, status: number, data?: T) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.data = data;
  }
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://dev-api-front.wazzap.me";

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  let data: any = null;
  try { data = await res.json(); } catch {}

  if (!res.ok) {
    throw new HttpError(
      data?.message || `HTTP ${res.status}`,
      res.status,
      data || undefined
    );
  }

  return data as T;
}

export const http = {
  get:  <T>(p: string, o?: RequestOptions) => request<T>(p, { ...o, method: "GET" }),
  post: <T>(p: string, b?: unknown, o?: RequestOptions) =>
    request<T>(p, { ...o, method: "POST", body: b }),
  put:  <T>(p: string, b?: unknown, o?: RequestOptions) =>
    request<T>(p, { ...o, method: "PUT", body: b }),
  del:  <T>(p: string, o?: RequestOptions) => request<T>(p, { ...o, method: "DELETE" }),
};
