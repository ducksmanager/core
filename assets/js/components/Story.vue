<template>
  <span :class="{dark}">
    <b-badge
      v-if="kind"
      size="xl"
      :class="{[`kind-${kind}`]: true}"
    >{{ storyTypeText }}</b-badge>
    {{ title || $t("Sans titre") }}<template v-if="part"> - {{ $t('partie') }} {{ part }}</template>
    <small>{{ comment }}</small>
    <a
      v-if="!noLink"
      target="_blank"
      :href="`https://coa.inducks.org/story.php?c=${urlEncodedStorycode}`"
    >
      {{ $t("Détails de l'histoire") }}
    </a>
  </span>
</template>
<script>
import {BBadge} from "bootstrap-vue-3";

export default {
  name: "Story",

  components: {
    BBadge
  },


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
    part: {
      type: Number,
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
    }
  },

  computed: {
    urlEncodedStorycode() {
      return this.storycode && encodeURIComponent(this.storycode);
    },
    storyTypeText() {
      switch (this.kind.toUpperCase()) {
        case "A":
          return this.$t("article");
        case   "C":
          return this.$t("couverture");
        case   "F":
          return this.$t("détachable");
        case   "G":
          return this.$t("jeu");
        case   "I":
          return this.$t("illustration");
        case   "K":
          return this.$t("strip");
        case   "L":
          return this.$t("peinture");
        case   "N":
          return this.$t("histoire");
        case   "N_G":
          return this.$t("gag");
        case   "P":
          return this.$t("peinture");
        case   "T":
          return this.$t("texte");
      }
      return this.$t("autre");
    }
  }
};
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

  &.kind-n_g {
    background: #ff99ff;
  }
}

.dark {
  color: black;
}
</style>
