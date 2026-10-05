import { io, type Socket } from "socket.io-client";

/**
 * DM's reverse image search, called straight from the browser as What The Duck
 * does. Over plain socket.io rather than socket-call-client, whose optional
 * axios cache this standalone package has no use for; the protocol is one
 * acknowledged emit per call.
 */
type Result =
  { results: { storycode: string; score: number }[] } | { error: string };

const url = import.meta.env.VITE_DM_STORY_SEARCH_SOCKET_URL as
  string | undefined;

let socket: Socket | undefined;

/** Null where no image search is configured. Throws if it fails. */
export const findSimilarImages = async (dataUrl: string) => {
  if (!url) return null;
  socket ??= io(`${url}/story-search`, { transports: ["websocket"] });
  const response = (await socket
    .timeout(30_000)
    .emitWithAck("findSimilarImages", dataUrl, false)) as Result;
  if ("error" in response) throw new Error(response.error);
  return response.results.map(({ storycode, score }) => ({ storycode, score }));
};
