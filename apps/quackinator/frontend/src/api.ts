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

/**
 * A client bound to one API origin.
 *
 * The origin is a parameter rather than a build-time constant because the
 * standalone app and an embedding host such as Dumili each configure their own.
 */
export const createApi = (base: string) => ({
  /**
   * `seed` is what a host already knows — candidate stories from its own tools,
   * measurements out of its own database, and this reader's answers from an
   * earlier session. Omitted by the standalone reader, who arrives with nothing.
   */
  start: (seed?: Seed) =>
    request<Turn>(base, "/api/sessions", {
      method: "POST",
      body: seed ? JSON.stringify(seed) : undefined,
    }),

  /** `option` is an index into the question's options; null means "don't know". */
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

  /** Autocomplete for the author box. Session-independent. */
  creators: (query: string) =>
    request<CreatorMatch[]>(
      base,
      `/api/creators?q=${encodeURIComponent(query)}`,
    ),

  /**
   * The reader read a name off the first page. Not an answer to a question —
   * it costs no turn, and a reader whose copy prints no credit never calls it.
   */
  nameCreator: (sessionId: string, creator: number) =>
    request<Turn>(base, `/api/sessions/${sessionId}/creator`, {
      method: "POST",
      body: JSON.stringify({ creator }),
    }),

  /**
   * Kumiko and OCR over a photo of the story's first page. `language` is the
   * magazine's Inducks language code; OCR is skipped without one.
   */
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

  end: (sessionId: string) =>
    request<{ ok: boolean }>(base, `/api/sessions/${sessionId}`, {
      method: "DELETE",
    }),
});

export type Api = ReturnType<typeof createApi>;

export const api = createApi(import.meta.env.VITE_API_BASE ?? "");

export { ApiError };
