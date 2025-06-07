import axios from "axios";
import { SocketClient } from "socket-call-client";

import type { ClientEvents as CoaEvents } from "~dm-services/coa";
import dmNamespaces from "~dm-services/namespaces";
import type { ClientEvents as StorySearchEvents } from "~dm-services/story-search";
import { STORY } from "~dumili-types/storyKinds";

const socket = new SocketClient(process.env.DM_SOCKET_URL!);
const coaEvents = socket.addNamespace<CoaEvents>(dmNamespaces.COA);

const storySearchSocket = new SocketClient(
  process.env.DM_STORY_SEARCH_SOCKET_URL!,
);
const storySearchEvents = storySearchSocket.addNamespace<StorySearchEvents>(
  dmNamespaces.STORY_SEARCH,
);

export const getStoriesFromText = async (keywords: string[]) => {
  const { results: searchResults } = await coaEvents.searchStory(
    keywords,
    false,
  );

  const storyDetailsOutput = await coaEvents.getStoryDetails(
    searchResults.map(({ storycode }) => storycode),
  );

  if (!("stories" in storyDetailsOutput)) {
    return {
      error: `Error when calling getStoryDetails`,
    };
  }
  const storyDetails = storyDetailsOutput.stories;

  const storyversionDetailsOutput = await coaEvents.getStoryversionsDetails(
    searchResults.map(
      ({ storycode }) => storyDetails[storycode].originalstoryversioncode!,
    ),
  );

  if (!("storyversions" in storyversionDetailsOutput)) {
    return {
      error: `Error when calling getStoryversionsDetails`,
    };
  }

  const storyversionDetails = storyversionDetailsOutput.storyversions;

  return {
    stories: searchResults
      .filter(
        ({ storycode }) =>
          storyversionDetails[storyDetails[storycode].originalstoryversioncode!]
            .kind === STORY,
      )
      .map((result) => ({ ...result, type: "ocrDetails" }) as const),
  };
};

export const getStoriesFromImageUrl = async (url: string, isCover: boolean) => {
  const imageBuffer = (
    await axios.get(url, {
      responseType: "arraybuffer",
    })
  ).data;
  const response = await storySearchEvents.findSimilarImages(
    imageBuffer,
    isCover,
  );
  if ("error" in response) {
    return {
      error: `URL ${url}: Error running story search: ${response.error}`,
    };
  }

  const bestMatch = response.results.sort(
    (a, b) => b.similarity - a.similarity,
  )?.[0];
  if (!bestMatch) {
    return {
      error: `URL ${url}: No match found`,
    };
  }

  return {
    stories: response.results.map(
      ({ storyversioncode, similarity }) =>
        ({
          storycode: storyversioncode,
          score: similarity,
          type: "storySearchDetails",
        }) as const,
    ),
  };
};
