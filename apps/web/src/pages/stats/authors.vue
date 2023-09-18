<route lang="yaml">
alias: [/auteurs]
</route>

<template>
  <div v-if="watchedAuthors && chartData">
    <b-alert
      v-if="!watchedAuthors.length"
      :model-value="true"
      variant="warning"
    >
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
        :model-value="true"
      >
        {{
          $t(
            "Les calculs n'ont pas encore été effectués. Les statistiques sont générées quotidiennement, revenez demain !"
          )
        }}
      </b-alert>
      <div v-else>
        <b-button-group>
          <b-button
            v-for="(text, unitType) in unitTypes"
            :key="unitType"
            :pressed="unitTypeCurrent === unitType"
            @click="unitTypeCurrent = unitType"
          >
            {{ text }}
          </b-button>
        </b-button-group>
        <div class="wrapper">
          <bar
            :data="chartData"
            :options="options"
            :style="{ width, height }"
          />
        </div>
        <b-alert variant="info" :model-value="true" class="mt-3">
          {{ $t("Les statistiques sont mises à jour quotidiennement.") }}
        </b-alert>
      </div>
      <hr />
    </div>
    <AuthorList :watched-authors="watchedAuthors" />
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  ChartData,
  ChartOptions,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { watch } from "vue";
import { Bar } from "vue-chartjs";
import { useI18n } from "vue-i18n";

import { collection as collectionStore } from "~/stores/collection";
import { GET__collection__stats__watchedauthorsstorycount } from "~api-routes";
import { call } from "~axios-helper";

Chart.register(
  Legend,
  CategoryScale,
  BarElement,
  LinearScale,
  BarController,
  Tooltip,
  Title
);

const { t: $t } = useI18n();

const watchedAuthors = $computed(() => collectionStore().watchedAuthors);
const unitTypes = {
  number: $t("Afficher en valeurs réelles"),
  percentage: $t("Afficher en pourcentages"),
};

type WatchedAuthorsStoryCount = {
  [personcode: string]: {
    missingstorycount: number;
    storycount: number;
    fullname: string;
  };
};

let watchedAuthorsStoryCount = $ref(null as WatchedAuthorsStoryCount | null);
let unitTypeCurrent = $ref("number");
let width = $ref(null as string | null),
  height = $ref("300px" as string),
  chartData = $ref(null as ChartData<"bar", number[]> | null),
  options = $ref({} as ChartOptions<"bar">);

const labels = $computed(
  () =>
    watchedAuthorsStoryCount &&
    Object.values(watchedAuthorsStoryCount).map(
      ({ fullname: fullName }) => fullName
    )
);

const changeDimension = (dimension: "width", value: number) => {
  width = `${value}px`;
};

watch(
  () => labels && unitTypeCurrent,
  (newValue) => {
    if (newValue && watchedAuthorsStoryCount) {
      let ownedStories = Object.values(watchedAuthorsStoryCount).map(
        ({ storycount: storyCount, missingstorycount: missingStoryCount }) =>
          storyCount - missingStoryCount
      );
      let missingStories = Object.values(watchedAuthorsStoryCount).map(
        ({ missingstorycount: missingStoryCount }) => missingStoryCount
      );

      if (unitTypeCurrent === "percentage") {
        ownedStories = ownedStories.map((possessedCount, key) =>
          Math.round(
            possessedCount * (100 / (possessedCount + missingStories[key]))
          )
        );
        missingStories = ownedStories.map(
          (possessedCount) => 100 - possessedCount
        );
      }

      const values = [ownedStories, missingStories];

      changeDimension("width", 250 + 30 * labels!.length);
      chartData = {
        datasets: [
          {
            data: values[0],
            backgroundColor: "#FF8000",
            label: $t("Histoires possédées"),
          },
          {
            data: values[1],
            backgroundColor: "#04B404",
            label: $t("Histoires non possédées"),
          },
        ],
        labels: labels!,
      };
      options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            ticks: {
              autoSkip: false,
            },
          },
          y: {
            stacked: true,
          },
        },
        plugins: {
          title: {
            display: true,
            text: $t("Possession des histoires d'auteurs"),
          },
          tooltip: {
            enabled: true,
            callbacks: {
              title: ([tooltip]) => tooltip.label,
              label: ({ dataset, raw }) =>
                `${dataset.label}: ${raw}${
                  unitTypeCurrent === "percentage" ? "%" : ""
                }`,
            },
          },
        },
      };
    }
  },
  { immediate: true }
);

(async () => {
  await collectionStore().loadWatchedAuthors();
  watchedAuthorsStoryCount = ((
    await call(axios, new GET__collection__stats__watchedauthorsstorycount())
  ).data || {}) as WatchedAuthorsStoryCount;
})();
</script>

<style scoped lang="scss">
.btn-group + div {
  background: #ddd;
}
.wrapper {
  width: v-bind(width);
  height: v-bind(height);

  > div {
    max-width: 100%;
    max-height: 100%;
  }

  :deep(canvas) {
    max-width: 100% !important;
    max-height: 100% !important;
  }
}
</style>
