import axios from "axios";
import { SocketClient } from "socket-call-client";

import type { ClientEvents as CoaEvents } from "~dm-services/coa";
import dmNamespaces from "~dm-services/namespaces";
import type { ClientEvents as StorySearchEvents } from "~dm-services/story-search";
import { STORY } from "~dumili-types/storyKinds";
import type { image } from "~prisma/client_dumili/client";

const socket = new SocketClient(process.env.DM_SOCKET_URL!);
const coaEvents = socket.addNamespace<CoaEvents>(dmNamespaces.COA);

const storySearchSocket = new SocketClient(
  process.env.DM_STORY_SEARCH_SOCKET_URL!,
);
const storySearchEvents = storySearchSocket.addNamespace<StorySearchEvents>(
  dmNamespaces.STORY_SEARCH,
);

export const getStoriesFromKeywords = async (keywords: string[]) => {
  const { results: searchResults } = await coaEvents.searchStory(keywords, {
    withIssues: false,
  });

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

  const stories = searchResults.filter(
    ({ storycode }) =>
      storyversionDetails[storyDetails[storycode].originalstoryversioncode!]
        .kind === STORY,
  );

  return {
    stories,
  };
};

export const getStoriesFromImage = async (image: image, isCover: boolean) => {
  const url = image.url;
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

  const bestMatch = response.results.sort((a, b) => b.score - a.score)?.[0];
  if (!bestMatch) {
    console.info(`URL ${url}: No match found`);
    return {
      stories: [],
    };
  }

  const stories = response.results.map(
    ({ storyversioncode, score }) =>
      ({
        storycode: storyversioncode,
        score,
      }) as const,
  );

  return {
    stories,
  };
};
