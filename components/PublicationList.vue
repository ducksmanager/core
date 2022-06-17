<template>
  <nav
    v-if="countryNames && hasPublicationNames"
    id="publication-list"
    class="navbar navbar-expand-lg navbar-dark bg-dark flex-row align-items-center position-sticky"
  >
    <button
      class="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#nav-publications"
    >
      <span class="navbar-toggler-icon" />
    </button>
    <NuxtLink class="navbar-brand" href="#">
      {{ $t("Collection") }}
    </NuxtLink>
    <div id="nav-publications" class="collapse navbar-collapse">
      <ul class="navbar-nav">
        <li
          v-for="country in sortedCountries"
          :key="country"
          class="nav-item dropdown"
        >
          <a
            id="navbarDropdown"
            class="nav-link dropdown-toggle"
            href="#"
            role="button"
            data-bs-toggle="dropdown"
          >
            <Country :country="country" :country-name="countryNames[country]">
              <template #default="props">
                {{ props.countryName }}
              </template>
            </Country>
          </NuxtLink>
          <ul class="dropdown-menu">
            <li
              v-for="publicationCode in getSortedPublications(country)"
              :key="publicationCode"
            >
              <a
                class="dropdown-item"
                :href="
                  r(`/collection/show/{publicationCode:${publicationCode}}`)
                "
              >
                {{
                  publicationNames[publicationCode] ||
                  publicationCode.split("/")[1]
                }}
              </NuxtLink>
            </li>
          </ul>
        </li>
        <li class="nav-item">
          <a
            class="nav-link"
            :href="r('/collection/show/{publicationCode:new}')"
            >{{ $t("Nouveau magazine") }}</a
          >
        </li>
      </ul>
    </div>
    <div class="navbar-nav">
      <form class="d-flex">
        <IssueSearch :with-title="false" />
      </form>
    </div>
  </nav>
  <div v-else>
    {{ $t("Chargement...") }}
  </div>
</template>

<script setup>
import { onMounted, watch } from "vue";

import { coa } from "../stores/coa";
import { collection } from "../stores/collection";
import { l10n } from "../stores/l10n";
import Country from "./Country";
import IssueSearch from "./IssueSearch";

let hasPublicationNames = $ref(false);
const totalPerCountry = $computed(() => collection().totalPerCountry);
const totalPerPublication = $computed(() => collection().totalPerPublication);
const countryNames = $computed(() => coa().countryNames);
const publicationNames = $computed(() => coa().publicationNames);
const sortedCountries = $computed(
  () =>
    totalPerCountry &&
    Object.keys(totalPerCountry).sort((countryCode1, countryCode2) =>
      countryNames[countryCode1].localeCompare(countryNames[countryCode2])
    )
);
const publicationsPerCountry = $computed(
  () =>
    totalPerCountry &&
    hasPublicationNames &&
    Object.keys(totalPerCountry).reduce(
      (acc, country) => ({
        ...acc,
        [country]: Object.keys(totalPerPublication).filter(
          (publicationCode) => publicationCode.split("/")[0] === country
        ),
      }),
      {}
    )
);
const { r } = l10n();
const fetchCountryNames = coa().fetchCountryNames;
const fetchPublicationNames = coa().fetchPublicationNames;
const getSortedPublications = (country) =>
  publicationsPerCountry?.[country].sort(
    (a, b) =>
      publicationNames[a] &&
      publicationNames[a].localeCompare(publicationNames[b])
  );

watch(
  () => totalPerPublication,
  async (newValue) => {
    if (newValue) {
      await fetchPublicationNames(Object.keys(newValue));
      hasPublicationNames = true;
    }
  },
  { immediate: true }
);

onMounted(async () => {
  await fetchCountryNames();
});
</script>

<style scoped lang="scss">
.navbar {
  padding: 0.5rem 1rem;

  &#publication-list {
    margin-bottom: 20px;
  }

  .navbar-toggler {
    margin-right: 1rem;
  }

  .navbar-brand {
    min-width: 120px;
  }

  .navbar-nav {
    flex-wrap: wrap;

    :deep(ul) {
      max-height: calc(100vh - 100px);
      z-index: 1030;
      overflow-y: auto;
    }
  }

  a {
    border: none;
  }
}
</style>
