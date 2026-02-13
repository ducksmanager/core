import { defineNuxtConfig } from "nuxt/config";
import path from "path";
import IconsResolver from "unplugin-icons/resolver";
import ViteComponents from "unplugin-vue-components/vite";
import checker from "vite-plugin-checker";

import getViteAliases from "../../vite-aliases";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  alias: {
    ...getViteAliases(path.resolve(__dirname, "../..")),
    "~/*": "/app/*",
    "~styles/*": "/styles/*",
    "~locales/*": "/locales/*",
    "~web": path.resolve(__dirname, "../web"),
    "~web/*": path.resolve(__dirname, "../web/*"),
    "~duckguessr-prisma-browser": "/api/prisma/client_duckguessr/browser",
    "~duckguessr-services": path.resolve(__dirname, "api/services"),
    "~duckguessr-services/*": path.resolve(__dirname, "api/services/*"),
    "~duckguessr-types": path.resolve(__dirname, "api/types"),
    "~duckguessr-types/*": path.resolve(__dirname, "api/types/*"),
  },

  devtools: { enabled: false },
  compatibilityDate: "2025-09-09",
  css: [
    path.resolve(
      __dirname,
      "node_modules/bootstrap/dist/css/bootstrap.min.css",
    ),
    path.resolve(__dirname, "styles/main.scss"),
  ],

  // Modules
  modules: [
    "@bootstrap-vue-next/nuxt",
    [
      "@nuxtjs/i18n",
      {
        locales: [
          { code: "fr", file: "fr-FR.json" },
          { code: "en", file: "en-US.json" },
          { code: "de", file: "de.json" },
          { code: "es", file: "es.json" },
        ],
        langDir: "../locales",
        defaultLocale: "fr",
        strategy: "prefix_except_default",
        detectBrowserLanguage: {
          useCookie: true,
          cookieKey: "locale",
          redirectOn: "root",
        },
      },
    ],
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxtjs/storybook",
    [
      "@sentry/nuxt/module",
      {
        sourceMapsUploadOptions: {
          org: "bruno-perel",
          project: "duckguessr",
        },
      },
    ],
    "@nuxt/eslint",
    "unplugin-icons/nuxt",
  ],

  // Auto-imports
  imports: {
    dirs: [
      "~/stores",
      "../../packages/types",
      "~web/src/composables",
      "~web/src/stores",
    ],
  },

  // TypeScript
  typescript: {
    strict: true,
    typeCheck: true,
    shim: true,
    tsConfig: {
      compilerOptions: {
        noUncheckedIndexedAccess: false,
        noImplicitOverride: false,
      },
    },
  },

  // Runtime config
  runtimeConfig: {
    public: {
      dmSocketUrl: process.env.VITE_DM_SOCKET_URL || "",
      duckguessrSocketUrl: process.env.VITE_SOCKET_URL || "",
      sentryDsn: process.env.VITE_SENTRY_DSN || "",
    },
  },

  // Vite config
  vite: {
    plugins: [
      // Type assertion: vite-plugin-checker and unplugin-vue-components have Plugin type
      // mismatches with Vite 7's stricter Rollup types (PluginContextMeta.viteVersion)
      checker({ vueTsc: true }) as any,
      ViteComponents({
        resolvers: [
          IconsResolver({
            prefix: "",
            strict: true,
          }),
        ],
        dts: true,
      }) as any,
    ],
    resolve: {
      dedupe: ["vue", "vue-i18n", "@vueuse/core", "bootstrap-vue-next"],
    },
    server: {
      fs: {
        allow: [
          "..",
          path.resolve(__dirname, "node_modules"),
          path.resolve(__dirname, "../.."),
        ],
      },
    },
  },

  // Dev server config - use 0.0.0.0 to listen on both IPv4 and IPv6
  devServer: {
    host: "0.0.0.0", // Listen on all interfaces (IPv4 and IPv6)
    port: 8007,
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

  sourcemap: {
    client: "hidden",
  },

  ignore: ["**/node_modules", "**/dist", ".git/**", "api/prisma/client_*"],
});
