import { prismaDmStats } from "~/prisma";

import { getAuthorFullNames } from "../coa/authors";
import { Socket } from "./types";

export default (socket: Socket) => {
  socket.on("getWatchedAuthorsStats", async (callback) => {
    const user = socket.data.user;
    const missingStoryCountPerAuthor = await getMissingStoryCountPerAuthor(
      user!.id,
    );
    const personcodes = Object.keys(missingStoryCountPerAuthor);

    const storyCountPerAuthor = await getStoryCountPerAuthor(personcodes);
    const personNames = await getAuthorFullNames(personcodes);

    callback(
      personcodes.map(
        (personcode) => ({
          personcode,
          missingstorycount: missingStoryCountPerAuthor[personcode],
          storycount:
            storyCountPerAuthor[personcode] ||
            missingStoryCountPerAuthor[personcode],
          fullname: personNames[personcode],
        })
      ),
    );
  });
};

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
