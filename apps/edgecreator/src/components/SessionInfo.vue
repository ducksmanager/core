<template>
  <div class="user-and-locale m-2">
    <div class="text-end fw-bold">
      {{ username }}
    </div>
    <b-button-toolbar>
      <b-button-group>
        <b-button
          v-for="{ key, name } in locales"
          :key="key"
          :disabled="locale === key"
          @click="reloadWithLocale(key)"
        >
          {{ name }}
        </b-button>
      </b-button-group>
    </b-button-toolbar>
  </div>
</template>
<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { availableLocales } from "~/composables/useLocales";
import { stores as webStores } from "~web";

const { locale } = useI18n();
const locales = computed(() => availableLocales);

const collectionStore = webStores.collection();
const username = computed(() => collectionStore.user?.username as string);
const reloadWithLocale = async (key: string) => {
  locale.value = key;
  await webStores.coa().fetchCountryNames();
};
</script>
<style lang="scss">
.user-and-locale {
  position: absolute;
  right: 0;
  top: 0;
  z-index: 10;
}
</style>
