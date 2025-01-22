import { prismaClient as prismaDmStats } from "~prisma-schemas/schemas/dm_stats/client";

import type { UserServices } from "../../index";
import { getAuthorFullNames } from "../coa/authors";

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

export default ({_socket}: UserServices) => ({
  getWatchedAuthorsStats: async () => {
    const missingStoryCountPerAuthor = await getMissingStoryCountPerAuthor(
      _socket.data.user!.id,
    );
    const personcodes = Object.keys(missingStoryCountPerAuthor);

    const storyCountPerAuthor = await getStoryCountPerAuthor(personcodes);
    const personNames = await getAuthorFullNames(personcodes);

    return personcodes.map((personcode) => ({
      personcode,
      missingStoryCount: missingStoryCountPerAuthor[personcode],
      storyCount:
        storyCountPerAuthor[personcode] ||
        missingStoryCountPerAuthor[personcode],
      fullname: personNames[personcode],
    }));
  },
});
