<template>
  <div v-if="total && countryNames">
    <div id="intro">
      {{ l10n.POSSESSION_MAGAZINES_INTRO }} {{ total }} {{ l10n.NUMEROS }}.<br>
      {{ l10n.POSSESSION_MAGAZINES_2 }} {{ Object.keys(totalPerPublication).length }} {{ l10n.POSSESSION_MAGAZINES_3 }}
      {{ Object.keys(totalPerCountry).length }} {{ l10n.PAYS }}.
      <br>{{ l10n.CLIQUEZ_SUR_MAGAZINE_POUR_EDITER }}<br><br>
    </div>
    <b-navbar
      toggleable="lg"
      type="dark"
      variant="dark"
      sticky
    >
      <b-navbar-brand href="#">
        {{ l10n.RECHERCHER_HISTOIRE }}
      </b-navbar-brand>
      <b-navbar-toggle target="nav-collapse" />
      <b-navbar-nav>
        <IssueSearch />
      </b-navbar-nav>
    </b-navbar>
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
          <b-nav-item href="#">
            {{ l10n.NOUVEAU_MAGAZINE }}
          </b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <IssueList :publicationcode="publicationcode" />
  </div>
</template>

<script>
import IssueList from "../components/IssueList";
import l10nMixin from "../mixins/l10nMixin";
import collectionMixin from "../mixins/collectionMixin";
import {mapGetters} from "vuex";
import Country from "../components/Country";
import IssueSearch from "../components/IssueSearch";

export default {
  name: "Manage",
  components: {
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
            [country]: Object.keys(vm.totalPerPublication).filter(publicationName =>
                publicationName.split('/')[0] === country
            )
          }), {})
    }
  },

  methods: {
    getSortedPublications(country) {
      const vm = this
      return this.publicationsPerCountry && this.publicationsPerCountry[country]
          .sort((a, b) =>
              vm.publicationNames[a] < vm.publicationNames[b] ? -1 : (vm.publicationNames[a] > vm.publicationNames[b] ? 1 : 0)
          )
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
  }

  a {
    border: none;
  }
}
</style>