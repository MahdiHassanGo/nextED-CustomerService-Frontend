import { clearCsrfToken, getCsrfToken } from "./csrf";
import type { ApiEnvelope } from "./types";

export class ApiClientError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.details = details;
  }
}

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  retryAuth?: boolean;
};

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

async function request<T>(path: string, options: ApiOptions = {}): Promise<ApiEnvelope<T>> {
  const { body, retryAuth: _retryAuth, ...requestOptions } = options;
  const method = (requestOptions.method ?? "GET").toUpperCase();
  const headers = new Headers(requestOptions.headers);
  headers.set("Accept", "application/json");

  if (!SAFE_METHODS.has(method)) {
    headers.set("Content-Type", "application/json");
    headers.set("X-CSRF-Token", await getCsrfToken());
    headers.set("X-Requested-With", "FixItNow-Web");
  }

  const response = await fetch(`/api/backend${path.startsWith("/") ? path : `/${path}`}`, {
    ...requestOptions,
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
    cache: "no-store"
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? ((await response.json()) as ApiEnvelope<T>)
    : ({ success: response.ok, statusCode: response.status, message: await response.text(), data: null as T } satisfies ApiEnvelope<T>);

  if (response.status === 401 && options.retryAuth !== false && !path.startsWith("/auth/refresh") && !path.startsWith("/auth/login")) {
    try {
      await request("/auth/refresh", { method: "POST", body: {}, retryAuth: false });
      return request<T>(path, { ...options, retryAuth: false });
    } catch {
      clearCsrfToken();
    }
  }

  if (!response.ok || payload.success === false) {
    throw new ApiClientError(payload.message || "Request failed", response.status, payload.details);
  }

  return payload;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" })
};
