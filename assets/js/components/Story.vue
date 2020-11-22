<template>
  <span :class="{dark}">
    <b-badge
      v-if="kind"
      size="xl"
      :class="{[`kind-${kind}`]: true}"
    >{{ l10n[`HISTOIRE_TYPE_${kind.toUpperCase()}`] || l10n.HISTOIRE_TYPE_AUTRE }}</b-badge>
    {{ title || l10n.SANS_TITRE }}
    <small>{{ comment }}</small>
    <a
      v-if="!noLink"
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
    kind: {
      type: String,
      default: null
    },
    title: {
      type: String,
      default: null
    },
    comment: {
      type: String,
      default: null
    },
    noLink: {
      type: Boolean,
      default: false
    },
    dark: {
      type: Boolean,
      default: false
    },
  },

  computed: {
    urlEncodedStorycode() {
      return this.storycode && encodeURIComponent(this.storycode)
    }
  }
}
</script>

<style scoped lang="scss">
span {
}

.badge {
  font-size: 90%;
  width: 75px;
  color: black;

  &.kind-c {
    background: #ffcc33;
  }

  &.kind-n {
    background: #cbdced;
  }
}

.dark {
  color: black;
}
</style>