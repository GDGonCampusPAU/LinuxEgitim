import type { AdminState, GameInfo, ScoreEntry } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

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
  return response.text() as unknown as T;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export const api = {
  baseUrl: API_URL,

  getGameInfo: () => request<GameInfo>("/game/info"),
  getScoreboard: () => request<ScoreEntry[]>("/scoreboard"),

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
