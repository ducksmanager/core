<template>
  <div v-if="collection">
    <Menu
      :title="$t('Statistiques de ma collection')"
      :root-path="'/stats'"
      :default-path="'/general'"
      :items="[
        { path: '/general', text: $t('Général') },
        { path: '/publications', text: $t('Publications') },
        { path: '/possessions', text: $t('Possessions') },
        { path: '/conditions', text: $t('Etats des numéros') },
        { path: '/purchases', text: $t('Achats') },
        { path: '/authors', text: $t('Auteurs') },
      ]"
    />
    <b-alert v-if="!collection.length" variant="info">
      {{ $t("Vous ne possédez aucun numéro ! Cliquez") }}
      <a :href="$r('/collection/show')">{{ $t("ici") }}</a>
      {{ $t("pour en ajouter à votre collection !") }}
    </b-alert>
    <GeneralStats v-if="tab === 'general'" />
    <PublicationStats v-if="tab === 'publications'" />
    <ConditionStats
      v-else-if="tab === 'conditions'"
      :style="{ width: '500px' }"
    />
    <div v-else-if="tab === 'possessions' || tab === 'authors'">
      <b-button-group
        v-if="
          tab !== 'authors' ||
          (tab === 'authors' &&
            watchedAuthorsStoryCount &&
            Object.keys(watchedAuthorsStoryCount).length)
        "
      >
        <b-button
          v-for="(text, unitType) in unitTypes"
          :key="unitType"
          :pressed="unitTypeCurrent === unitType"
          @click="unitTypeCurrent = unitType"
        >
          {{ text }}
        </b-button>
      </b-button-group>
      <PossessionStats
        v-if="tab === 'possessions'"
        :unit="unitTypeCurrent"
        :style="{ width, height }"
        @change-dimension="changeDimension"
      />
      <div v-else-if="tab === 'authors' && watchedAuthors">
        <b-alert v-if="!watchedAuthors.length" show variant="warning">
          {{
            $t(
              "Aucun auteur surveillé. Ajoutez vos auteurs préférés ci-dessous pour savoir quel pourcentage de leurs histoires vous possédez."
            )
          }}
        </b-alert>
        <div v-else>
          <template v-if="!watchedAuthorsStoryCount">
            {{ $t("Chargement...") }}
          </template>
          <b-alert
            v-else-if="!Object.keys(watchedAuthorsStoryCount).length"
            show
          >
            {{
              $t(
                "Les calculs n'ont pas encore été effectués. Les statistiques sont générées quotidiennement, revenez demain !"
              )
            }}
          </b-alert>
          <div v-else>
            <AuthorStats
              :key="unitTypeCurrent"
              :unit="unitTypeCurrent"
              :watched-authors-story-count="watchedAuthorsStoryCount"
              :style="{ width, height }"
              @change-dimension="changeDimension"
            />
            {{ $t("Les statistiques sont mises à jour quotidiennement.") }}
          </div>
          <hr />
        </div>
        <AuthorList :watched-authors="watchedAuthors" />
      </div>
    </div>
    <div v-else-if="tab === 'purchases'">
      <b-alert variant="info">
        <div>
          {{
            $t(
              "Ce graphique vous permet de retracer l'évolution de votre collection dans le temps."
            )
          }}
        </div>
        <div
          v-html="
            $t(
              'A quel moment votre collection a-t-elle accueilli son 10<sup>ème</sup> numéro ? Son 50<sup>ème</sup> ?'
            )
          "
        />
        <div>
          {{
            $t("Quand avez-vous acheté le plus de magazines dans le passé ?")
          }}
        </div>
        <div
          v-html="
            $t(
              `Afin de retracer l'évolution de votre collection, renseignez les dates d'achat de vos numéros dans la page {0}, puis revenez ici ! Si une date d'achat n'a pas été indiquée pour un numéro, sa date d'ajout dans la collection est utilisée`,
              [
                `<a href='${$r('/collection/show')}'>${$t(
                  'Gérer ma collection'
                )}</a>`,
              ]
            )
          "
        />
        <div v-if="purchases && !purchases.length">
          <a :href="$r('/collection/show')">
            <img
              style="height: 300px"
              alt="demo"
              :src="`${imagePath}/demo_selection_achat_${locale}.png`"
            />
          </a>
        </div>
      </b-alert>
      <div v-if="purchases?.length">
        <b-button-group>
          <b-button
            v-for="(text, purchaseType) in purchaseTypes"
            :key="purchaseType"
            :pressed="purchaseTypeCurrent === purchaseType"
            @click="purchaseTypeCurrent = purchaseType"
          >
            {{ text }}
          </b-button>
        </b-button-group>
        <PurchaseStats
          v-show="purchaseTypeCurrent === 'new'"
          :style="{ width, height }"
          unit="new"
          @change-dimension="changeDimension"
        />
        <PurchaseStats
          v-show="purchaseTypeCurrent === 'total'"
          :style="{ width, height }"
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
import PurchaseStats from "./stats/PurchaseStats";
import AuthorStats from "./stats/AuthorStats";
import { mapActions, mapState } from "pinia";
import axios from "axios";
import AuthorList from "../components/AuthorList";
import ConditionStats from "./stats/ConditionStats";
import Menu from "./Menu";
import GeneralStats from "./stats/GeneralStats";
import { BAlert, BButton, BButtonGroup } from "bootstrap-vue-3";
const { collection: collectionStore } = require("../stores/collection");
import { l10n } from "../stores/l10n";
import { locale } from "../composables/global";

const currentLocale = locale();

export default {
  name: "Stats",
  components: {
    Menu,
    ConditionStats,
    GeneralStats,
    PublicationStats,
    PossessionStats,
    PurchaseStats,
    AuthorList,
    AuthorStats,
    BAlert,
    BButtonGroup,
    BButton,
  },
  props: {
    tab: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    width: null,
    height: null,
    unitTypeCurrent: "number",
    purchaseTypeCurrent: "new",

    watchedAuthorsStoryCount: null,
    locale: currentLocale,
  }),
  computed: {
    ...mapState(collectionStore, ["purchases", "watchedAuthors", "collection"]),
    unitTypes() {
      return {
        number: this.$t("Afficher en valeurs réelles"),
        percentage: this.$t("Afficher en pourcentages"),
      };
    },
    purchaseTypes() {
      return {
        new: this.$t("Afficher les nouvelles acquisitions"),
        total: this.$t("Afficher les possessions totales"),
      };
    },
  },

  async mounted() {
    switch (this.tab) {
      case "authors":
        await this.loadWatchedAuthors();
        this.watchedAuthorsStoryCount = (
          await axios.get("/api/collection/stats/watchedauthorsstorycount")
        ).data;
        if (!this.watchedAuthorsStoryCount) {
          this.watchedAuthorsStoryCount = {};
        }
        break;
      case "purchases":
        await this.loadPurchases();
        break;
    }
  },

  methods: {
    ...mapActions(l10n, ["$r"]),
    ...mapActions(collectionStore, ["loadWatchedAuthors", "loadPurchases"]),
    changeDimension(dimension, value) {
      this[dimension] = `${value}px`;
    },
  },
};
</script>

<style scoped lang="scss">
:deep(canvas) {
  background-color: white;
}

:deep(.btn) {
  &:focus {
    box-shadow: none !important;
  }
}
</style>
