import vue from '@vitejs/plugin-vue';
import path from 'path';
import AutoImport from 'unplugin-auto-import/vite';
import { IonicResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8005,
  },
  plugins: [
    vue(),
    Components({
      resolvers: [IonicResolver()],
      dts: true,
    }),

    AutoImport({
      dts: true,
      imports: [
        // presets
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
        {
          from: 'axios',
          imports: ['AxiosInstance', 'InternalAxiosRequestConfig', 'AxiosError'],
          type: true,
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
      '~types/': `${path.resolve(__dirname, 'types')}/`,
      '~dm-types/': `${path.resolve(__dirname, '../../packages/types')}/`,
      '~axios-helper/': `${path.resolve(__dirname, '../../packages/axios-helper')}/`,
      '~api-routes/': `${path.resolve(__dirname, '../../packages/api-routes')}/`,
      '~prisma-clients/': `${path.resolve(__dirname, '../../packages/prisma-clients')}/`,
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
