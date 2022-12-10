<route lang="yaml">
alias: [/impression/classique]
meta:
  layout: bare
</route>

<template>
  <print-header />
  <div v-if="ownedIssueNumbers" class="list">
    <div v-for="country in countryCodesSortedByName" :key="country">
      <div class="country">
        {{ countryNames[country] }}
      </div>
      <div
        v-for="publicationCode in publicationCodesOfCountry(country)"
        :key="publicationCode"
      >
        <u>{{ publicationNames[publicationCode] || publicationCode }}</u>
        {{ ownedIssueNumbers[publicationCode] }}
        <br />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";

import { coa } from "~/stores/coa";
import { collection as collectionStore } from "~/stores/collection";

let ownedIssueNumbers = $ref(
  null as { [publicationcode: string]: string } | null
);

const countryNames = $computed(() => coa().countryNames);
const publicationNames = $computed(() => coa().publicationNames);
const issueNumbers = $computed(() => coa().issueNumbers);
const collection = $computed(() => collectionStore().collection);
const countryCodes = $computed(
  () => collection && [...new Set(collection.map((i) => i.country))]
);
const countryCodesSortedByName = $computed(
  () =>
    countryCodes &&
    countryNames &&
    [...countryCodes].sort((countryCodeA, countryCodeB) =>
      countryNames[countryCodeA]?.localeCompare(countryNames[countryCodeB])
    )
);
const publicationCodes = $computed(
  () =>
    collection && [
      ...new Set(collection.map((i) => `${i.country}/${i.magazine}`)),
    ]
);
const publicationCodesOfCountry = (countrycode: string) =>
  publicationCodes
    ?.filter((publicationCode) => publicationCode.split("/")[0] === countrycode)
    ?.sort((a, b) =>
      !publicationNames[b]
        ? 1
        : publicationNames[a] < publicationNames[b]
        ? -1
        : publicationNames[a] > publicationNames[b]
        ? 1
        : 0
    ) || [];

watch(
  () => publicationCodes,
  (newValue) => {
    if (newValue) {
      coa().fetchPublicationNames(publicationCodes!);
      coa().fetchIssueNumbers(publicationCodes!);
    }
  },
  { immediate: true }
);

watch(
  () => Object.keys(issueNumbers).length && collection,
  (newValue) => {
    if (newValue) {
      const collectionWithPublicationcodes = collection!
        .map(({ country, magazine, issueNumber }) => ({
          publicationcode: `${country}/${magazine}`,
          issueNumber,
        }))
        .reduce(
          (acc, { publicationcode, issueNumber }) => ({
            ...acc,
            [publicationcode]: [...(acc[publicationcode] || []), issueNumber],
          }),
          {} as { [publicationcode: string]: string[] }
        );
      ownedIssueNumbers = Object.entries(issueNumbers).reduce(
        (acc, [publicationcode, indexedIssueNumbers]) => ({
          ...acc,
          [publicationcode]: indexedIssueNumbers
            .filter((indexedIssueNumber) =>
              collectionWithPublicationcodes[publicationcode].includes(
                indexedIssueNumber
              )
            )
            .join(", "),
        }),
        {} as { [publicationcode: string]: string }
      );
    }
  },
  { immediate: true }
);

onMounted(async () => {
  await coa().fetchCountryNames();
  await collectionStore().loadCollection();
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
