import type { Socket } from "socket.io";

import { prismaCoa,prismaDm } from "~prisma-clients";
import type {
  bookstoreComment,
  edge,
  user,
  userContribution,
} from "~prisma-clients/extended/dm.extends";

import type Events from "../types";
export default (socket: Socket<Events>) => {
  socket.on(
    "publishEdge",
    async (
      { shortIssuecode, designers, photographers },
      callback,
    ) => {
      const inducksIssue = await prismaCoa.inducks_issue.findFirst({
        where: {
          shortIssuecode
        }
      })
      if (!inducksIssue) {
        callback({ error: "Invalid issue code" });
        return;
      }

      const {publicationcode, shortIssuenumber} = inducksIssue
      const [country, magazine] = publicationcode!.split("/");

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
        publicationcode!,
        shortIssuenumber!,
      );

      callback({
        shortIssuecode,
        edgeId,
        isNew,
        contributors,
        url: `${process.env.VITE_EDGES_ROOT}/${country}/gen/${magazine}.${shortIssuenumber}.png`,
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
  publicationcode: string,
  shortIssuenumber: string,
) => {
  const [country, magazine] = publicationcode.split("/");
  let contributions: userContribution[];
  let edgeToPublish = await prismaDm.edge.findFirst({
    where: {
      publicationcode,
      shortIssuenumber,
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
        publicationcode,
        issuenumber: shortIssuenumber,
        creationDate: new Date(),
      },
    });
  }

  const issuePopularity =
    (
      await prismaDm.issuePopularity.findFirst({
        where: {
          country,
          magazine,
          shortIssuenumber,
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
