<template>
  <component :is="tagName" v-once :class="{ dark }" :href="url" target="_blank">
    <b-badge
      v-if="kind && !noBadge"
      size="xl"
      :class="{ [`kind-${kind}`]: true }"
      >{{ storyTypeText }}</b-badge
    >
    {{ title || $t("Sans titre")
    }}<template v-if="part"> - {{ $t("partie") }} {{ part }}</template>
    <small>{{ comment }}</small
    ><template v-if="showLink === 'inner'"
      >&nbsp;<a target="_blank" :href="url">
        {{ $t("Détails de l'histoire") }}
      </a></template
    >
  </component>
</template>
<script setup lang="ts">
const { t: $t } = useI18n();
const {
  kind = undefined,
  title = undefined,
  part = undefined,
  comment = undefined,
  storycode,
  showLink,
} = defineProps<{
  noBadge?: boolean;
  storycode: string;
  kind?: string;
  title?: string;
  part?: number | null;
  comment?: string;
  showLink: false | "outer" | "inner";
  dark?: boolean;
}>();

const tagName = computed(() => (showLink === "outer" ? "a" : "span"));

const url = computed(
  () =>
    storycode &&
    `https://inducks.org/story.php?c=${encodeURIComponent(storycode)}`,
);

const storyTypeText = computed(() => {
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
.badge {
  font-size: 90%;
  width: 75px;
  color: black;

  &.kind-c {
    background-color: #ffcc33 !important;
  }

  &.kind-n {
    background-color: #cbdced !important;
  }

  &.kind-n_g {
    background-color: #ff99ff !important;
  }
}

.dark {
  color: black;
}
</style>
