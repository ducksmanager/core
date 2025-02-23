import "./instrument";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

import type { SessionUser } from "~dm-types/SessionUser";
import { PrismaClient } from "~prisma/client_dumili";

import type { FullIndexation } from "./services/indexation";
import { server as indexation } from "./services/indexation";
import { server as indexations } from "./services/indexations";

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
console.log("Dumili API open on port 3002");
