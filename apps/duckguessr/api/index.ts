import "dotenv/config";

import * as Sentry from "@sentry/node";
import { Namespace, Server } from "socket.io";

import { PrismaClient as PrismaCoaClient } from "~prisma-clients/client_coa";

import { player, PrismaClient } from "./prisma/client_duckguessr";
import { createGameSocket } from "./sockets/game";
import { createMatchmakingSocket } from "./sockets/game";
import { createPlayerSocket } from "./sockets/player";
import {
  ClientToServerEvents,
  ClientToServerEventsDatasets,
  ClientToServerEventsMaintenance,
  ClientToServerEventsPodium,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./types/socketEvents";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});

const prisma = new PrismaClient();
const prismaCoa = new PrismaCoaClient();

const cors = {
  origin: process.env.FRONTEND_URL
};

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>({
  cors,
});

const maintenanceNamespace: Namespace<ClientToServerEventsMaintenance> = io.of("/maintenance");
maintenanceNamespace.on("connection", async (socket) => {
  socket.on("getMaintenanceData", async (callback) => {
    callback(
      await prisma.$queryRaw`
              select name, decision, count(*) as 'count'
              from dataset
              left join dataset_entryurl de on dataset.id = de.dataset_id
              left join entryurl_details using (sitecode_url)
              group by dataset_id, decision
            `
    );
  });

  socket.on(
    "getMaintenanceDataForDataset",
    async (datasetName, decisions, offset, callback) => {
      if (!decisions) {
        throw new Error("No decisions provided");
      }
      const dataset = await prisma.dataset.findUnique({
        where: {
          name: datasetName,
        },
      });
      if (!dataset) {
        throw new Error("No dataset exists with name " + datasetName);
      }
      callback(
        await prisma.datasetEntryurl.findMany({
          where: {
            OR: decisions.map((decision) => ({
              datasetId: dataset.id,
              entryurlDetails: {
                is: {
                  decision: decision === "null" ? null : decision,
                },
              },
            })),
          },
          include: {
            dataset: true,
            entryurlDetails: true,
          },
          take: 60,
          skip: offset,
          orderBy: {
            sitecodeUrl: "asc",
          },
        })
      );
    }
  );

  socket.on("updateMaintenanceData", async (data) => {
    await prisma.$transaction(
      data.map(({ sitecodeUrl, decision }) =>
        prisma.entryurlDetails.update({
          where: {
            sitecodeUrl,
          },
          data: {
            decision,
            updatedAt: new Date(),
          },
        })
      )
    );
  });
});

const datasetsNamespace: Namespace<ClientToServerEventsDatasets> = io.of("/datasets");
datasetsNamespace.on("connection", async (socket) => {
  socket.on("getDatasets", async (callback) => {
    callback(
      await prisma.$queryRaw`
      SELECT dataset.id, name, title, description, COUNT(*) AS images, COUNT(DISTINCT personcode) AS authors
      FROM dataset
      LEFT JOIN dataset_entryurl de ON dataset.id = de.dataset_id
      LEFT JOIN entryurl_details entryurl ON de.sitecode_url = entryurl.sitecode_url
      WHERE dataset.active = 1
      AND dataset.name NOT LIKE '%-ml'
      AND decision = 'ok'
      GROUP BY dataset.name`
    );
  });
});

const podiumNamespace: Namespace<ClientToServerEventsPodium> = io.of("/podium");
podiumNamespace.on("connection", async (socket) => {
  socket.on("getPodium", async (callback) => {
    callback(
      (await prisma.$queryRaw`
      SELECT player.*, sum(score + speed_bonus) AS sumScore
      FROM player
      INNER JOIN round_score ON player.id = round_score.player_id
      WHERE username NOT like 'bot_%' and username NOT LIKE 'user%'
      GROUP BY player.id
      HAVING sumScore > 0
      ORDER BY sumScore DESC
    `) as (player & { sumScore: number })[]
    );
  });
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
            "content-type"
          )};base64,${convertBlobToBase64(await response.blob())}`
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
          personcode1 < personcode2 ? -1 : 1
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
      `Creating socket for unfinished game with ID ${pendingGame.id}`
    );
    await createGameSocket(io, pendingGame.id);
  }
})()

io.listen(4000);
