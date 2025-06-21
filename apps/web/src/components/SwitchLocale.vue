<template>
  <div id="flags" :class="{ right }">
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
const { getImagePath } = images();
const { fetchCountryNames } = coa();

const { right } = defineProps<{ right?: boolean }>();

const i18n = useI18n();
const locales = computed(() => availableLocales);
const reloadWithLocale = async ({ key }: { key: string }) => {
  localStorage.setItem("locale", key);
  i18n.locale.value = key;
  await fetchCountryNames(true);
};
</script>

<style scoped lang="scss">
#flags {
  top: 0;
  z-index: 50;
  background: inherit;
  padding: 8px;
  cursor: pointer;
  position: fixed;
  right: 165px;

  &.right {
    right: 0;
  }
}
</style>
