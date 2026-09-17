import VueI18n from "@intlify/unplugin-vue-i18n/vite";
import { piniaColadaDevframe } from "@pinia/colada-devtools";
import { viteDevframeHub } from "@devframes/vite/hub";
import Vue from "@vitejs/plugin-vue";
import ReactivityTransform from "@vue-macros/reactivity-transform/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { BootstrapVueNextResolver } from "bootstrap-vue-next";
import { execSync } from "child_process";
import { readFile as readFileAsync } from "fs/promises";
import * as path from "path";
import AutoImport from "unplugin-auto-import/vite";
import IconsResolve from "unplugin-icons/resolver";
import Icons from "unplugin-icons/vite";
import Components from "unplugin-vue-components/vite";
import VueDevTools from "vite-plugin-vue-devtools";
import VueRouter from "vue-router/vite";
import { VueRouterAutoImports } from "vue-router/unplugin";
import { defineConfig } from "vite";

import getViteAliases from "../../vite-aliases.ts";

const gitCommitHash = () => {
  try {
    return execSync("git rev-parse HEAD", {
      encoding: "utf-8",
    }).trim();
  } catch {
    return undefined;
  }
};

const sentryRelease = gitCommitHash();

// `PiniaColadaDevtoolsStandalone()` mounts the same devframe, but gated behind
// DevFrame's OTP prompt and with its own floating dock. Hosting it directly
// keeps it ungated on localhost and headless — src/devtools.ts loads the
// in-page agent and surfaces the frame as a Vue DevTools tab instead.
const piniaColadaDevtoolsHub = () =>
  viteDevframeHub({
    quiet: true,
    auth: false,
    ui: false,
    devframes: [piniaColadaDevframe],
  });

export default defineConfig({
  clearScreen: false,
  define: {
    "import.meta.env.VITE_SENTRY_RELEASE": JSON.stringify(sentryRelease ?? ""),
  },
  build: {
    sourcemap: true,
  },
  optimizeDeps: {
    include: ["mapbox-gl"],
  },
  resolve: {
    alias: getViteAliases(path.resolve(import.meta.dirname, "../.."), {
      "~/": `${path.resolve(import.meta.dirname, "src")}/`,
      "~web-translations": path.resolve(import.meta.dirname, "translations"),
    }),
  },
  plugins: [
    VueDevTools(),
    piniaColadaDevtoolsHub(),
    ReactivityTransform(),
    VueRouter({
      dts: "src/route-map.d.ts",
    }),
    Vue(),

    // https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n
    VueI18n({
      runtimeOnly: false,
      compositionOnly: true,
      include: [path.resolve(import.meta.dirname, "translations/**")],
    }),

    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: [
        "vue",
        "vue/macros",
        VueRouterAutoImports,
        "@vueuse/core",
        "pinia",
        "vue-i18n",
      ],
      dts: true,
      dirs: ["./src/composables", "./src/stores", "../../packages/types"],
      vueTemplate: true,
    }),

    Icons({
      compiler: "vue3",
      autoInstall: true,
      customCollections: {
        "extra-icons": {
          coafoot: () =>
            readFileAsync("./public/images/icons/coafoot.svg").then((buffer) =>
              buffer.toString(),
            ),
        },
      },
    }),

    // https://github.com/antfu/vite-plugin-components
    Components({
      resolvers: [BootstrapVueNextResolver(), IconsResolve()],
      dirs: ["src/components", "src/components/menus", "src/layouts"],
      dts: true,
    }),

    sentryVitePlugin({
      org: "bruno-perel",
      project: "dm",
      authToken: process.env.SENTRY_AUTH_TOKEN,
      disable: !process.env.SENTRY_AUTH_TOKEN,
      release: {
        name: sentryRelease,
      },
    }),
  ],

  server: {
    forwardConsole: true,
    watch: {
      ignored: ["**/api/**", "**/.idea/**"],
    },
  },
});
