import type { AdminState, GameInfo, ScoreEntry } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(response.status, text || response.statusText);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  return response.text() as Promise<T>;
}

async function text(path: string, init?: RequestInit): Promise<string> {
  return request<string>(path, init);
}

export const api = {
  baseUrl: API_URL,
  getGameInfo: () => request<GameInfo>("/oyun/durum"),
  getScoreboard: () => request<ScoreEntry[]>("/skor"),
  getUyanis: () => text("/uyanis"),
  getParca: () => text("/arsiv"),
  getKapiYol: async () => {
    const response = await fetch(`${API_URL}/kapi`, {
      method: "HEAD",
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await response.text();
      throw new ApiError(response.status, body || response.statusText);
    }

    return response.headers.get("X-Yol") ?? "";
  },
  kalintiZipUrl: `${API_URL}/kasa/kalinti.zip`,
  finish: (name: string, code: string) =>
    request<string>("/sunak", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ name, code }),
    }),
  admin: {
    getState: (key: string) =>
      request<AdminState>("/admin/state", {
        headers: { Authorization: `Bearer ${key}` },
      }),
    clearScoreboard: (key: string) =>
      request<{ cleared: boolean }>("/admin/scoreboard", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${key}` },
      }),
    regenerateContent: (key: string) =>
      request<{ regenerated: boolean }>("/admin/regenerate-content", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}` },
      }),
  },
};
