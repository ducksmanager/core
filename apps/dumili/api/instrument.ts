import dotenv from "dotenv";
dotenv.config({
  path: ".env",
});

import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { SocketIoInstrumentation } from "@opentelemetry/instrumentation-socket.io";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import * as Sentry from "@sentry/node";

if (!process.env.SENTRY_DSN) {
  throw new Error("SENTRY_DSN is not set");
}

const client = Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  openTelemetryInstrumentations: [new SocketIoInstrumentation()],
  skipOpenTelemetrySetup: true,
});

if (client) {
  Sentry.initOpenTelemetry(client, {
    spanProcessors: process.env.OTEL_EXPORTER_OTLP_ENDPOINT
      ? [new BatchSpanProcessor(new OTLPTraceExporter())]
      : [],
  });
}
