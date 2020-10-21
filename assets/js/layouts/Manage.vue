<template>
  <div v-if="publicationcode === 'new'">
    {{ l10n.REMPLIR_INFOS_NOUVEAU_MAGAZINE }}
    <PublicationSelect />
    <br>
    <br>
    {{ l10n.RECHERCHER_INTRO }}
    <IssueSearch />
  </div>
  <div v-else-if="total > 0 && countryNames">
    <div>
      {{ l10n.POSSESSION_MAGAZINES_INTRO }} {{ total }} {{ l10n.NUMEROS }}.<br>
      {{ l10n.POSSESSION_MAGAZINES_2 }} {{ Object.keys(totalPerPublication).length }} {{ l10n.POSSESSION_MAGAZINES_3 }}
      {{ Object.keys(totalPerCountry).length }} {{ l10n.PAYS }}.
      <br>{{ l10n.CLIQUEZ_SUR_MAGAZINE_POUR_EDITER }}<br><br>
    </div>
    <IssueSearch />
    <b-navbar
      id="publication-list"
      toggleable="lg"
      type="dark"
      variant="dark"
      sticky
    >
      <b-navbar-brand href="#">
        {{ l10n.LISTE_MAGAZINES }}
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
              {{ publicationNames[publicationCode] }}
            </b-dropdown-item>
          </b-nav-item-dropdown>
          <b-nav-item href="/collection/show/new">
            {{ l10n.NOUVEAU_MAGAZINE }}
          </b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <IssueList :publicationcode="publicationcode || mostPossessedPublication" />
  </div>
</template>

<script>
import IssueList from "../components/IssueList";
import l10nMixin from "../mixins/l10nMixin";
import collectionMixin from "../mixins/collectionMixin";
import {mapActions, mapGetters} from "vuex";
import Country from "../components/Country";
import IssueSearch from "../components/IssueSearch";
import PublicationSelect from "../components/PublicationSelect";
import SuggestionList from "./SuggestionList";
import Accordion from "../components/Accordion";

export default {
  name: "Manage",
  components: {
    Accordion,
    SuggestionList,
    PublicationSelect,
    IssueSearch,
    Country,
    IssueList
  },
  mixins: [l10nMixin, collectionMixin],
  props: {
    publicationcode: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapGetters("collection", ["total", "totalPerCountry", "totalPerPublication"]),
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

    mostPossessedPublication() {
      const vm = this
      return this.totalPerPublication && Object.keys(this.totalPerPublication).reduce((acc, publicationCode) => vm.totalPerPublication[acc] > vm.totalPerPublication[publicationCode] ? acc : publicationCode);
    }
  },

  watch: {
    async totalPerPublication(newValue) {
      if (newValue) {
        await this.fetchPublicationNames(Object.keys(newValue))
      }
    }
  },

  async mounted(){
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
#publication-list {
  top: 38px;
  margin-top: 30px;
  z-index: 1;
}
.navbar {
  border-radius: 4px;
  margin: 20px 0;

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