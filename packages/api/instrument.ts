import * as Sentry from "@sentry/node";

import { SocketIoInstrumentation } from "@opentelemetry/instrumentation-socket.io";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

Sentry.addOpenTelemetryInstrumentation(new SocketIoInstrumentation());
