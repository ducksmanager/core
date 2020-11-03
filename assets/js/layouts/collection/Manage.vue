<template>
  <div v-if="publicationcode === 'new'">
    {{ l10n.REMPLIR_INFOS_NOUVEAU_MAGAZINE }}
    <PublicationSelect />
    <br>
    <br>
    {{ l10n.RECHERCHER_INTRO }}
    <IssueSearch />
  </div>
  <div v-else-if="hasPublicationNames">
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
        <div><a :href="$r('/expand')">{{ l10n.SUGGESTIONS_SEE_ALL }}</a></div>
      </template>
    </Accordion>
    <LastPublishedEdges />
    <div
      v-if="username === 'demo'"
      id="demo-intro"
    >
      <h2>{{ l10n.PRESENTATION_DEMO_TITRE }}</h2>
      <span v-html="l10n.PRESENTATION_DEMO" /> {{ (60 - new Date().getMinutes()) || 60 }} {{ l10n.MINUTES }}
    </div>
    <div v-if="total > 0">
      {{ l10n.POSSESSION_MAGAZINES_INTRO }} {{ total }} {{ l10n.NUMEROS }}.<br>
      {{ l10n.POSSESSION_MAGAZINES_2 }} {{ Object.keys(totalPerPublication).length }} {{
        l10n.POSSESSION_MAGAZINES_3
      }}
      {{ Object.keys(totalPerCountry).length }} {{ l10n.PAYS }}.
      <br>{{ l10n.CLIQUEZ_SUR_MAGAZINE_POUR_EDITER }}<br><br>
    </div>
    <div v-else>
      {{ l10n.COLLECTION_VIDE_1 }}
      <br>
      {{ l10n.COLLECTION_CLIQUER_NOUVEAU_MAGAZINE }}
      <br>
      <br>
    </div>
    <PublicationList />
    <IssueList
      v-if="publicationcode || mostPossessedPublication"
      :publicationcode="publicationcode || mostPossessedPublication"
    />
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
import LastPublishedEdges from "../../components/LastPublishedEdges";

export default {
  name: "Manage",
  components: {
    LastPublishedEdges,
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
    suggestionsNumber: 0,
    hasPublicationNames: false
  }),
  computed: {
    ...mapState("coa", ["publicationNames"]),
    ...mapGetters("collection", ["total", "totalPerCountry", "totalPerPublication"]),

    mostPossessedPublication() {
      const vm = this
      return this.totalPerPublication && Object.keys(this.totalPerPublication).reduce((acc, publicationCode) => vm.totalPerPublication[acc] > vm.totalPerPublication[publicationCode] ? acc : publicationCode, null);
    }
  },

  watch: {
    async totalPerPublication(newValue) {
      if (newValue) {
        await this.fetchPublicationNames(Object.keys(newValue))
        this.hasPublicationNames = true
      }
    }
  },

  methods: {
    ...mapActions("coa", ["fetchPublicationNames"])
  }
}
</script>

<style scoped lang="scss">
@import "../../../css/app";
#demo-intro {
  border: 1px solid white;
  margin-bottom: 20px;
  padding: 5px 10px 10px 15px;

  h2 {
    text-align: center;
  }
}

#publication-list {
  top: 0;
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

@media (max-width: 767px) {
  #publication-list {
    top: $navbar-height;
  }
}
</style>