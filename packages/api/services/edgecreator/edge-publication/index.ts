import type { Socket } from "socket.io";

import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";
import type {
  bookstoreComment,
  edge,
  user,
  userContribution,
} from "~prisma-schemas/schemas/dm";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import type Events from "../types";
export default (socket: Socket<Events>) => {
  socket.on(
    "publishEdge",
    async ({ issuecode, designers, photographers }, callback) => {
      const issue = await prismaCoa.inducks_issue.findFirst({
        where: { issuecode },
        select: { publicationcode: true, issuenumber: true },
      });
      if (!issue) {
        callback({ error: "Invalid publication code and issue number" });
        return;
      }

      const { publicationcode, issuenumber } = issue;

      const [country, magazine] = publicationcode.split("/");

      const modelContributors = [
        ...Object.values(await getUserIdsByUsername(designers)).map(
          (userId) => ({
            userId,
            contribution: "createur",
          }),
        ),
        ...Object.values(await getUserIdsByUsername(photographers)).map(
          (userId) => ({
            userId,
            contribution: "photographe",
          }),
        ),
      ];
      const { edgeId, contributors, isNew } = await publishEdgeOnDm(
        modelContributors,
        issuecode,
      );

      callback({
        issuecode,
        edgeId,
        isNew,
        contributors,
        url: `${process.env.VITE_EDGES_ROOT}/${country}/gen/${magazine}.${issuenumber}.png`,
      });
    },
  );
};

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
  ).reduce(
    (acc, value) => ({
      ...acc,
      [value.username]: value.id,
    }),
    {},
  );

const createContribution = async (
  user: user,
  contribution: string,
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
  contributors: { contribution: string; userId: number }[],
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
    const { publicationcode } = await prismaCoa.inducks_issue.findFirstOrThrow({
      where: { issuecode },
      select: { publicationcode: true },
    });
    edgeToPublish = await prismaDm.edge.create({
      data: {
        publicationcode,
        issuecode,
        creationDate: new Date(),
      },
    });
  }

  const issuePopularity =
    (
      await prismaDm.issuePopularity.findFirst({
        where: {
          issuecode,
        },
      })
    )?.popularity || 0;

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
