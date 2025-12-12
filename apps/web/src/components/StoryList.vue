<template>
  <template
    v-for="(storyAuthors, storycode) in authorsPerStory"
    :key="storycode"
  >
    <div>
      <b-badge v-for="author in storyAuthors" :key="author" class="me-1">{{
      authors[author as keyof typeof authors]
      }}</b-badge>
      <InducksStory
        v-if="storyDetails"
        show-link="inner"
        :storycode="storycode as string"
        :title="storyDetails[storycode].title"
        :comment="storyDetails[storycode].storycomment"
      />
    </div>
  </template>
</template>

<script setup lang="ts">
import type { StoryDetail } from "~dm-types/StoryDetail";

const { stories } = defineProps<{
  stories: { [personcode: string]: string[] };
  authors: { [personcode: string]: string };
  storyDetails: { [storycode: string]: StoryDetail };
}>();

const authorsPerStory = computed(() => {
  const result: { [storycode: string]: string[] } = {};
  for (const [author, storyCodes] of Object.entries(stories)) {
    for (const storyCode of storyCodes) {
      if (!result[storyCode]) {
        result[storyCode] = [];
      }
      result[storyCode].push(author);
    }
  }
  return result;
});
</script>

<style scoped lang="scss">
ul {
  padding-left: 12px;
  li {
    font-size: 12px;
  }
}
</style>
