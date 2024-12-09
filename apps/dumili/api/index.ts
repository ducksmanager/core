import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { createServer } from "http";
import type { Namespace } from "socket.io";
import { Server } from "socket.io";
import type { EventsMap } from "socket.io/dist/typed-events";

import type { SessionUser } from "~dm-types/SessionUser";
import { PrismaClient } from "~prisma/client_dumili";

import indexation from "./services/indexation";
import type { FullIndexation } from "./services/indexation/types";
import indexations from "./services/indexations";

dotenv.config({
  path: ".env",
});

dotenv.config({
  path: ".env.local",
  override: true,
});

const [, API_KEY, API_SECRET, CLOUD_NAME] =
  process.env.CLOUDINARY_URL?.match(/cloudinary:\/\/(\d+):(\w+)@(\w+)/) ?? [];
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

export type SessionDataWithIndexation = {
  user: SessionUser;
  indexation: FullIndexation;
};

export type SessionDataWithIndexationId = {
  user: SessionUser;
  indexationId: string;
};
export type SessionData = { user: SessionUser };

export type NamespaceWithData<
  Services extends EventsMap,
  ServerSentEvents extends EventsMap = {},
  Data extends object = object,
> = Namespace<Services, ServerSentEvents, Record<string, never>, Data>;

export const prisma = new PrismaClient();

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

indexations(io);
indexation(io);

httpServer.listen(3002);
console.log("Dumuli API open on port 3002");
