/// <reference types="histoire" />
import vue from '@vitejs/plugin-vue';
import ReactivityTransform from '@vue-macros/reactivity-transform/vite';
import path from 'path';
import AutoImport from 'unplugin-auto-import/vite';
import { IonicResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

import getViteAliases from '../../vite-aliases';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8008,
  },

  build: {
    sourcemap: true,
    // Vite 8 / Rolldown: object-form manualChunks removed; use output.codeSplitting.groups.
    // https://rolldown.rs/in-depth/manual-code-splitting
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-vue',
              test: /node_modules\/(vue|vue-router|pinia)(\/|$)/,
            },
            {
              name: 'vendor-ionic',
              test: /node_modules\/@ionic\/(vue|vue-router)(\/|$)/,
            },
            {
              name: 'vendor-capacitor',
              test: /node_modules\/(@capacitor\/(core|app|device|haptics|keyboard|preferences|status-bar|camera|clipboard)|@capgo\/(camera-preview|capacitor-updater)|@capawesome\/(capacitor-app-update|capacitor-file-picker))(\/|$)/,
            },
            {
              name: 'vendor-charts',
              test: /node_modules\/(chart\.js|vue-chartjs)(\/|$)/,
            },
            {
              name: 'vendor-utils',
              test: /node_modules\/(@vueuse\/(core|components|integrations)|dayjs)(\/|$)/,
            },
            {
              name: 'vendor-ui',
              test: /node_modules\/(ionicons|@ionic\/pwa-elements|vue-virtual-scroller)(\/|$)/,
            },
            {
              name: 'vendor-socket',
              test: /node_modules\/socket-call-client(\/|$)/,
            },
            {
              name: 'vendor-sentry',
              test: /node_modules\/@sentry\/(capacitor|vue)(\/|$)/,
            },
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB
  },

  plugins: [
    vue(),
    ReactivityTransform(),
    viteStaticCopy({
      targets: [
        {
          src: '../web/public/images/medals/*.png',
          dest: 'images/medals',
        },
      ],
    }),
    Components({
      resolvers: [IonicResolver()],
      dts: true,
      globs: [
        'src/components/**/*.vue',
        '../web/src/components/Bookcase.vue',
        '../web/src/components/Edge.vue',
        '../web/src/components/EdgeContents.vue',
      ],
      allowOverrides: true,
    }),

    AutoImport({
      dts: true,
      vueTemplate: true,
      eslintrc: {
        enabled: true,
      },
      dirs: ['../web/src/composables', '../web/src/stores', '../../packages/types'],
      imports: [
        // presets
        '@vueuse/core',
        'pinia',
        'vue',
        'vue-router',
        {
          'vue-i18n': ['useI18n', 'createI18n'],
        },
        {
          from: 'vue-router',
          imports: ['RouteLocationNamedRaw'],
          type: true,
        },
      ],
    }),
  ],

  resolve: {
    dedupe: ['pinia', 'vue', 'vue-i18n', 'vue-router', '@vueuse/core'],
    alias: getViteAliases(path.resolve(__dirname, '../..'), {
      '~': path.resolve(__dirname, './src'),
      '~translations': path.resolve(__dirname, 'translations'),
      '~web': path.resolve(__dirname, '../web'),
    }),
  },
});
