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
    <div v-else-if="tab === 'possessions'">
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
      />
    </div>
  </div>
</template>

<script>
import PublicationStats from "./stats/PublicationStats";
import PossessionStats from "./stats/PossessionStats";
import collectionMixin from "../mixins/collectionMixin";
import l10nMixin from "../mixins/l10nMixin";
import {mapState} from "vuex";
import axios from "axios";

export default {
  name: "Stats",
  components: {
    PublicationStats,
    PossessionStats
  },
  mixins: [collectionMixin, l10nMixin],
  props: {
    tab: {
      type: String,
      required: true
    }
  },
  data: () => ({
    unitTypeCurrent: 'number',
    unitTypes: {number: 'AFFICHER_VALEURS_REELLES', percentage: 'AFFICHER_POURCENTAGES'}
  }),
  computed: {
    imagePath: () => window.imagePath,
    username: () => window.username,
    locale: () => window.locale
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