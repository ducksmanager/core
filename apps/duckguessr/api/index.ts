import "dotenv/config";

import * as Sentry from "@sentry/node";
import { Server } from "socket.io";

import { PrismaClient } from "./prisma/client_duckguessr/client";
import { createGameSocket } from "./services/game";
// import { createMatchmakingSocket } from "./services/game";
import { server as home } from "./services/home";
import { server as player } from "./services/player";

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  });
}

const prisma = new PrismaClient();

const cors = {
  origin: process.env.FRONTEND_URL,
};

const io = new Server({
  cors,
});

home(io)
player(io);
// createMatchmakingSocket(io);

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
    const socket = await createGameSocket(pendingGame.id);
    if (socket) {
      socket.server(io);
    }
  }
})();

io.listen(4000);
