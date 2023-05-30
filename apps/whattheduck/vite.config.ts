import vue from '@vitejs/plugin-vue';
import path from 'path';
import { IonicResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [IonicResolver()],
      dts: true,
    }),
  ],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
      '~types/': `${path.resolve(__dirname, 'types')}/`,
      '~dm_types/': `${path.resolve(__dirname, 'node_modules/ducksmanager/types')}/`,
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
