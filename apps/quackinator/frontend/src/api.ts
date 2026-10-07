import type { Analysis, CreatorMatch, Seed, Turn } from "./types";

class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  base: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${base}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch {
    throw new ApiError(
      "Cannot reach the quackinator API. Is `mise run api` running?",
      0,
    );
  }
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    let detail = body;
    try {
      // FastAPI's HTTPException body
      detail = (JSON.parse(body) as { detail?: string }).detail ?? body;
    } catch {
      // Not JSON: a proxy's error page, say
    }
    throw new ApiError(detail || response.statusText, response.status);
  }
  return (await response.json()) as T;
}

export const createApi = (base: string) => ({
  start: (seed?: Seed) =>
    request<Turn>(base, "/api/sessions", {
      method: "POST",
      body: seed ? JSON.stringify(seed) : undefined,
    }),

  /** `option` null = don't know. */
  answer: (sessionId: string, key: string, option: number | null) =>
    request<Turn>(base, `/api/sessions/${sessionId}/answer`, {
      method: "POST",
      body: JSON.stringify({ key, option }),
    }),

  reject: (sessionId: string, storycode: string) =>
    request<Turn>(base, `/api/sessions/${sessionId}/reject`, {
      method: "POST",
      body: JSON.stringify({ storycode }),
    }),

  creators: (query: string) =>
    request<CreatorMatch[]>(
      base,
      `/api/creators?q=${encodeURIComponent(query)}`,
    ),

  nameCreator: (sessionId: string, creator: number) =>
    request<Turn>(base, `/api/sessions/${sessionId}/creator`, {
      method: "POST",
      body: JSON.stringify({ creator }),
    }),

  /** OCR is skipped without `language` (Inducks language code). */
  analyze: (image: Blob, language: string | null) =>
    request<Analysis>(
      base,
      `/api/analyze${language ? `?language=${encodeURIComponent(language)}` : ""}`,
      {
        method: "POST",
        headers: { "Content-Type": image.type || "application/octet-stream" },
        body: image,
      },
    ),
});

export type Api = ReturnType<typeof createApi>;

export const api = createApi(import.meta.env.VITE_API_BASE ?? "");

export { ApiError };
