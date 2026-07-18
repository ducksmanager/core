import axios from "axios";
import { SocketClient } from "socket-call-client";

import type { ClientEvents as CoaEvents } from "~dm-services/coa";
import dmNamespaces from "~dm-services/namespaces";
import type { ClientEvents as StorySearchEvents } from "~dm-services/story-search";
import type { image } from "~prisma/client_dumili/client";

const createCoaEvents = () =>
  new SocketClient(process.env.DM_SOCKET_URL!).addNamespace<CoaEvents>(
    dmNamespaces.COA,
  );
let coaEventsInstance: ReturnType<typeof createCoaEvents> | undefined;
const coaEvents = () => (coaEventsInstance ??= createCoaEvents());

const createStorySearchEvents = () =>
  new SocketClient(
    process.env.DM_STORY_SEARCH_SOCKET_URL!,
  ).addNamespace<StorySearchEvents>(dmNamespaces.STORY_SEARCH);
let storySearchEventsInstance:
  ReturnType<typeof createStorySearchEvents> | undefined;
const storySearchEvents = () =>
  (storySearchEventsInstance ??= createStorySearchEvents());

export const getFullStoriesFromKeywords = async (keywords: string[]) => {
  const response = await coaEvents().getFullStoriesFromKeywords(keywords);
  if ("error" in response) {
    return {
      error: `Error running story search: ${response.error}`,
    };
  }
  return response;
};

export const getStoriesFromImage = async (image: image, isCover: boolean) => {
  const url = image.url;
  const imageBuffer = (
    await axios.get(url, {
      responseType: "arraybuffer",
    })
  ).data;
  const response = await storySearchEvents().findSimilarImages(
    imageBuffer,
    isCover,
  );
  if ("error" in response) {
    return {
      error: `URL ${url}: Error running story search: ${response.error}`,
    };
  }

  const bestMatch = response.results.sort((a, b) => b.score - a.score)?.[0];
  if (!bestMatch) {
    console.info(`URL ${url}: No match found`);
    return {
      stories: [],
    };
  }

  const stories = response.results.map(
    ({ storycode, score }) =>
      ({
        storycode,
        score,
      }) as const,
  );

  return {
    stories,
  };
};
