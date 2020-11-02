<template>
  <div v-if="publicationcode === 'new'">
    {{ l10n.REMPLIR_INFOS_NOUVEAU_MAGAZINE }}
    <PublicationSelect />
    <br>
    <br>
    {{ l10n.RECHERCHER_INTRO }}
    <IssueSearch />
  </div>
  <div v-else>
    <div v-if="total > 0 && countryNames">
      <Accordion
        v-if="suggestionsNumber"
        id="suggestions"
        accordion-group-id="suggestions"
      >
        <template #header>
          {{
            suggestionsNumber === 1 ? l10n.SUGGESTIONS_ACHATS_NOUVEAUTE : $t('SUGGESTIONS_ACHATS_NOUVEAUTES', suggestionsNumber)
          }}
        </template>
        <template #content>
          <SuggestionList
            countrycode="ALL"
            since-last-visit
            @has-suggestions-data="e => {suggestionsNumber = e}"
          />
        </template>
        <template #footer>
          <div><a href="/expand">{{ l10n.SUGGESTIONS_SEE_ALL }}</a></div>
        </template>
      </Accordion>
      <div>
        {{ l10n.POSSESSION_MAGAZINES_INTRO }} {{ total }} {{ l10n.NUMEROS }}.<br>
        {{ l10n.POSSESSION_MAGAZINES_2 }} {{ Object.keys(totalPerPublication).length }} {{
          l10n.POSSESSION_MAGAZINES_3
        }}
        {{ Object.keys(totalPerCountry).length }} {{ l10n.PAYS }}.
        <br>{{ l10n.CLIQUEZ_SUR_MAGAZINE_POUR_EDITER }}<br><br>
      </div>
      <PublicationList />
      <IssueList :publicationcode="publicationcode || mostPossessedPublication" />
    </div>
    <div v-else-if="total === 0">
      {{ l10n.COLLECTION_VIDE_1 }}
      <br>
      {{ l10n.COLLECTION_CLIQUER_NOUVEAU_MAGAZINE }}
      <br>
      <br>
    </div>
  </div>
</template>

<script>
import IssueList from "../../components/IssueList";
import l10nMixin from "../../mixins/l10nMixin";
import collectionMixin from "../../mixins/collectionMixin";
import {mapActions, mapGetters, mapState} from "vuex";
import IssueSearch from "../../components/IssueSearch";
import PublicationSelect from "../../components/PublicationSelect";
import SuggestionList from "../SuggestionList";
import Accordion from "../../components/Accordion";
import PublicationList from "../../components/PublicationList";

export default {
  name: "Manage",
  components: {
    PublicationList,
    Accordion,
    SuggestionList,
    PublicationSelect,
    IssueSearch,
    IssueList
  },
  mixins: [l10nMixin, collectionMixin],
  props: {
    publicationcode: {
      type: String,
      required: true
    }
  },
  data: () => ({
    suggestionsNumber: 0
  }),
  computed: {
    ...mapState("coa", ["countryNames", "publicationNames"]),
    ...mapGetters("collection", ["total", "totalPerCountry", "totalPerPublication"]),

    mostPossessedPublication() {
      const vm = this
      return this.totalPerPublication && Object.keys(this.totalPerPublication).reduce((acc, publicationCode) => vm.totalPerPublication[acc] > vm.totalPerPublication[publicationCode] ? acc : publicationCode);
    }
  },

  async mounted() {
    await this.fetchCountryNames()
  },

  methods: {
    ...mapActions("coa", ["fetchCountryNames", "fetchPublicationNames"])
  }
}
</script>

<style scoped lang="scss">
#publication-list {
  top: 38px;
  margin-bottom: 20px;
  z-index: 1;
}

.navbar {
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