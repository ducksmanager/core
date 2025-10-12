import { type Socket } from "socket.io";
import { type NamespaceProxyTarget, useSocketEvents } from "socket-call-server";

import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

import prisma from "../prisma/client";
import namespaces from "./namespaces";

export type HomeServices = NamespaceProxyTarget<
  Socket<typeof listenEvents>,
  Record<string, never>
>;

const convertUrlToBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch (error) {
    console.error("Error converting URL to base64:", error);
    return null;
  }
};

const listenEvents = ({}: HomeServices) => ({
  getGameRounds: async (gameId: number) => {
    const round = await prisma.round.findFirst({
      include: {
        roundScores: true,
      },
      where: {
        gameId,
        startedAt: { not: null },
        finishedAt: null,
      },
      orderBy: {
        roundNumber: "asc",
      },
    });

    if (!round) {
      return {
        roundScores: await prisma.roundScore.findMany({
          where: {
            roundId: {
              in: (
                await prisma.round.findMany({
                  where: {
                    gameId,
                  },
                  select: {
                    id: true,
                  },
                })
              ).map(({ id }) => id),
            },
          },
        }),
      };
    }

    const base64 = await convertUrlToBase64(
      `${process.env.CLOUDINARY_URL_ROOT}${round.sitecodeUrl}`,
    );
    return {
      gameId,
      roundNumber: round.roundNumber,
      base64,
    };
  },
  getGame: async (id: number) => {
    const game = await prisma.game.findFirst({
      include: {
        gamePlayers: {
          include: {
            player: true,
          },
        },
        rounds: {
          include: {
            roundScores: true,
          },
        },
        dataset: true,
      },
      where: {
        id,
      },
    });
    if (!game) {
      return null;
    }

    const personDetails = await prismaCoa.inducks_person.findMany({
      select: {
        personcode: true,
        fullname: true,
        nationalitycountrycode: true,
      },
      where: {
        personcode: {
          in: game.rounds.map(({ personcode }) => personcode),
        },
      },
    });

    return {
      ...game,
      rounds: game.rounds
        .filter(({ roundNumber }) => roundNumber !== null)
        .map((round) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { personcode, sitecodeUrl, ...unfinishedRound } = round;
          return round.finishedAt && round.finishedAt.getTime() <= Date.now()
            ? round
            : unfinishedRound;
        }),
      authors: personDetails.sort(
        ({ personcode: personcode1 }, { personcode: personcode2 }) =>
          personcode1 < personcode2 ? -1 : 1,
      ),
    };
  },
});

export const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>
>(namespaces.HOME, {
  listenEvents,
  middlewares: [],
});
