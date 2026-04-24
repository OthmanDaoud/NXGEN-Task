import type { QueryParams } from "../types/api";

const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

if (!baseUrl) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

async function request<T>(method: string, path: string, body?: unknown, query?: QueryParams): Promise<T> {
  const url = new URL(`${baseUrl}${path.startsWith("/") ? path : `/${path}`}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.append(key, String(value));
    }
  }

  const response = await fetch(url.toString(), {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const message = (await response.text()) || response.statusText || "Request failed";
    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  get<T>(path: string, query?: QueryParams) {
    return request<T>("GET", path, undefined, query);
  },
  post<T>(path: string, body?: unknown) {
    return request<T>("POST", path, body);
  },
  put<T>(path: string, body?: unknown) {
    return request<T>("PUT", path, body);
  },
  del<T>(path: string) {
    return request<T>("DELETE", path);
  },
};
