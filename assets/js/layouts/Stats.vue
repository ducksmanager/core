<template>
  <div v-if="collection && l10n">
    <b-alert
      v-if="!collection.length"
      variant="info"
    >
      {{ l10n.AUCUN_NUMERO_POSSEDE_1 }}
      <a href="/collection/show">{{ l10n.ICI }}</a>
      {{ l10n.AUCUN_NUMERO_POSSEDE_2 }}
    </b-alert>
    <PublicationStats v-if="tab === 'publications'" />
    <div v-else-if="tab === 'possessions' || tab === 'authors'">
      <b-button-group>
        <b-button
          v-for="(l10nKey, unitType) in unitTypes"
          :key="unitType"
          :pressed="unitTypeCurrent === unitType"
          @click="unitTypeCurrent = unitType"
        >
          {{ l10n[l10nKey] }}
        </b-button>
      </b-button-group>
      <PossessionStats
        v-if="tab === 'possessions'"
        :unit="unitTypeCurrent"
        :style="{width, height}"
        @change-dimension="changeDimension"
      />
      <div v-else-if="tab === 'authors' && watchedAuthors">
        <b-alert
          v-if="!watchedAuthors.length"
          variant="warning"
        >
          {{ l10n.AUCUN_AUTEUR_SURVEILLE }}
        </b-alert>
        <div v-else>
          <b-alert v-if="watchedAuthorsStoryCount === {}">
            {{ l10n.CALCULS_PAS_ENCORE_FAITS }}
          </b-alert>
          <AuthorStats
            v-else
            :unit="unitTypeCurrent"
            :watched-authors-story-count="watchedAuthorsStoryCount"
            :style="{width, height}"
            @change-dimension="changeDimension"
          />
          {{ l10n.STATISTIQUES_QUOTIDIENNES }}
          <hr>
          {{ l10n.AUTEURS_FAVORIS_INTRO_1 }}
          <a href="?action=agrandir&onglet=suggestions_achat">{{ l10n.AUTEURS_FAVORIS_INTRO_2 }}</a>
          <AuthorList
            :watched-authors="watchedAuthors"
          />
        </div>
      </div>
    </div>
    <div v-else-if="tab === 'purchases'">
      <b-alert variant="info">
        <div>{{ l10n.EXPLICATION_GRAPH_ACHATS_1 }}</div>
        <div v-html="l10n.EXPLICATION_GRAPH_ACHATS_2" />
        <div>{{ l10n.EXPLICATION_GRAPH_ACHATS_3 }}</div>
        <div v-html="$t('EXPLICATION_GRAPH_ACHATS_4', [`<a href='/collection/show'>${l10n.GERER_COLLECTION}</a>`]) " />
        <div v-if="purchases && !purchases.length">
          <a href="/?action=gerer">
            <img
              style="height: 300px"
              alt="demo"
              :src="`${imagePath}/demo_selection_achat_${locale}.png`"
            >
          </a>
        </div>
      </b-alert>
      <div v-if="purchases && purchases.length">
        <b-button-group>
          <b-button
            v-for="(l10nKey, purchaseType) in purchaseTypes"
            :key="purchaseType"
            :pressed="purchaseTypeCurrent === purchaseType"
            @click="purchaseTypeCurrent = purchaseType"
          >
            {{ l10n[l10nKey] }}
          </b-button>
        </b-button-group>
        <PurchaseStats
          :style="{width, height}"
          :unit="purchaseTypeCurrent"
          @change-dimension="changeDimension"
        />
      </div>
    </div>
  </div>
</template>

<script>
import PublicationStats from "./stats/PublicationStats";
import PossessionStats from "./stats/PossessionStats";
import collectionMixin from "../mixins/collectionMixin";
import PurchaseStats from "./stats/PurchaseStats";
import AuthorStats from "./stats/AuthorStats";
import l10nMixin from "../mixins/l10nMixin";
import {mapActions, mapState} from "vuex";
import axios from "axios";
import AuthorList from "../components/AuthorList";

export default {
  name: "Stats",
  components: {
    PublicationStats,
    PossessionStats,
    PurchaseStats,
    AuthorList,
    AuthorStats
  },
  mixins: [collectionMixin, l10nMixin],
  props: {
    tab: {
      type: String,
      required: true
    }
  },
  data: () => ({
    width: null,
    height: null,
    unitTypeCurrent: 'number',
    unitTypes: {number: 'AFFICHER_VALEURS_REELLES', percentage: 'AFFICHER_POURCENTAGES'},
    purchaseTypeCurrent: 'new',
    purchaseTypes: {new: 'AFFICHER_NOUVELLES_ACQUISITIONS', total: 'AFFICHER_POSSESSIONS_TOTALES'},

    watchedAuthorsStoryCount: null
  }),
  computed: {
    ...mapState("collection", ["purchases", "watchedAuthors"]),
    imagePath: () => window.imagePath,
    username: () => window.username,
    locale: () => window.locale
  },

  async mounted() {
    switch (this.tab) {
      case 'authors':
        await this.loadWatchedAuthors()
        this.watchedAuthorsStoryCount = (await axios.get('/api/collection/stats/watchedauthorsstorycount')).data
        if (!this.watchedAuthorsStoryCount) {
          this.watchedAuthorsStoryCount = {}
        }
        break;
      case 'purchases':
        await this.loadPurchases()
        break;
    }
  },

  methods: {
    ...mapActions("collection", ["loadWatchedAuthors", "loadPurchases"]),
    changeDimension(dimension, value) {
      this[dimension] = `${value}px`
    }
  }
}
</script>

<style scoped lang="scss">
#logo_zone1 {
  display: flex;
  align-items: center;
  flex-direction: column;
  background-color: rgb(200, 137, 100) !important;
  height: 180px;

  a {
    position: absolute;
    border-bottom: none;

    &:hover {
      border-bottom: 0 !important;
    }
  }
}

@media (max-width: 767px) {
  #logo_zone1 {
    display: none;
  }
}
</style>