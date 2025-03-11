import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";
import type {
  bookstoreComment,
  edge,
  user,
  userContribution,
  userContributionType,
} from "~prisma-schemas/schemas/dm";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import { getPopularityByIssuecodes } from "../../coa/issue-details";

export default () => ({
  publishEdge: async ({
    issuecode,
    designers,
    photographers,
  }: {
    issuecode: string;
    designers: string[];
    photographers: string[];
  }) => {
    const issue = await prismaCoa.inducks_issue.findFirst({
      where: { issuecode },
      select: { publicationcode: true, issuenumber: true },
    });
    if (!issue) {
      return { error: "Invalid publication code and issue number" };
    }

    const { publicationcode, issuenumber } = issue;

    const [country, magazine] = publicationcode.split("/");

    const modelContributors = [
      ...Object.values(await getUserIdsByUsername(designers)).map(
        (userId) =>
          ({
            userId,
            contribution: "createur",
          }) as const,
      ),
      ...Object.values(await getUserIdsByUsername(photographers)).map(
        (userId) =>
          ({
            userId,
            contribution: "photographe",
          }) as const,
      ),
    ];
    const { edgeId, contributors, isNew } = await publishEdgeOnDm(
      modelContributors,
      issuecode,
    );

    return {
      issuecode,
      edgeId,
      isNew,
      contributors,
      url: `${process.env.VITE_EDGES_ROOT}/${country}/gen/${magazine}.${issuenumber}.png`,
    };
  },
});

const getUserIdsByUsername = async (
  usernames: string[],
): Promise<{ [username: string]: number }> =>
  (
    await prismaDm.user.findMany({
      select: {
        id: true,
        username: true,
      },
      where: {
        username: { in: usernames },
      },
    })
  ).groupBy("username", "id");

const createContribution = async (
  user: user,
  contribution: userContributionType,
  issuePopularity: number,
  edgeToPublish: edge | null,
  bookstoreCommentToPublish: bookstoreComment | null = null,
) => {
  const currentUserPoints =
    (
      await prismaDm.userContribution.aggregate({
        _sum: { newPoints: true },
        where: { userId: user.id, contribution },
      })
    )._sum.newPoints || 0;

  return prismaDm.userContribution.create({
    data: {
      edgeId: edgeToPublish?.id || null,
      bookstoreCommentId: bookstoreCommentToPublish?.id || null,
      userId: user.id,
      contribution,
      date: new Date(),
      newPoints: issuePopularity,
      totalPoints: currentUserPoints + issuePopularity,
      isEmailSent: false,
    },
  });
};

const publishEdgeOnDm = async (
  contributors: { contribution: userContributionType; userId: number }[],
  issuecode: string,
) => {
  let contributions: userContribution[];
  let edgeToPublish = await prismaDm.edge.findFirst({
    where: {
      issuecode,
    },
  });
  const isNew = !!edgeToPublish;
  if (edgeToPublish) {
    contributions = await prismaDm.userContribution.findMany({
      where: {
        edgeId: edgeToPublish.id,
      },
    });
  } else {
    contributions = [];
    edgeToPublish = await prismaDm.edge.create({
      data: {
        issuecode,
        creationDate: new Date(),
      },
    });
  }

  const issuePopularity =
    (await getPopularityByIssuecodes([issuecode]))[issuecode]?.popularity || 0;

  for (const { userId, contribution } of contributors) {
    const user = await prismaDm.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      continue;
    }
    if (
      !contributions.find(
        (existingContribution) =>
          existingContribution.contribution === contribution &&
          existingContribution.userId === userId,
      )
    ) {
      contributions.push(
        await createContribution(
          user,
          contribution,
          issuePopularity,
          edgeToPublish,
        ),
      );
    }
  }

  return {
    isNew,
    edgeId: edgeToPublish.id,
    contributors: contributions.map((contribution) => contribution.userId),
  };
};
