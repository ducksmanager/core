import dotenv from "dotenv";
dotenv.config({
  path: ".env",
});

dotenv.config({
  path: ".env.local",
  override: true,
});

import { v2 as cloudinary } from "cloudinary";
import { createServer } from "http";
import { Server } from "socket.io";

import type { SessionUser } from "~dm-types/SessionUser";

import type { FullIndexation } from "./services/indexation";
import { server as indexation } from "./services/indexation";
import { server as indexations } from "./services/indexations";

cloudinary.config(true);

export type SessionDataWithIndexation = {
  user: SessionUser;
  indexation: FullIndexation;
};

export type SessionDataWithIndexationId = {
  user: SessionUser;
  indexationId: string;
};
export type SessionData = { user: SessionUser };

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
  maxHttpBufferSize: 100 * 1024 * 1024,
});

indexations(io);
indexation(io);

io.engine.on("connection_error", (err) => {
  console.error("socket.io connection_error", err.code, err.message, err.context);
});

httpServer.listen(3003);
console.log("Dumili API open on port 3003");
