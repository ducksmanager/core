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
    <a
      class="navbar-brand"
      href="#"
    >
      {{ $t('Collection') }}
    </a>
    <div
      id="nav-publications"
      class="collapse navbar-collapse"
    >
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
            <Country
              :country="country"
              :country-name="countryNames[country]"
            >
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
                :href="$r(`/collection/show/{publicationCode:${publicationCode}}`)"
              >
                {{ publicationNames[publicationCode] || publicationCode.split('/')[1] }}
              </a>
            </li>
          </ul>
        </li>
        <li class="nav-item">
          <a
            class="nav-link"
            :href="$r('/collection/show/{publicationCode:new}')"
          >{{ $t('Nouveau magazine') }}</a>
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
    {{ $t('Chargement...') }}
  </div>
</template>

<script>
import Country from "./Country";
import {mapActions, mapState} from "pinia";
import IssueSearch from "./IssueSearch";
import { coa } from "../stores/coa";
import { collection } from "../stores/collection";
import {mapActions} from "pinia";
import { l10n } from "../stores/l10n";

export default {
  name: "PublicationList",

  components: {
    IssueSearch,
    Country
  },


  data: () => ({
    hasPublicationNames: false
  }),

  computed: {
    ...mapState(collection, ["totalPerCountry", "totalPerPublication"]),
    ...mapState(coa, ["countryNames", "publicationNames"]),
    sortedCountries() {
      const vm = this
      return this.totalPerCountry && Object.keys(this.totalPerCountry)
          .sort((countryCode1, countryCode2) => vm.countryNames[countryCode1].localeCompare(vm.countryNames[countryCode2]))
    },
    publicationsPerCountry() {
      const vm = this
      return this.totalPerCountry && this.hasPublicationNames && Object.keys(this.totalPerCountry)
        .reduce((acc, country) => ({
          ...acc,
          [country]: Object.keys(vm.totalPerPublication).filter(publicationCode =>
            publicationCode.split('/')[0] === country
          )
        }), {})
    },
  },

  watch: {
    totalPerPublication: {
      immediate: true,
      async handler(newValue) {
        if (newValue) {
          await this.fetchPublicationNames(Object.keys(newValue))
          this.hasPublicationNames = true
        }
      }
    }
  },

  async mounted() {
    await this.fetchCountryNames()
  },

  methods: {
    ...mapActions(l10n, ["$r"]),
    ...mapActions(coa, ["fetchCountryNames", "fetchPublicationNames"]),
    getSortedPublications(country) {
      const vm = this
      return this.publicationsPerCountry && this.publicationsPerCountry[country]
        .sort((a, b) => vm.publicationNames[a] && vm.publicationNames[a].localeCompare(vm.publicationNames[b]))
    }
  }
}
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
