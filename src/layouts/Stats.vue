<template>
  <div v-if="collection">
    <BAlert v-if="!collection.length" variant="info">
      {{ $t("Vous ne possédez aucun numéro ! Cliquez") }}
      <a :href="r('/collection/show')">{{ $t("ici") }}</a>
      {{ $t("pour en ajouter à votre collection !") }}
    </BAlert>
    <GeneralStats v-if="tab === 'general'" />
    <PublicationStats v-if="tab === 'publications'" />
    <ConditionStats
      v-else-if="tab === 'conditions'"
      :style="{ width: '500px' }"
    />
    <div v-else-if="tab === 'possessions' || tab === 'authors'">
      <BButtonGroup
        v-if="
          tab !== 'authors' ||
          (tab === 'authors' &&
            watchedAuthorsStoryCount &&
            Object.keys(watchedAuthorsStoryCount).length)
        "
      >
        <BButton
          v-for="(text, unitType) in unitTypes"
          :key="unitType"
          :pressed="unitTypeCurrent === unitType"
          @click="unitTypeCurrent = unitType"
        >
          {{ text }}
        </BButton>
      </BButtonGroup>
      <PossessionStats
        v-if="tab === 'possessions'"
        :unit="unitTypeCurrent"
        :style="{ width, height }"
        @change-dimension="changeDimension"
      />
      <div v-else-if="tab === 'authors' && watchedAuthors">
        <BAlert v-if="!watchedAuthors.length" show variant="warning">
          {{
            $t(
              "Aucun auteur surveillé. Ajoutez vos auteurs préférés ci-dessous pour savoir quel pourcentage de leurs histoires vous possédez."
            )
          }}
        </BAlert>
        <div v-else>
          <template v-if="!watchedAuthorsStoryCount">
            {{ $t("Chargement...") }}
          </template>
          <BAlert
            v-else-if="!Object.keys(watchedAuthorsStoryCount).length"
            show
          >
            {{
              $t(
                "Les calculs n'ont pas encore été effectués. Les statistiques sont générées quotidiennement, revenez demain !"
              )
            }}
          </BAlert>
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
      <BAlert variant="info" show>
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
      </BAlert>
      <div v-if="purchases">
        <BButtonGroup>
          <BButton
            v-for="(text, purchaseType) in purchaseTypes"
            :key="purchaseType"
            :pressed="purchaseTypeCurrent === purchaseType"
            @click="purchaseTypeCurrent = purchaseType"
          >
            {{ text }}
          </BButton>
        </BButtonGroup>
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
import { BAlert, BButton, BButtonGroup } from "bootstrap-vue-3";
import { defineAsyncComponent, onMounted } from "vue";
import { useI18n } from "vue-i18n";

import { collection as collectionStore } from "~/stores/collection";
import { l10n } from "~/stores/l10n";

const { tab } = defineProps({
  tab: {
    type: String,
    required: true,
  },
});
const { t: $t } = useI18n();
const component = $computed(() =>
  defineAsyncComponent(() => import(`./${tab}`))
);
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
  if (dimension === "width") width = `${value}px`;
  else height = `${value}px`;
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
        await collection().collectionApi.get("/collection/stats/watchedauthorsstorycount")
      ).data;
      if (!watchedAuthorsStoryCount) watchedAuthorsStoryCount = {};

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
