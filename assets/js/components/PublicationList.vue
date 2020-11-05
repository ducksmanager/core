<template>
  <b-navbar
    v-if="countryNames && publicationNames"
    id="publication-list"
    toggleable="lg"
    type="dark"
    variant="dark"
    sticky
  >
    <b-navbar-brand href="#">
      {{ l10n.COLLECTION }}
    </b-navbar-brand>
    <b-navbar-toggle target="nav-publications" />
    <b-collapse
      id="nav-publications"
      is-nav
    >
      <b-navbar-nav>
        <b-nav-item-dropdown
          v-for="country in Object.keys(totalPerCountry)"
          :key="country"
          :text="country"
        >
          <template #button-content>
            <Country
              :country="country"
              :country-name="countryNames[country]"
            >
              <template #default="props">
                {{ props.countryName }}
              </template>
            </Country>
          </template>
          <b-dropdown-item
            v-for="publicationCode in getSortedPublications(country)"
            :key="publicationCode"
            :href="`/collection/show/${publicationCode}`"
          >
            {{ publicationNames[publicationCode] || publicationCode.split('/')[1] }}
          </b-dropdown-item>
        </b-nav-item-dropdown>
        <b-nav-item href="/collection/show/new">
          {{ l10n.NOUVEAU_MAGAZINE }}
        </b-nav-item>
      </b-navbar-nav>
    </b-collapse>
    <b-navbar-nav class="ml-auto">
      <b-nav-form>
        <IssueSearch :with-title="false" />
      </b-nav-form>
    </b-navbar-nav>
  </b-navbar>
  <div v-else>
    {{ l10n.CHARGEMENT }}
  </div>
</template>

<script>
import Country from "./Country";
import l10nMixin from "../mixins/l10nMixin";
import {mapActions, mapGetters, mapState} from "vuex";
import IssueSearch from "./IssueSearch";

export default {
  name: "PublicationList",

  components: {
    IssueSearch,
    Country
  },

  mixins: [l10nMixin],

  computed: {
    ...mapGetters("collection", ["totalPerCountry", "totalPerPublication"]),
    ...mapState("coa", ["countryNames", "publicationNames"]),
    publicationsPerCountry() {
      const vm = this
      return this.totalPerCountry && this.publicationNames && Object.keys(this.totalPerCountry)
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
        }
      }
    }
  },

  async mounted() {
    await this.fetchCountryNames()
  },

  methods: {
    ...mapActions("coa", ["fetchCountryNames", "fetchPublicationNames"]),
    getSortedPublications(country) {
      const vm = this
      return this.publicationsPerCountry && this.publicationsPerCountry[country]
        .sort((a, b) => Math.sign(vm.publicationNames[a] - vm.publicationNames[b]))
    }
  }
}
</script>

<style scoped lang="scss">
.navbar {
  &#publication-list {
    margin-bottom: 20px;
  }

  .navbar-brand {
    min-width: 120px;
  }

  .navbar-nav {
    flex-wrap: wrap;

    .navbar-nav {
      max-height: 200px;
      overflow-y: auto;
    }
  }

  a {
    border: none;
  }
}
</style>