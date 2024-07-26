<route lang="yaml">
alias: [/impression/classique]
meta:
  layout: bare
</route>

<template>
  <print-header />
  <div v-if="ownedShortIssuenumbers" class="list">
    <div v-for="country in countryCodesSortedByName" :key="country">
      <div class="country">
        {{ countryNames![country] }}
      </div>
      <div
        v-for="publicationcode in publicationCodesOfCountry(country)"
        :key="publicationcode"
      >
        <u>{{ publicationNames[publicationcode] || publicationcode }}</u>
        {{ ownedShortIssuenumbers[publicationcode] }}
        <br />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
let ownedShortIssuenumbers = $ref(
  null as { [publicationcode: string]: string } | null,
);

const { fetchCountryNames, fetchPublicationNames, fetchIssueNumbers } = coa();
const { countryNames, publicationNames, shortIssuenumbers } =
  storeToRefs(coa());

const { loadCollection } = collection();
const { issues } = storeToRefs(collection());

const countryCodes = $computed(
  () => issues.value && [...new Set(issues.value.map((i) => i.country))],
);
const countryCodesSortedByName = $computed(
  () =>
    countryCodes &&
    countryNames &&
    [...countryCodes].sort((countryCodeA, countryCodeB) =>
      countryNames.value![countryCodeA]?.localeCompare(
        countryNames.value![countryCodeB],
      ),
    ),
);
const publicationCodes = $computed(
  () =>
    issues.value && [
      ...new Set(issues.value.map((i) => `${i.country}/${i.magazine}`)),
    ],
);
const publicationCodesOfCountry = (countrycode: string) =>
  publicationCodes
    ?.filter((publicationcode) => publicationcode.split("/")[0] === countrycode)
    ?.sort((a, b) =>
      (publicationNames.value[a] || "").localeCompare(
        publicationNames.value[b] || "",
      ),
    ) || [];

watch(
  $$(publicationCodes),
  (newValue) => {
    if (newValue) {
      fetchPublicationNames(publicationCodes!);
      fetchIssueNumbers(publicationCodes!);
    }
  },
  { immediate: true },
);

watch(
  () => Object.keys(shortIssuenumbers.value).length && issues.value,
  (newValue) => {
    if (newValue) {
      const collectionWithPublicationcodes = issues
        .value!.map(({ country, magazine, shortIssuenumber }) => ({
          publicationcode: `${country}/${magazine}`,
          shortIssuenumber,
        }))
        .reduce(
          (acc, { publicationcode, shortIssuenumber }) => ({
            ...acc,
            [publicationcode]: [
              ...(acc[publicationcode] || []),
              shortIssuenumber!,
            ],
          }),
          {} as { [publicationcode: string]: string[] },
        );
      ownedShortIssuenumbers = Object.entries(shortIssuenumbers.value).reduce(
        (acc, [publicationcode, indexedShortIssuenumbers]) => ({
          ...acc,
          [publicationcode]: indexedShortIssuenumbers
            .filter((indexedShortIssuenumber) =>
              collectionWithPublicationcodes[publicationcode].includes(
                indexedShortIssuenumber,
              ),
            )
            .join(", "),
        }),
        {} as { [publicationcode: string]: string },
      );
    }
  },
  { immediate: true },
);

(async () => {
  await fetchCountryNames();
  await loadCollection();
})();
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
