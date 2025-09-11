import * as Sentry from "@sentry/vue";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  if (config.public.sentryDsn) {
    Sentry.init({
      dsn: config.public.sentryDsn,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      tracesSampleRate: 1.0,
    });
  }
});
