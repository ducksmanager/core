<template>
  <div id="flags" :class="{ fixed }">
    <img
      v-for="locale in locales"
      :key="locale.key"
      class="flag"
      :src="getImagePath(`flags/xl/${locale.flagName}.png`)"
      :alt="locale.name"
      @click="reloadWithLocale(locale)"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { availableLocales } from "~/composables/locales";
import { coa } from "~/stores/coa";
import { images } from "~/stores/images";

const { fixed = false } = defineProps<{
  fixed?: boolean;
}>();

const getImagePath = images().getImagePath;
const i18n = useI18n();
const locales = $computed(() => availableLocales);
const reloadWithLocale = async ({ key }: { key: string }) => {
  localStorage.setItem("locale", key);
  i18n.locale.value = key;
  await coa().fetchCountryNames(true);
};
</script>

<style scoped lang="scss">
#flags {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 50;
  background: inherit;
  padding: 8px;
  cursor: pointer;

  &.fixed {
    position: fixed;
    right: 165px;
  }
}
</style>
