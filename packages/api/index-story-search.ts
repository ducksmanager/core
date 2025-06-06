import { SocketIoInstrumentation } from "@opentelemetry/instrumentation-socket.io";
import * as Sentry from "@sentry/node";
import dotenv from "dotenv";
import createSocketServer from "./socket";
import { server as storySearch } from "./services/story-search";

dotenv.config({
  path: "./.env",
});

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  openTelemetryInstrumentations: [new SocketIoInstrumentation()],
});

const storySearchIo = createSocketServer(3011);
storySearch(storySearchIo);
