import * as Sentry from "@sentry/nuxt";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
