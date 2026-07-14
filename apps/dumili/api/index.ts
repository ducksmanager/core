import dotenv from "dotenv";
dotenv.config({
  path: ".env",
});

dotenv.config({
  path: ".env.local",
  override: true,
});

import { v2 as cloudinary } from "cloudinary";
import { createServer, type IncomingMessage, type ServerResponse } from "http";
import { Server } from "socket.io";

import type { SessionUser } from "~dm-types/SessionUser";

import { authenticateUser } from "./services/_auth";
import type { FullIndexation } from "./services/indexation";
import {
  handleHttpFileUpload,
  server as indexation,
} from "./services/indexation";
import { server as indexations } from "./services/indexations";

cloudinary.config(true);

export type SessionDataWithIndexation = {
  user: SessionUser;
  indexation: FullIndexation;
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
  console.error(
    "socket.io connection_error",
    err.code,
    err.message,
    err.context,
  );
});

httpServer.on("request", async (req: IncomingMessage, res: ServerResponse) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Type, X-File-Name, X-First-Page-Number, X-First-Out-Of-Range-Page-Number",
  );

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const match =
    req.method === "POST" && req.url?.match(/^\/upload\/indexation\/([^?/]+)/);
  if (!match) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
    return;
  }

  const indexationId = match[1];

  const authHeader = req.headers["authorization"];
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  let user: SessionUser;
  try {
    user = await authenticateUser(token);
  } catch {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Unauthorized" }));
    return;
  }

  const fileName = decodeURIComponent(
    (req.headers["x-file-name"] as string) || "",
  );
  const mimeType = (req.headers["content-type"] as string) || "";
  const firstPageNumber = parseInt(
    (req.headers["x-first-page-number"] as string) || "1",
    10,
  );
  const firstOutOfRangePageNumber = parseInt(
    (req.headers["x-first-out-of-range-page-number"] as string) || "999",
    10,
  );

  const chunks: Buffer[] = [];
  req.on("data", (chunk: Buffer) => chunks.push(chunk));
  await new Promise<void>((resolve, reject) => {
    req.on("end", resolve);
    req.on("error", reject);
  });
  const buffer = Buffer.concat(chunks);

  const result = await handleHttpFileUpload(io, {
    indexationId,
    user,
    buffer,
    fileName,
    mimeType,
    firstPageNumber,
    firstOutOfRangePageNumber,
  });

  res.writeHead("error" in result ? 400 : 200, {
    "Content-Type": "application/json",
  });
  res.end(JSON.stringify(result));
});

httpServer.listen(3003);
console.log("Dumili API open on port 3003");
