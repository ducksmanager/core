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
        {{ countryNames![country] }}
      </div>
      <div
        v-for="publicationcode in publicationCodesOfCountry(country)"
        :key="publicationcode"
      >
        <u>{{ publicationNames[publicationcode] || publicationcode }}</u>
        {{ ownedIssueNumbers[publicationcode] }}
        <br />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
let ownedIssueNumbers = $ref(
  null as { [publicationcode: string]: string } | null,
);

const { fetchCountryNames, fetchPublicationNames, fetchIssueNumbers } = coa();
const { countryNames, publicationNames, issueNumbers } = storeToRefs(coa());

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
  () => Object.keys(issueNumbers).length && collection,
  (newValue) => {
    if (newValue) {
      const collectionWithPublicationcodes = issues
        .value!.map(({ country, magazine, issuenumber }) => ({
          publicationcode: `${country}/${magazine}`,
          issuenumber: issuenumber,
        }))
        .reduce(
          (acc, { publicationcode, issuenumber }) => ({
            ...acc,
            [publicationcode]: [...(acc[publicationcode] || []), issuenumber],
          }),
          {} as { [publicationcode: string]: string[] },
        );
      ownedIssueNumbers = Object.entries(issueNumbers.value).reduce(
        (acc, [publicationcode, indexedIssueNumbers]) => ({
          ...acc,
          [publicationcode]: indexedIssueNumbers
            .filter((indexedIssueNumber) =>
              collectionWithPublicationcodes[publicationcode].includes(
                indexedIssueNumber,
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
