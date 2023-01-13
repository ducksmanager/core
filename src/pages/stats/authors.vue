<route lang="yaml">
alias: [/auteurs]
</route>

<template>
  <div v-if="watchedAuthors && chartData">
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
        <bar
          :chart-data="chartData"
          :chart-options="options"
          :style="{ width, height }"
        />
        {{ $t("Les statistiques sont mises à jour quotidiennement.") }}
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
import routes from "~types/routes";

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
  height = $ref(null as string | null),
  chartData = $ref(null as ChartData<"bar", number[]> | null),
  options = $ref({} as ChartOptions<"bar">);

const labels = $computed(
  () =>
    watchedAuthorsStoryCount &&
    Object.values(watchedAuthorsStoryCount).map(
      ({ fullname: fullName }) => fullName
    )
);

const changeDimension = (dimension: "width" | "height", value: number) => {
  if (dimension === "width") width = `${value}px`;
  else height = `${value}px`;
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

onMounted(async () => {
  await collectionStore().loadWatchedAuthors();
  watchedAuthorsStoryCount = ((
    await routes["GET /collection/stats/watchedauthorsstorycount"](axios)
  ).data || {}) as WatchedAuthorsStoryCount;
});
</script>

<style scoped lang="scss">
.btn-group + div {
  background: #ddd;
}
</style>
