import "dotenv/config";

import * as Sentry from "@sentry/node";
import { Server } from "socket.io";

import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

import { PrismaClient } from "./prisma/client_duckguessr";
import { createGameSocket } from "./services/game";
import { createMatchmakingSocket } from "./services/game";
import { createPlayerSocket } from "./services/player";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./types/socketEvents";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});

const prisma = new PrismaClient();

const cors = {
  origin: process.env.FRONTEND_URL,
};

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>({
  cors,
});

const convertBlobToBase64 = (blob: Blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

io.of("/round").on("connection", async (socket) => {
  socket.on("getGameRounds", async (gameId, callback) => {
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
      callback({
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
      });
      return;
    }

    fetch(`${process.env.CLOUDINARY_URL_ROOT}${round.sitecodeUrl}`)
      .then(
        async (response) =>
          `data:${response.headers.get(
            "content-type",
          )};base64,${convertBlobToBase64(await response.blob())}`,
      )
      .then((base64) => {
        callback({
          gameId,
          roundNumber: round.roundNumber,
          base64,
        });
      })
      .catch((e) => {
        console.error(e);
        callback(null);
      });
  });
});

io.of("/game").on("connection", async (socket) => {
  socket.on("getGame", async (id, callback) => {
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
      callback(null);
      return;
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

    callback({
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
    });
  });
});

createPlayerSocket(io);
createMatchmakingSocket(io);

(async () => {
  const pendingGames = await prisma.game.findMany({
    where: {
      rounds: {
        some: {
          finishedAt: { gt: new Date() },
        },
      },
    },
  });
  for (const pendingGame of pendingGames) {
    console.debug(
      `Creating socket for unfinished game with ID ${pendingGame.id}`,
    );
    await createGameSocket(io, pendingGame.id);
  }
})();

io.listen(4000);
