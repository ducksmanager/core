<route lang="yaml">
alias: [/impression/classique]
</route>

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
        <br>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'

import { coa } from '~/stores/coa'
import { collection as collectionStore } from '~/stores/collection'

let hasPublicationNames = $ref(false)
const countryNames = $computed(() => coa().countryNames)
const publicationNames = $computed(() => coa().publicationNames)
const collection = $computed(() => collectionStore().collection)
const countryCodes = $computed(
  () => collection && [...new Set(collection.map(i => i.country))],
)
const countryCodesSortedByName = $computed(
  () =>
    countryCodes
      && countryNames
      && [...countryCodes].sort(
        (countryCodeA, countryCodeB) =>
          countryNames[countryCodeA]
          && countryNames[countryCodeA].localeCompare(countryNames[countryCodeB]),
      ),
)
const publicationCodes = $computed(
  () =>
    collection && [
      ...new Set(collection.map(i => `${i.country}/${i.magazine}`)),
    ],
)
const fetchCountryNames = coa().fetchCountryNames
const fetchPublicationNames = coa().fetchPublicationNames
const loadCollection = collectionStore().loadCollection
const publicationCodesOfCountry = countryCode =>
  publicationCodes
    .filter(
      publicationCode => publicationCode.split('/')[0] === countryCode,
    )
    .sort((a, b) =>
      !publicationNames[b]
        ? 1
        : publicationNames[a] < publicationNames[b]
          ? -1
          : publicationNames[a] > publicationNames[b]
            ? 1
            : 0,
    )
const issuesOfPublicationCode = publicationCode =>
  collection
    .filter(i => publicationCode === `${i.country}/${i.magazine}`)
    .map(({ issueNumber }) => issueNumber)
    .join(', ')
watch(
  () => publicationCodes,
  (newValue) => {
    if (newValue) {
      fetchPublicationNames(newValue)
      hasPublicationNames = true
    }
  },
  { immediate: true },
)

onMounted(async () => {
  await fetchCountryNames()
  await loadCollection()
})
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
