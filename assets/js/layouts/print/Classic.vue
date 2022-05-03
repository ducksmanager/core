<template>
  <div v-if="collection && countryNames && hasPublicationNames" class="list">
    <div v-for="country in countryCodesSortedByName" :key="country">
      <div class="country">
        {{ countryNames[country] }}
      </div>
      <div
        v-for="publicationCode in publicationCodesOfCountry(country)"
        :key="publicationCode"
      >
        <u>{{ publicationNames[publicationCode] || publicationCode }}</u>
        {{ issuesOfPublicationCode(publicationCode) }}
        <br />
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, onMounted, ref, watch } from "vue";

import { coa } from "../../stores/coa";
import { collection as collectionStore } from "../../stores/collection";

const hasPublicationNames = ref(false),
  countryNames = computed(() => coa().countryNames),
  publicationNames = computed(() => coa().publicationNames),
  collection = computed(() => collectionStore().collection),
  countryCodes = computed(
    () =>
      collection.value && [...new Set(collection.value.map((i) => i.country))]
  ),
  countryCodesSortedByName = computed(
    () =>
      countryCodes.value &&
      countryNames.value &&
      [...countryCodes.value].sort(
        (countryCodeA, countryCodeB) =>
          countryNames.value[countryCodeA] &&
          countryNames.value[countryCodeA].localeCompare(
            countryNames.value[countryCodeB]
          )
      )
  ),
  publicationCodes = computed(
    () =>
      collection.value && [
        ...new Set(collection.value.map((i) => `${i.country}/${i.magazine}`)),
      ]
  ),
  fetchCountryNames = coa().fetchCountryNames,
  fetchPublicationNames = coa().fetchPublicationNames,
  loadCollection = collectionStore().loadCollection,
  publicationCodesOfCountry = (countryCode) =>
    publicationCodes.value
      .filter(
        (publicationCode) => publicationCode.split("/")[0] === countryCode
      )
      .sort((a, b) =>
        !publicationNames.value[b]
          ? 1
          : publicationNames.value[a] < publicationNames.value[b]
          ? -1
          : publicationNames.value[a] > publicationNames.value[b]
          ? 1
          : 0
      ),
  issuesOfPublicationCode = (publicationCode) =>
    collection.value
      .filter((i) => publicationCode === `${i.country}/${i.magazine}`)
      .map(({ issueNumber }) => issueNumber)
      .join(", ");
watch(
  () => publicationCodes.value,
  (newValue) => {
    if (newValue) {
      fetchPublicationNames(newValue);
      hasPublicationNames.value = true;
    }
  },
  { immediate: true }
);

onMounted(async () => {
  await fetchCountryNames();
  await loadCollection();
});
</script>

<style>
.list {
  padding: 10px;
}
.country {
  font-weight: bold;
  font-style: italic;
  margin: 10px 0 5px 0;
}
</style>
