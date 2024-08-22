<route lang="yaml">
alias: [/impression/classique]
meta:
  layout: bare
</route>

<template>
  <print-header />
  <div v-if="ownedIssuecodes" class="list">
    <div v-for="country in countryCodesSortedByName" :key="country">
      <div class="country">
        {{ countryNames![country] }}
      </div>
      <div
        v-for="publicationcode in publicationCodesOfCountry(country)"
        :key="publicationcode"
      >
        <u>{{ publicationNames[publicationcode] || publicationcode }}</u>
        {{ ownedIssuecodes[publicationcode] }}
        <br />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
let ownedIssuecodes = $ref<{ [publicationcode: string]: string } | null>(null);

const {
  fetchCountryNames,
  fetchPublicationNames,
  fetchIssuecodesByPublicationcode,
} = coa();
const {
  countryNames,
  publicationNames,
  issuecodesByPublicationcode,
  issuecodeDetails,
} = storeToRefs(coa());

const { loadCollection } = collection();
const { issues } = storeToRefs(collection());

const countryCodes = $computed(
  () =>
    issues.value && [
      ...new Set(issues.value.map((i) => i.publicationcode.split("/")[0])),
    ],
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
    issues.value && [...new Set(issues.value.map((i) => i.publicationcode))],
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
      fetchIssuecodesByPublicationcode(publicationCodes!);
    }
  },
  { immediate: true },
);

watch(
  () => Object.keys(issuecodesByPublicationcode.value).length && issues.value,
  (newValue) => {
    if (newValue) {
      const collectionWithPublicationcodes = issues.value!.groupBy(
        "publicationcode",
        "[]",
      );
      ownedIssuecodes = Object.entries(
        issuecodesByPublicationcode.value,
      ).reduce(
        (acc, [publicationcode, indexedIssuecodes]) => ({
          ...acc,
          [publicationcode]: indexedIssuecodes
            .filter((indexedIssuecode) =>
              collectionWithPublicationcodes[publicationcode].some(
                ({ issuecode }) => issuecode === indexedIssuecode,
              ),
            )
            .map((issuecode) => issuecodeDetails.value[issuecode].issuenumber)
            .join(", "),
        }),
        {},
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
