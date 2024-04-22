import { defineConfig } from 'histoire';
import { HstVue } from '@histoire/plugin-vue';

export default defineConfig({
  plugins: [HstVue()],
  tree: { file: 'path' },
  storyMatch: ['./src/components/*.story.vue'],
  setupFile: 'histoire.setup.ts',
});
