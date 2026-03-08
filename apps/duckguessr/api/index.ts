import "dotenv/config";

import * as Sentry from "@sentry/node";
import { Server } from "socket.io";

import prisma from "./prisma/client";
import { server as datasets } from "./services/datasets";
import { createGameSocket } from "./services/game";
// import { createMatchmakingSocket } from "./services/game";
import { server as home } from "./services/home";
import { server as maintenance } from "./services/maintenance";
import { server as player } from "./services/player";
import { server as match } from "./services/match";

(BigInt.prototype as unknown as { toJSON: () => number }).toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  });
}

const cors = {
  origin: process.env.FRONTEND_URL,
};

export const io = new Server({
  cors,
});

datasets(io);
home(io);
player(io);
maintenance(io);
match(io);
// createMatchmakingSocket(io);

const pendingGames = await prisma.game.findMany({
  where: {
    OR: [
      {
        finishedAt: { gt: new Date() },
      },
      {
        finishedAt: null,
      },
    ],
  },
});
for (const pendingGame of pendingGames) {
  console.debug(
    `Creating socket for unfinished game with ID ${pendingGame.id}`,
  );
  await createGameSocket(pendingGame.id);
}

io.listen(3003);
