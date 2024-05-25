import { HstVue } from '@histoire/plugin-vue';
import { defineConfig } from 'histoire';

export default defineConfig({
  plugins: [HstVue()],
  tree: { file: 'path' },
  storyMatch: ['./src/components/*.story.vue'],
  setupFile: 'histoire.setup.ts',
});
