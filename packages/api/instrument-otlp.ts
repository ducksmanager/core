import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace";
import type { SpanProcessor } from "@opentelemetry/sdk-trace";

export const otlpSpanProcessors = (): SpanProcessor[] =>
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT
    ? [new BatchSpanProcessor({ exporter: new OTLPTraceExporter() })]
    : [];
