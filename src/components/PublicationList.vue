<template>
  <nav
    v-if="countryNames && hasPublicationNames"
    id="publication-list"
    class="navbar navbar-expand-lg navbar-dark bg-dark flex-row align-items-center position-sticky"
  >
    <button
      v-b-toggle="'nav-publications'"
      class="navbar-toggler"
      type="button"
    >
      <span class="navbar-toggler-icon" />
    </button>
    <a class="navbar-brand" href="#">
      {{ $t("Collection") }}
    </a>
    <b-collapse id="nav-publications" visible>
      <b-navbar-nav>
        <li
          v-for="country in sortedCountries"
          :key="country"
          class="nav-item dropdown"
        >
          <b-dropdown variant="outline-light">
            <template #button-content
              ><Country
                :country="country"
                :country-name="countryNames[country]"
            /></template>
            <b-dropdown-item
              v-for="publicationcode in getSortedPublications(country)"
              :key="publicationcode"
            >
              <router-link
                class="dropdown-item"
                :to="`/collection/show/${publicationcode}`"
              >
                {{
                  publicationNames[publicationcode] ||
                  publicationcode.split("/")[1]
                }}
              </router-link></b-dropdown-item
            ></b-dropdown
          >
        </li>
        <li class="nav-item">
          <router-link class="nav-link" :to="'/collection/show/new'">{{
            $t("Nouveau magazine")
          }}</router-link>
        </li>
      </b-navbar-nav>
    </b-collapse>
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

<script setup lang="ts">
import { watch } from "vue";

import { coa } from "~/stores/coa";
import { collection } from "~/stores/collection";

let hasPublicationNames = $ref(false as boolean);
const totalPerCountry = $computed(() => collection().totalPerCountry);
const totalPerPublication = $computed(() => collection().totalPerPublication);
const countryNames = $computed(() => coa().countryNames);
const publicationNames = $computed(() => coa().publicationNames);
const sortedCountries = $computed(
  () =>
    totalPerCountry &&
    countryNames &&
    Object.keys(totalPerCountry).sort(
      (countryCode1, countryCode2) =>
        countryNames[countryCode1]?.localeCompare(countryNames[countryCode2]) ||
        0
    )
);
const publicationsPerCountry = $computed(
  () =>
    totalPerCountry &&
    hasPublicationNames &&
    Object.keys(totalPerCountry).reduce(
      (acc, country) => ({
        ...acc,
        [country]: Object.keys(totalPerPublication!).filter(
          (publicationcode) => publicationcode.split("/")[0] === country
        ),
      }),
      {} as { [key: string]: string[] }
    )
);
const fetchCountryNames = coa().fetchCountryNames;
const fetchPublicationNames = coa().fetchPublicationNames;
const getSortedPublications = (country: string) =>
  publicationsPerCountry?.[country]?.sort((a, b) =>
    (publicationNames[a] || "").localeCompare(publicationNames[b] || "")
  ) || [];

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

fetchCountryNames();
</script>

<style scoped lang="scss">
:deep(button.dropdown-toggle) {
  border: 0;
}
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
