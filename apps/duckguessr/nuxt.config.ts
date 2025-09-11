import getViteAliases from "../../vite-aliases";
import path from "path";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  alias: {
    ...getViteAliases(path.resolve(__dirname, "../..")),
    "~/*": "/app/*",
    "~locales/*": "/locales/*",
    "~web/*": "../web/*",
    "~duckguessr-prisma-client": "/api/prisma/client_duckguessr/client",
    "~duckguessr-services/*": "/api/services/*",
    "~duckguessr-types/*": "/api/types/*",
  },

  devtools: { enabled: true },
  compatibilityDate: "2025-09-09",

  // CSS
  css: ["bootstrap/dist/css/bootstrap.min.css", "~/styles/main.scss"],

  // Modules
  modules: [
    "@bootstrap-vue-next/nuxt",
    "@nuxtjs/i18n",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@sentry/nuxt",
    "@nuxtjs/storybook",
  ],

  // Auto-imports
  imports: {
    dirs: [
      "../web/src/composables",
      "../web/src/stores",
      "../../packages/types",
    ],
  },

  // Components
  components: [
    {
      path: "~/app/components",
      pathPrefix: false,
    },
  ],

  // TypeScript
  typescript: {
    strict: true,
    typeCheck: true,
  },

  // Runtime config
  runtimeConfig: {
    public: {
      dmSocketUrl: process.env.VITE_DM_SOCKET_URL || "",
      sentryDsn: process.env.VITE_SENTRY_DSN || "",
    },
  },

  // Sentry configuration
  sentry: {
    dsn: process.env.VITE_SENTRY_DSN || "",
    lazy: true,
    clientIntegrations: {
      Replay: {},
      BrowserTracing: {},
    },
    serverIntegrations: {
      RewriteFrames: {},
    },
  },

  // Vite config
  vite: {
    resolve: {
      dedupe: [
        "vue",
        "vue-router",
        "vue-i18n",
        "@vueuse/core",
        "bootstrap-vue-next",
      ],
    },
  },

  // i18n configuration
  i18n: {
    locales: [
      { code: "fr", file: "fr-FR.json" },
      { code: "en", file: "en-US.json" },
      { code: "de", file: "de.json" },
      { code: "es", file: "es.json" },
    ],
    langDir: "./locales",
    defaultLocale: "fr",
    strategy: "prefix_except_default",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "locale",
      redirectOn: "root",
    },
  },

  // App configuration
  app: {
    head: {
      title: "DuckGuessr",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
    },
  },
});
