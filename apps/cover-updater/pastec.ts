import { pastecHosts } from "./env";
import { errorMessage } from "./util";

const INDEX_FETCH_TIMEOUT = 300_000;
const INDEX_WRITE_TIMEOUT = 600_000;

export const pastecIndexHost = pastecHosts[0]!;

// Returns null when the index could not be read, which callers must not confuse
// with an empty index: see deleteNonIndexedCovers.
export const fetchIndexedCoverIds = async () => {
  let payload: unknown;
  try {
    const response = await fetch(`http://${pastecIndexHost}/index/imageIds`, {
      signal: AbortSignal.timeout(INDEX_FETCH_TIMEOUT),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    payload = await response.json();
  } catch (error) {
    console.warn(
      `WARNING: Pastec index unreachable at ${pastecIndexHost}: ${errorMessage(error)}`,
    );
    return null;
  }

  const coverIds = (payload as { image_ids?: number[] }).image_ids;
  if (
    !Array.isArray(coverIds) ||
    !coverIds.length ||
    !coverIds.every((coverId) => Number.isInteger(coverId))
  ) {
    console.warn("WARNING: Pastec returned no usable image_ids");
    return null;
  }
  return coverIds;
};

// Returns null on success, the reported error otherwise.
export const addCoverToIndex = async (
  hostAndPort: string,
  coverId: number,
  image: Blob,
) => {
  try {
    const response = await fetch(
      `http://${hostAndPort}/index/images/${coverId}`,
      { method: "PUT", body: image },
    );
    const body = await response.text();
    return body.includes("IMAGE_ADDED") ? null : body.trim();
  } catch (error) {
    return errorMessage(error);
  }
};

export const writeIndex = async () => {
  try {
    const response = await fetch(`http://${pastecIndexHost}/index/io`, {
      method: "POST",
      body: JSON.stringify({ type: "WRITE", index_path: '/pastec-index-last.dat' }),
      signal: AbortSignal.timeout(INDEX_WRITE_TIMEOUT),
    });
    const body = (await response.text()).trim();
    if (!response.ok) {
      return `HTTP ${response.status}: ${body}`;
    }
    // The body is logged either way: a Pastec that cannot open the file answers
    // 200 with an error payload rather than a status code.
    return body.includes("INDEX_WRITTEN") ? null : body;
  } catch (error) {
    return errorMessage(error);
  }
};
