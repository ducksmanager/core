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
      <a :href="r('/collection/show')">{{ $t("ici") }}</a>
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
                `<a href='${r('/collection/show')}'>${$t(
                  'Gérer ma collection'
                )}</a>`,
              ]
            )
          "
        />
        <div v-if="purchases && !purchases.length">
          <a :href="r('/collection/show')">
            <img
              style="height: 300px"
              alt="demo"
              :src="`${imagePath}/demo_selection_achat_${currentLocale}.png`"
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

<script setup>
import axios from "axios";
import { BAlert, BButton, BButtonGroup } from "bootstrap-vue-3";
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";

import AuthorList from "../components/AuthorList";
import { locale } from "../composables/global";
import { imagePath } from "../composables/imagePath";
import { collection as collectionStore } from "../stores/collection";
import { l10n } from "../stores/l10n";
import Menu from "./Menu";
import AuthorStats from "./stats/AuthorStats";
import ConditionStats from "./stats/ConditionStats";
import GeneralStats from "./stats/GeneralStats";
import PossessionStats from "./stats/PossessionStats";
import PublicationStats from "./stats/PublicationStats";
import PurchaseStats from "./stats/PurchaseStats";

const { tab } = defineProps({
  tab: {
    type: String,
    required: true,
  },
});
const { t: $t } = useI18n();
const currentLocale = locale();
const purchases = $computed(() => collectionStore().purchases);
const watchedAuthors = $computed(() => collectionStore().watchedAuthors);
const collection = $computed(() => collectionStore().collection);
const unitTypes = {
  number: $t("Afficher en valeurs réelles"),
  percentage: $t("Afficher en pourcentages"),
};
const purchaseTypes = {
  new: $t("Afficher les nouvelles acquisitions"),
  total: $t("Afficher les possessions totales"),
};
const { r } = l10n();
const changeDimension = (dimension, value) => {
  if (dimension === "width") {
    width = `${value}px`;
  } else {
    height = `${value}px`;
  }
};

let width = $ref(null);
let height = $ref(null);
const unitTypeCurrent = $ref("number");
const purchaseTypeCurrent = $ref("new");
let watchedAuthorsStoryCount = $ref(null);

onMounted(async () => {
  await collectionStore().loadCollection();
  switch (tab) {
    case "authors":
      await collectionStore().loadWatchedAuthors();
      watchedAuthorsStoryCount = (
        await axios.get("/api/collection/stats/watchedauthorsstorycount")
      ).data;
      if (!watchedAuthorsStoryCount) {
        watchedAuthorsStoryCount = {};
      }
      break;
    case "purchases":
      await collectionStore().loadPurchases();
      break;
  }
});
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
