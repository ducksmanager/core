<template>
  <ul>
    <template v-for="(storiesOfAuthor, author) in stories">
      <li v-for="storyCode in storiesOfAuthor" :key="`${author}-${storyCode}`">
        <b-badge>{{ authors[author] }}</b-badge>
        <InducksStory
          v-if="storyDetails"
          show-link="inner"
          :storycode="storyCode"
          :title="storyDetails[storyCode].title"
          :comment="storyDetails[storyCode].storycomment"
        />
      </li>
    </template>
  </ul>
</template>

<script setup lang="ts">
import type { StoryDetail } from "~dm-types/StoryDetail";

const { storyDetails = {} } = defineProps<{
  stories: { [storycode: string]: string[] };
  authors: { [personcode: string]: string };
  storyDetails?: { [storycode: string]: StoryDetail };
}>();
</script>

<style scoped lang="scss">
ul {
  padding-left: 12px;
  li {
    font-size: 12px;
  }
}
</style>
