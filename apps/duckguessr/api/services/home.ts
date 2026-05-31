import { type Socket } from "socket.io";
import { type NamespaceProxyTarget, useSocketEvents } from "socket-call-server";

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

const listenEvents = () => ({
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
});

export const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>
>(namespaces.HOME, {
  listenEvents,
  middlewares: [],
});
