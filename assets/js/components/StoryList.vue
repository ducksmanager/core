<template>
  <ul>
    <template v-for="(storiesOfAuthor, author) in stories">
      <li
        v-for="storyCode in storiesOfAuthor"
        :key="`${author}- ${storyCode}`"
      >
        <b-badge>{{ authors[author] }}</b-badge>
        <Story
          :storycode="storyCode"
          :title="storyDetails[storyCode].title"
          :comment="storyDetails[storyCode].comment"
        />
      </li>
    </template>
  </ul>
</template>
<script>
import Story from "./Story";

export default {
  name: "StoryList",

  components: {
    Story
  },

  props: {
    stories: {
      type: Array,
      required: true
    },
    authors: {
      type: Array,
      required: true
    },
    storyDetails: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped>

</style>