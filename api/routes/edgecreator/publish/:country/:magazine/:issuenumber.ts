import bodyParser from "body-parser";
import { Handler } from "express";

import {
  bookstoreComment,
  edge,
  PrismaClient,
  user,
  userContribution,
} from "~prisma_clients/client_dm";

const prisma = new PrismaClient();
const parseForm = bodyParser.json();
const isValidPublicationcode = (publicationcode: string) =>
  /^[a-z]+\/[-A-Z0-9]+$/.test(publicationcode);

const getUserIdsByUsername = async (
  usernames: string[]
): Promise<{ [key: string]: number }> =>
  (
    await prisma.user.findMany({
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
    {}
  );

const createContribution = async (
  user: user,
  contribution: string,
  issuePopularity: number,
  edgeToPublish: edge | null,
  bookstoreCommentToPublish: bookstoreComment | null = null
) => {
  const currentUserPoints =
    (
      await prisma.userContribution.aggregate({
        _sum: { newPoints: true },
        where: { userId: user.id, contribution },
      })
    )._sum.newPoints || 0;

  return prisma.userContribution.create({
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
  issuenumber: string
) => {
  const [country, magazine] = publicationcode.split("/");
  let contributions: userContribution[];
  let edgeToPublish = await prisma.edge.findFirst({
    where: {
      publicationcode,
      issuenumber,
    },
  });
  const isNew = !!edgeToPublish;
  if (edgeToPublish) {
    contributions = await prisma.userContribution.findMany({
      where: {
        edgeId: edgeToPublish.id,
      },
    });
  } else {
    contributions = [];
    edgeToPublish = await prisma.edge.create({
      data: {
        publicationcode,
        issuenumber,
        creationDate: new Date(),
      },
    });
  }

  const issuePopularity =
    (
      await prisma.issuePopularity.findFirst({
        where: {
          country,
          magazine,
          issuenumber,
        },
      })
    )?.popularity || 0;

  for (const { userId, contribution } of contributors) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      continue;
    }
    if (
      !contributions.find(
        (existingContribution) =>
          existingContribution.contribution === contribution &&
          existingContribution.userId === userId
      )
    ) {
      contributions.push(
        await createContribution(
          user,
          contribution,
          issuePopularity,
          edgeToPublish
        )
      );
    }
  }

  return {
    isNew,
    edgeId: edgeToPublish.id,
    contributors: contributions.map((contribution) => contribution.userId),
  };
};

export const put = [
  parseForm,
  (async (req, res) => {
    const publicationcode = `${req.params.country}/${req.params.magazine}`;
    if (!isValidPublicationcode(publicationcode)) {
      res.writeHead(400);
      res.end();
      return;
    }

    const issueNumber = req.params.issuenumber;
    const { designers, photographers } = req.body;
    const modelContributors = [
      ...Object.values(await getUserIdsByUsername(designers)).map((userId) => ({
        userId,
        contribution: "createur",
      })),
      ...Object.values(await getUserIdsByUsername(photographers)).map(
        (userId) => ({
          userId,
          contribution: "photographe",
        })
      ),
    ];
    const { edgeId, contributors } = await publishEdgeOnDm(
      modelContributors,
      publicationcode,
      issueNumber
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        publicationcode,
        issueNumber,
        edgeId,
        contributors,
        url: `${process.env.EDGES_ROOT}/${req.params.country}/gen/${req.params.magazine}.${issueNumber}.png`,
      })
    );
  }) as Handler,
];
