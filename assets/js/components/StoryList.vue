<template>
  <ul>
    <template v-for="(storiesOfAuthor, author) in stories">
      <li v-for="storyCode in storiesOfAuthor" :key="`${author}- ${storyCode}`">
        <b-badge>{{ authors[author] }}</b-badge>
        <Story
          :storycode="storyCode"
          :title="storyDetails[storyCode].title"
          :comment="storyDetails[storyCode].storycomment"
        />
      </li>
    </template>
  </ul>
</template>
<script setup>
import Story from "./Story";
import { BBadge } from "bootstrap-vue-3";

defineProps({
  stories: {
    type: Object,
    required: true,
  },
  authors: {
    type: Object,
    required: true,
  },
  storyDetails: {
    type: Object,
    required: true,
  },
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
