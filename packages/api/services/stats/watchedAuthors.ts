import type { Socket } from "socket.io";

import { prismaClient as  prismaDmStats } from "~prisma-clients/schemas/dm_stats";

import { getAuthorFullNames } from "../coa/authors";
import type Events from "./types";

export interface AuthorDetails {
  personcode: string;
  missingStoryCount: number;
  storyCount: number;
  fullname: string;
}

const getStoryCountPerAuthor = async (
  personcodes: string[],
): Promise<{ [personcode: string]: number }> =>
  (
    await prismaDmStats.authorStory.groupBy({
      by: ["personcode"],
      _count: {
        storycode: true,
      },
      where: {
        personcode: { in: personcodes },
      },
    })
  ).reduce(
    (acc, { personcode, _count }) => ({
      ...acc,
      [personcode]: _count.storycode,
    }),
    {},
  );

const getMissingStoryCountPerAuthor = async (
  userId: number,
): Promise<{ [personcode: string]: number }> =>
  (
    await prismaDmStats.missingStoryForUser.groupBy({
      by: ["personcode"],
      _count: {
        storycode: true,
      },
      where: { userId },
    })
  ).reduce(
    (acc, { personcode, _count }) => ({
      ...acc,
      [personcode]: _count.storycode,
    }),
    {},
  );

export default (socket: Socket<Events>) => {
  socket.on("getWatchedAuthorsStats", async (callback) => {
    const missingStoryCountPerAuthor = await getMissingStoryCountPerAuthor(
      socket.data.user!.id,
    );
    const personcodes = Object.keys(missingStoryCountPerAuthor);

    const storyCountPerAuthor = await getStoryCountPerAuthor(personcodes);
    const personNames = await getAuthorFullNames(personcodes);

    callback(
      personcodes.map((personcode) => ({
        personcode,
        missingStoryCount: missingStoryCountPerAuthor[personcode],
        storyCount:
          storyCountPerAuthor[personcode] ||
          missingStoryCountPerAuthor[personcode],
        fullname: personNames[personcode],
      })),
    );
  });
};
