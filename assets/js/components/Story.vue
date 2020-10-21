<template>
  <span v-if="l10n">
    {{ title || comment || '' }}
    <a
      target="_blank"
      :href="`https://coa.inducks.org/story.php?c=${urlEncodedCode}`"
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
    urlEncodedCode() {
      return this.code && encodeURIComponent(this.code)
    }
  }
}
</script>

<style scoped>

</style>