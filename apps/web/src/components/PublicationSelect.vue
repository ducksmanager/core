<template>
  <div>
    <b-form-select
      v-model="currentCountryCode"
      :options="countryNames"
      required
    />
    <b-form-select
      v-show="currentCountryCode"
      v-model="currentPublicationcode"
      name="publicationcode"
      required
      :options="publicationNamesForCurrentCountry"
      @input="$emit('input', currentPublicationcode)"
    />
    <router-link
      v-if="!noButton"
      v-slot="{ href, navigate }"
      :to="`/collection/show/${currentPublicationcode}`"
      custom
    >
      <b-button
        :href="href"
        :disabled="!currentPublicationcode"
        variant="secondary"
        @click="navigate"
      >
        {{ $t("OK") }}
      </b-button>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue";

import { coa } from "~/stores/coa";

const {
  initialCountrycode = undefined,
  initialPublicationcode = undefined,
  noButton = false,
} = defineProps<{
  noButton?: boolean;
  initialCountrycode?: string;
  initialPublicationcode?: string;
}>();
defineEmits<{ (e: "input", publicationcode: string): void }>();

const currentCountryCode = $ref(initialCountrycode);
let currentPublicationcode = $ref(initialPublicationcode);
const coaStore = coa();
const countryNames = $computed(
  () =>
    (coaStore.countryNames &&
      Object.entries(coaStore.countryNames)
        .map(([countrycode, countryName]) => ({
          text: countryName,
          value: countrycode,
        }))
        .sort(({ text: text1 }, { text: text2 }) =>
          (text1 || "").localeCompare(text2)
        )) ||
    undefined
);
const publicationNames = $computed(() => coaStore.publicationNames);
const publicationNamesFullCountries = $computed(
  () => coaStore.publicationNamesFullCountries
);
const publicationNamesForCurrentCountry = $computed(() =>
  publicationNamesFullCountries.includes(currentCountryCode || "")
    ? Object.keys(publicationNames)
        .filter((publicationcode) =>
          new RegExp(`^${currentCountryCode}/`).test(publicationcode)
        )
        .map((publicationcode) => ({
          text: publicationNames[publicationcode],
          value: publicationcode,
        }))
        .sort(({ text: text1 }, { text: text2 }) =>
          (text1 || "").localeCompare(text2 || "")
        )
    : []
);

watch(
  () => currentCountryCode,
  (newValue, oldValue) => {
    if (newValue) {
      coaStore.fetchPublicationNamesFromCountry(newValue);
      if (oldValue) {
        currentPublicationcode = undefined;
      }
    }
  },
  {
    immediate: true,
  }
);

coaStore.fetchCountryNames();
</script>

<style scoped>

</style>