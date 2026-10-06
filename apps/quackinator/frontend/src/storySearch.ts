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
if (!url) throw new Error("VITE_DM_STORY_SEARCH_SOCKET_URL is not configured");

let socket: Socket | undefined;

/**
 * Settles on the next connection attempt. An emit on a disconnected socket is
 * buffered, so without this an unreachable server would only surface once the
 * emit's 30s timeout ran out.
 */
const connected = (socket: Socket) =>
  new Promise<void>((resolve, reject) => {
    if (socket.connected) return resolve();
    const settle = (error?: Error) => {
      socket.off("connect", settle).off("connect_error", settle);
      if (error) reject(error);
      else resolve();
    };
    socket.on("connect", settle).on("connect_error", settle);
  });

export const findSimilarImages = async (dataUrl: string) => {
  socket ??= io(`${url}/story-search`, { transports: ["websocket"] });
  await connected(socket);
  const response = (await socket
    .timeout(30_000)
    .emitWithAck("findSimilarImages", dataUrl, false)) as Result;
  if ("error" in response) throw new Error(response.error);
  return response.results.map(({ storycode, score }) => ({ storycode, score }));
};
