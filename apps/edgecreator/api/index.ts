import * as Sentry from "@sentry/node";

import dotenv from "dotenv";
import { OptionalAuthMiddleware } from "~api/services/auth/util";

import { createServer } from "http";
import { Server } from "socket.io";

import type { SessionUser } from "~dm-types/SessionUser";

import text from "./services/text";
dotenv.config({
  path: "../.env",
});

const port = 3001;

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});

// const app = express();

// app.use(
//   Sentry.Handlers.requestHandler({
//     user: ["id", "username"],
//   }) as express.RequestHandler
// );
// app.use(
//   cors({
//     optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
//   })
// );
// app.use(cookieParser());

// app.all(/^.+$/, injectTokenIfValid);
// app.all(/^\/fs\/save$/, [
//   authenticateToken,
//   parseForm,
//   checkUserIsAdminForExportOrIsEditorForSaveOrIsFirstFileForModel,
// ]);
// app.all(/^\/fs\/(text|upload|upload-base64)$/, [
//   authenticateToken,
//   checkUserIsAdminOrEditor,
// ]);

// app.use(Sentry.Handlers.errorHandler() as express.ErrorRequestHandler);

// (async () => {
//   app.use("/", await router({ directory: `${process.cwd()}/routes` }));
//   app.listen(port, () =>
//     console.log(`EdgeCreator API listening on port ${port}`)
//   );
// })();

class ServerWithUser extends Server<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  { user?: SessionUser }
> {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BigInt.prototype as any).toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

dotenv.config({
  path: "./.env",
});

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});

const httpServer = createServer(async (req, res) => {
  let data: { error: string } | object;
  switch (req.url) {
    //   case "/status/db":
    //     data = await getDbStatus();
    //     break;
    //   case "/status/pastecsearch":
    //     data = await getPastecSearchStatus();
    //     break;
    //   case "/status/pastec":
    //     data = await getPastecStatus();
    default:
      res.writeHead(404);
      res.end();
      return;
  }

  res.writeHead("error" in data ? 500 : 200, { "Content-Type": "text/json" });
  res.write(JSON.stringify(data));
  res.end();
});
const io = new ServerWithUser(httpServer, {
  cors: {
    origin: "*",
  },
});

httpServer.listen(port);
console.log(`WebSocket open on port ${port}`);

io.use(OptionalAuthMiddleware);
io.use((_socket, next) => {
  next();

  // app.all(
  //   /^\/(edgecreator\/(publish|edgesprites)|notifications)|(edges\/(published))|(\/demo\/reset)|(bookstores\/(approve|refuse))|(presentation-text\/(approve|refuse))/,
  //   [checkUserIsAdmin]
  // );

  // app.all(/^\/edgecreator\/(.+)/, [
  //   authenticateToken,
  //   checkUserIsEdgeCreatorEditor,
  // ]);

  // app.all(/^\/global-stats\/user\/list$/, [
  //   authenticateToken,
  //   checkUserIsEdgeCreatorEditor,
  // ]);

  // app.all(/^\/collection\/(.+)/, authenticateToken);
  // app.all("/global-stats/user/collection/rarity", authenticateToken);
});

text(io);
