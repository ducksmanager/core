<template>
  <div class="user-and-locale m-2">
    <div class="text-end fw-bold">
      {{ username }}
    </div>
    <template v-for="({ code, name }, idx) in locales">
      <template v-if="idx > 0"> |</template>
      <span v-if="$i18n.locale === code" :key="code">{{ name }}</span>
      <a v-else :key="`switch-to-${code}`" @click="reloadWithLocale(code)">{{
        name
      }}</a>
    </template>
  </div>
</template>
<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { availableLocales } from "~/composables/useLocales";
import { coa } from "~/stores/coa";
import { collection } from "~/stores/collection";

const { locale } = useI18n();
const locales = computed(() => availableLocales);

const collectionStore = collection();
const username = computed(() => collectionStore.user!.username);
const reloadWithLocale = async ({ key }: { key: string }) => {
  locale.value = key;
  await coa().fetchCountryNames(locale.value);
};
</script>
<style lang="scss">
.user-and-locale {
  position: absolute;
  right: 0;
  top: 0;
}
</style>
