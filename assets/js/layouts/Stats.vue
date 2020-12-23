<template>
  <div v-if="collection && l10n">
    <Menu
      :title="l10n.STATISTIQUES_COLLECTION"
      :root-path="'/stats'"
      :default-path="'/publications'"
      :items="[
        {path: '/publications', text: l10n.PUBLICATIONS},
        {path: '/possessions', text: l10n.POSSESSIONS},
        {path: '/conditions', text: l10n.ETATS_NUMEROS},
        {path: '/purchases', text: l10n.ACHATS},
        {path: '/authors', text: l10n.AUTEURS}
      ]"
    />
    <b-alert
      v-if="!collection.length"
      variant="info"
    >
      {{ l10n.AUCUN_NUMERO_POSSEDE_1 }}
      <a :href="$r('/collection/show')">{{ l10n.ICI }}</a>
      {{ l10n.AUCUN_NUMERO_POSSEDE_2 }}
    </b-alert>
    <PublicationStats v-if="tab === 'publications'" />
    <ConditionStats
      v-else-if="tab === 'conditions'"
      :style="{width: '500px'}"
    />
    <div v-else-if="tab === 'possessions' || tab === 'authors'">
      <b-button-group v-if="tab !== 'authors' || (tab === 'authors' && watchedAuthorsStoryCount && Object.keys(watchedAuthorsStoryCount).length)">
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
          show
          variant="warning"
        >
          {{ l10n.AUCUN_AUTEUR_SURVEILLE }}
        </b-alert>
        <div v-else>
          <template v-if="!watchedAuthorsStoryCount">
            {{ l10n.CHARGEMENT }}
          </template>
          <b-alert v-else-if="!Object.keys(watchedAuthorsStoryCount).length">
            {{ l10n.CALCULS_PAS_ENCORE_FAITS }}
          </b-alert>
          <div v-else>
            <AuthorStats
              :key="unitTypeCurrent"
              :unit="unitTypeCurrent"
              :watched-authors-story-count="watchedAuthorsStoryCount"
              :style="{width, height}"
              @change-dimension="changeDimension"
            />
            {{ l10n.STATISTIQUES_QUOTIDIENNES }}
          </div>
          <hr>
        </div>
        <AuthorList :watched-authors="watchedAuthors" />
      </div>
    </div>
    <div v-else-if="tab === 'purchases'">
      <b-alert variant="info">
        <div>{{ l10n.EXPLICATION_GRAPH_ACHATS_1 }}</div>
        <div v-html="l10n.EXPLICATION_GRAPH_ACHATS_2" />
        <div>{{ l10n.EXPLICATION_GRAPH_ACHATS_3 }}</div>
        <div v-html="$t('EXPLICATION_GRAPH_ACHATS_4', [`<a href='${$r('/collection/show')}'>${l10n.GERER_COLLECTION}</a>`]) " />
        <div v-if="purchases && !purchases.length">
          <a :href="$r('/collection/show')">
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
          v-show="purchaseTypeCurrent === 'new'"
          :style="{width, height}"
          unit="new"
          @change-dimension="changeDimension"
        />
        <PurchaseStats
          v-show="purchaseTypeCurrent === 'total'"
          :style="{width, height}"
          unit="total"
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
import ConditionStats from "./stats/ConditionStats";
import Menu from "./Menu";

export default {
  name: "Stats",
  components: {
    Menu,
    ConditionStats,
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
::v-deep canvas {
  background-color: white;
}

::v-deep .btn {
  &:focus {
    box-shadow: none !important;
  }
}
</style>
