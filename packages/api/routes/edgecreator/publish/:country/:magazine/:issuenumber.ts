import bodyParser from "body-parser";
import { prismaDm } from "prisma-clients";
import {
  bookstoreComment,
  edge,
  user,
  userContribution,
} from "prisma-clients/client_dm";

import { ExpressCall } from "~routes/_express-call";

const parseForm = bodyParser.json();
const isValidPublicationcode = (publicationcode: string) =>
  /^[a-z]+\/[-A-Z0-9]+$/.test(publicationcode);

const getUserIdsByUsername = async (
  usernames: string[]
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
  issuenumber: string
) => {
  const [country, magazine] = publicationcode.split("/");
  let contributions: userContribution[];
  let edgeToPublish = await prismaDm.edge.findFirst({
    where: {
      publicationcode,
      issuenumber,
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
        issuenumber,
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
          issuenumber,
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
  async (
    ...[req, res]: ExpressCall<{
      resBody: {
        publicationcode: string;
        issuenumber: string;
        isNew: boolean;
        edgeId: number;
        contributors: number[];
        url: string;
      };
      params: { country: string; magazine: string; issuenumber: string };
      reqBody: { designers: string[]; photographers: string[] };
    }>
  ) => {
    const publicationcode = `${req.params.country}/${req.params.magazine}`;
    if (!isValidPublicationcode(publicationcode)) {
      res.writeHead(400);
      res.end();
      return;
    }

    const issuenumber = req.params.issuenumber;
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
    const { edgeId, contributors, isNew } = await publishEdgeOnDm(
      modelContributors,
      publicationcode,
      issuenumber
    );

    return res.json({
      publicationcode,
      issuenumber,
      edgeId,
      isNew,
      contributors,
      url: `${process.env.VITE_EDGES_ROOT}/${req.params.country}/gen/${req.params.magazine}.${issuenumber}.png`,
    });
  },
];
