import { Handler } from "express";

import { PrismaClient } from "~/dist/prisma/client_dm_stats";
import { getAuthorFullNames } from "~/routes/coa/authorsfullnames/:authors";

const prisma = new PrismaClient();

const getStoryCountPerAuthor = async (
  personcodes: string[]
): Promise<{ [personcode: string]: number }> =>
  (
    await prisma.authorStory.groupBy({
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
    {}
  );

const getMissingStoryCountPerAuthor = async (
  userId: number
): Promise<{ [personcode: string]: number }> =>
  (
    await prisma.missingStoryForUser.groupBy({
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
    {}
  );

export const get: Handler = async (req, res) => {
  const userId = req.user.id;
  const missingStoryCountPerAuthor = await getMissingStoryCountPerAuthor(
    userId
  );
  const personcodes = Object.keys(missingStoryCountPerAuthor);

  const storyCountPerAuthor = await getStoryCountPerAuthor(personcodes);
  const personNames = await getAuthorFullNames(personcodes);

  return res.json(
    personcodes.reduce(
      (acc, personcode) => ({
        ...acc,
        [personcode]: {
          missingstorycount: missingStoryCountPerAuthor[personcode],
          storycount:
            storyCountPerAuthor[personcode] ||
            missingStoryCountPerAuthor[personcode],
          fullname: personNames[personcode],
        },
      }),
      {}
    )
  );
};
