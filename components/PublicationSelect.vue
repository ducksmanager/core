<template>
  <div>
    <b-form-select
      v-model="currentCountryCode"
      :options="countryNames"
      required
    />
    <b-form-select
      v-show="currentCountryCode"
      v-model="currentPublicationCode"
      name="publicationCode"
      required
      :options="publicationNamesForCurrentCountry"
      @input="$emit('input', currentPublicationCode)"
    />
    <b-button
      v-if="!noButton"
      :disabled="!currentPublicationCode"
      variant="secondary"
      :href="r(`/collection/show/{publicationCode:${currentPublicationCode}}`)"
    >
      {{ $t("OK") }}
    </b-button>
  </div>
</template>

<script setup>
import { BButton, BFormSelect } from "bootstrap-vue-3";
import { watch } from "vue";

import { coa } from "../stores/coa";
import { l10n } from "../stores/l10n";

const props = defineProps({
  noButton: {
    type: Boolean,
    default: false,
  },
  initialCountryCode: {
    type: String,
    default: null,
  },
  initialPublicationCode: {
    type: String,
    default: null,
  },
});
defineEmits(["input"]);

const currentCountryCode = $ref(props.initialCountryCode);
let currentPublicationCode = $ref(props.initialPublicationCode);
const coaStore = coa();
const countryNames = $computed(() => coaStore.countryNames);
const publicationNames = $computed(() => coaStore.publicationNames);
const publicationNamesFullCountries = $computed(
  () => coaStore.publicationNamesFullCountries
);
const publicationNamesForCurrentCountry = $computed(() =>
  publicationNamesFullCountries.includes(currentCountryCode)
    ? Object.keys(publicationNames)
        .filter((publicationCode) =>
          new RegExp(`^${currentCountryCode}/`).test(publicationCode)
        )
        .map((publicationCode) => ({
          text: publicationNames[publicationCode],
          value: publicationCode,
        }))
        .sort(({ text: text1 }, { text: text2 }) => text1.localeCompare(text2))
    : []
);
const { r } = l10n();

watch(
  () => currentCountryCode,
  (newValue) => {
    if (newValue) {
      coaStore.fetchPublicationNamesFromCountry(newValue);
      currentPublicationCode = null;
    }
  },
  {
    immediate: true,
  }
);
</script>

<style scoped>

</style>
