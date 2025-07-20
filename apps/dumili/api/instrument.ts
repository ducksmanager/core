import { SocketIoInstrumentation } from "@opentelemetry/instrumentation-socket.io";
import * as Sentry from "@sentry/node";

if (process.env.NODE_ENV === "production") {
Sentry.init({
  dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    openTelemetryInstrumentations: [new SocketIoInstrumentation()],
  });
}
