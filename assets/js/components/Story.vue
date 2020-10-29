<template>
  <span v-if="l10n">
    {{ title || l10n.SANS_TITRE }}
    <small>{{ comment }}</small>
    <a
      target="_blank"
      :href="`https://coa.inducks.org/story.php?c=${urlEncodedStorycode}`"
    >
      {{ l10n.DETAILS_HISTOIRE }}
    </a>
  </span>
</template>
<script>
import l10nMixin from "../mixins/l10nMixin";

export default {
  name: "Story",

  mixins: [l10nMixin],

  props: {
    storycode: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: null
    },
    comment: {
      type: String,
      default: null
    },
  },

  computed: {
    urlEncodedStorycode() {
      return this.storycode && encodeURIComponent(this.storycode)
    }
  }
}
</script>

<style scoped>

</style>