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
    <a class="navbar-brand" href="#">
      {{ $t("Collection") }}
    </a>
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
          </a>
          <ul class="dropdown-menu">
            <li
              v-for="publicationCode in getSortedPublications(country)"
              :key="publicationCode"
            >
              <a
                class="dropdown-item"
                :href="
                  $r(`/collection/show/{publicationCode:${publicationCode}}`)
                "
              >
                {{
                  publicationNames[publicationCode] ||
                  publicationCode.split("/")[1]
                }}
              </a>
            </li>
          </ul>
        </li>
        <li class="nav-item">
          <a
            class="nav-link"
            :href="$r('/collection/show/{publicationCode:new}')"
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
import Country from "./Country";
import IssueSearch from "./IssueSearch";
import { coa } from "../stores/coa";
import { collection } from "../stores/collection";
import { l10n } from "../stores/l10n";
import { computed, onMounted, watch } from "vue";

const hasPublicationNames = ref(false),
  totalPerCountry = computed(() => collection().totalPerCountry),
  totalPerPublication = computed(() => collection().totalPerPublication),
  countryNames = computed(() => coa().countryNames),
  publicationNames = computed(() => coa().publicationNames),
  sortedCountries = computed(
    () =>
      totalPerCountry.value &&
      Object.keys(totalPerCountry.value).sort((countryCode1, countryCode2) =>
        countryNames.value[countryCode1].localeCompare(
          countryNames.value[countryCode2]
        )
      )
  ),
  publicationsPerCountry = computed(() => {
    return (
      totalPerCountry.value &&
      hasPublicationNames.value &&
      Object.keys(totalPerCountry.value).reduce(
        (acc, country) => ({
          ...acc,
          [country]: Object.keys(totalPerPublication.value).filter(
            (publicationCode) => publicationCode.split("/")[0] === country
          ),
        }),
        {}
      )
    );
  }),
  r = l10n().$r,
  fetchCountryNames = coa().fetchCountryNames,
  fetchPublicationNames = coa().fetchPublicationNames,
  getSortedPublications = (country) =>
    publicationsPerCountry.value?.[country].sort(
      (a, b) =>
        publicationNames.value[a] &&
        publicationNames.value[a].localeCompare(publicationNames.value[b])
    );

watch(
  () => totalPerPublication.value,
  async (newValue) => {
    if (newValue) {
      await fetchPublicationNames(Object.keys(newValue));
      hasPublicationNames.value = true;
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
