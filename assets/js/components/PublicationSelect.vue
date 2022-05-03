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
      :href="r(`/collection/show/{publicationCode:${currentPublicationCode}}`)"
    >
      {{ $t("OK") }}
    </b-button>
  </div>
</template>

<script setup>
import { BButton, BFormSelect } from "bootstrap-vue-3";
import { computed } from "vue";

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

const currentCountryCode = computed(() => props.initialCountryCode),
  currentPublicationCode = computed(() => props.initialPublicationCode);
const coaStore = coa(),
  countryNames = computed(() => coaStore.countryNames),
  publicationNames = computed(() => coaStore.publicationNames),
  publicationNamesFullCountries = computed(
    () => coaStore.publicationNamesFullCountries
  ),
  publicationNamesForCurrentCountry = computed(() =>
    publicationNamesFullCountries.value.includes(currentCountryCode.value)
      ? Object.keys(publicationNames.value)
          .filter((publicationCode) =>
            new RegExp(`^${currentCountryCode.value}/`).test(publicationCode)
          )
          .map((publicationCode) => ({
            text: publicationNames.value[publicationCode],
            value: publicationCode,
          }))
          .sort(({ text: text1 }, { text: text2 }) =>
            text1.localeCompare(text2)
          )
      : []
  ),
  { r } = l10n();
</script>

<style scoped>

</style>
