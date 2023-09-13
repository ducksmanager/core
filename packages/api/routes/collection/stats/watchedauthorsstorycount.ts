import { prismaDmStats } from "~/prisma";
import { AuthorsDetails } from "~dm-types/AuthorsDetails";
import { ExpressCall } from "~routes/_express-call";
import { getAuthorFullNames } from "~routes/coa/authorsfullnames/:authors";

const getStoryCountPerAuthor = async (
  personcodes: string[]
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
    {}
  );

const getMissingStoryCountPerAuthor = async (
  userId: number
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
    {}
  );

export const get = async (
  ...[req, res]: ExpressCall<{ resBody: AuthorsDetails }>
) => {
  const missingStoryCountPerAuthor = await getMissingStoryCountPerAuthor(
    req.user!.id
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
