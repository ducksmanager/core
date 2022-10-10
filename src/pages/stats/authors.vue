<route lang="yaml">
alias: [/auteurs]
</route>

<template>
  <div v-if="watchedAuthors">
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
      <BAlert v-else-if="!Object.keys(watchedAuthorsStoryCount).length" show>
        {{
          $t(
            "Les calculs n'ont pas encore été effectués. Les statistiques sont générées quotidiennement, revenez demain !"
          )
        }}
      </BAlert>
      <div v-else>
        <BButtonGroup>
          <BButton
            v-for="(text, unitType) in unitTypes"
            :key="unitType"
            :pressed="unitTypeCurrent === unitType"
            @click="unitTypeCurrent = unitType"
          >
            {{ text }}
          </BButton>
        </BButtonGroup>
        <BarChart
          :chart-data="chartData"
          :options="options"
          :style="{ width, height }"
        />
        {{ $t("Les statistiques sont mises à jour quotidiennement.") }}
      </div>
      <hr />
    </div>
    <AuthorList :watched-authors="watchedAuthors" />
  </div>
</template>

<script setup>
import axios from "axios";
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { watch } from "vue";
import { BarChart } from "vue-chart-3";
import { useI18n } from "vue-i18n";

import { collection as collectionStore } from "~/stores/collection";

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

let watchedAuthorsStoryCount = $ref(null);
let unitTypeCurrent = $ref("number");
let width = $ref(null),
  height = $ref(null),
  chartData = $ref(null),
  options = $ref({});

const labels = $computed(
  () =>
    watchedAuthorsStoryCount &&
    Object.values(watchedAuthorsStoryCount).map(
      ({ fullname: fullName }) => fullName
    )
);

const changeDimension = (dimension, value) => {
  if (dimension === "width") width = `${value}px`;
  else height = `${value}px`;
};

watch(
  () => labels && unitTypeCurrent,
  (newValue) => {
    if (newValue) {
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
      console.log(values);

      changeDimension("width", 250 + 30 * labels.length);
      chartData = {
        datasets: [
          {
            data: values[0],
            backgroundColor: "#FF8000",
            label: $t("Histoires possédées"),
            legend: $t("Histoires possédées"),
          },
          {
            data: values[1],
            backgroundColor: "#04B404",
            label: $t("Histoires non possédées"),
            legend: $t("Histoires non possédées"),
          },
        ],
        labels,
        legends: [$t("Histoires possédées"), $t("Histoires non possédées")],
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

onMounted(async () => {
  await collectionStore().loadWatchedAuthors();
  watchedAuthorsStoryCount = (
    await axios.get("/collection/stats/watchedauthorsstorycount")
  ).data;
  if (!watchedAuthorsStoryCount) watchedAuthorsStoryCount = {};
});
</script>

<style scoped lang="scss">
.btn-group + div {
  background: #ddd;
}
</style>
