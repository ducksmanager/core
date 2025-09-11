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
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-ionic': ['@ionic/vue', '@ionic/vue-router'],
          'vendor-capacitor': [
            '@capacitor/core',
            '@capacitor/app',
            '@capacitor/device',
            '@capacitor/haptics',
            '@capacitor/keyboard',
            '@capacitor/preferences',
            '@capacitor/status-bar',
            '@capacitor/camera',
            '@capacitor/clipboard',
            '@capacitor-community/camera-preview',
            '@capawesome/capacitor-app-update',
            '@capawesome/capacitor-file-picker',
            '@capgo/capacitor-updater',
          ],
          'vendor-charts': ['chart.js', 'vue-chartjs'],
          'vendor-utils': ['@vueuse/core', '@vueuse/components', '@vueuse/integrations', 'dayjs'],
          'vendor-ui': ['ionicons', '@ionic/pwa-elements', 'vue-virtual-scroller'],
          'vendor-socket': ['socket-call-client'],
          'vendor-sentry': ['@sentry/capacitor', '@sentry/vue'],
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
