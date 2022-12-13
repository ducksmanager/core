<template>
  <span v-once :class="{ dark }">
    <b-badge v-if="kind" size="xl" :class="{ [`kind-${kind}`]: true }">{{
      storyTypeText
    }}</b-badge>
    {{ title || $t("Sans titre")
    }}<template v-if="part"> - {{ $t("partie") }} {{ part }}</template>
    <small>{{ comment }}</small>
    &nbsp;<a
      v-if="!noLink"
      target="_blank"
      :href="`https://coa.inducks.org/story.php?c=${urlEncodedStorycode}`"
    >
      {{ $t("Détails de l'histoire") }}
    </a>
  </span>
</template>
<script setup lang="ts">
import { BBadge } from "bootstrap-vue-3";
import { useI18n } from "vue-i18n";

const { t: $t } = useI18n();
const {
  kind = null,
  storycode,
  title = null,
  part = null,
  comment = null,
  noLink = false,
  dark = false,
} = defineProps<{
  storycode: string;
  kind?: string;
  title?: string;
  part?: number;
  comment?: string;
  noLink?: boolean;
  dark?: boolean;
}>();
const urlEncodedStorycode = $computed(
    () => storycode && encodeURIComponent(storycode)
  ),
  storyTypeText = $computed(() => {
    switch (kind?.toUpperCase()) {
      case "A":
        return $t("article");
      case "C":
        return $t("couverture");
      case "F":
        return $t("détachable");
      case "G":
        return $t("jeu");
      case "I":
        return $t("illustration");
      case "K":
        return $t("strip");
      case "L":
        return $t("peinture");
      case "N":
        return $t("histoire");
      case "N_G":
        return $t("gag");
      case "P":
        return $t("peinture");
      case "T":
        return $t("texte");
    }
    return $t("autre");
  });
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
