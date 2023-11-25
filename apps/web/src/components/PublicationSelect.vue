<template>
  <div>
    <b-form-select
      v-model="currentCountryCode"
      :options="countryNamesForPublication"
      required
    />
    <b-form-select
      v-show="currentCountryCode"
      v-model="currentPublicationcode"
      name="publicationcode"
      required
      :options="publicationNamesForCurrentCountry"
      @input="$emit('input', currentPublicationcode!)"
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
const { fetchPublicationNamesFromCountry, fetchCountryNames } = coa();
const { countryNames, publicationNames, publicationNamesFullCountries } =
  storeToRefs(coa());
const countryNamesForPublication = $computed(
  () =>
    (countryNames &&
      Object.entries(countryNames)
        .map(([countrycode, countryName]) => ({
          text: countryName,
          value: countrycode,
        }))
        .sort(({ text: text1 }, { text: text2 }) =>
          (text1 || "").localeCompare(text2),
        )) ||
    undefined,
);
const publicationNamesForCurrentCountry = $computed(() =>
  publicationNamesFullCountries.value.includes(currentCountryCode || "")
    ? Object.keys(publicationNames)
        .filter((publicationcode) =>
          new RegExp(`^${currentCountryCode}/`).test(publicationcode),
        )
        .map((publicationcode) => ({
          text: publicationNames.value[publicationcode],
          value: publicationcode,
        }))
        .sort(({ text: text1 }, { text: text2 }) =>
          (text1 || "").localeCompare(text2 || ""),
        )
    : [],
);

watch(
  $$(currentCountryCode),
  (newValue, oldValue) => {
    if (newValue) {
      fetchPublicationNamesFromCountry(newValue);
      if (oldValue) {
        currentPublicationcode = undefined;
      }
    }
  },
  {
    immediate: true,
  },
);

fetchCountryNames();
</script>
