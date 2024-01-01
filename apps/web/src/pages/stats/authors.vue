<route lang="yaml">
alias: [/auteurs]
</route>

<template>
  <div v-if="ratings && chartData">
    <b-alert v-if="!ratings.length" :model-value="true" variant="warning">
      {{
        $t(
          "Aucun auteur surveillé. Ajoutez vos auteurs préférés ci-dessous pour savoir quel pourcentage de leurs histoires vous possédez.",
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
            "Les calculs n'ont pas encore été effectués. Les statistiques sont générées quotidiennement, revenez demain !",
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
    <AuthorList :ratings="ratings" />
  </div>
</template>

<script setup lang="ts">
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
import { Bar } from "vue-chartjs";

import {
  NamespaceEndpoint as StatsNamespaceEndpoint,
  Services as StatsServices,
} from "~services/stats/types";
import { EventReturnType } from "~services/types";

Chart.register(
  Legend,
  CategoryScale,
  BarElement,
  LinearScale,
  BarController,
  Tooltip,
  Title,
);

const { t: $t } = useI18n();

const { loadRatings } = stats();
const { ratings } = storeToRefs(stats());

const statsServices = useSocket<StatsServices>(StatsNamespaceEndpoint);

const unitTypes = {
  number: $t("Afficher en valeurs réelles"),
  percentage: $t("Afficher en pourcentages"),
};

let watchedAuthorsStoryCount = $ref(
  null as EventReturnType<StatsServices["getWatchedAuthorsStats"]> | null,
);
let unitTypeCurrent = $ref("number");
let width = $ref(null as string | null),
  height = $ref("300px" as string),
  chartData = $ref(null as ChartData<"bar", number[]> | null),
  options = $ref({} as ChartOptions<"bar">);

const labels = $computed(
  () =>
    watchedAuthorsStoryCount &&
    watchedAuthorsStoryCount.map(({ fullname: fullName }) => fullName),
);

const changeWidth = (value: number) => {
  width = `${value}px`;
};

watch(
  () => labels && unitTypeCurrent,
  (newValue) => {
    if (newValue && watchedAuthorsStoryCount) {
      let ownedStories = watchedAuthorsStoryCount.map(
        ({ storyCount, missingStoryCount }) => storyCount - missingStoryCount,
      );
      let missingStories = watchedAuthorsStoryCount.map(
        ({ missingStoryCount }) => missingStoryCount,
      );

      if (unitTypeCurrent === "percentage") {
        ownedStories = ownedStories.map((possessedCount, key) =>
          Math.round(
            possessedCount * (100 / (possessedCount + missingStories[key])),
          ),
        );
        missingStories = ownedStories.map(
          (possessedCount) => 100 - possessedCount,
        );
      }

      const values = [ownedStories, missingStories];

      changeWidth(250 + 30 * labels!.length);
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
  { immediate: true },
);

(async () => {
  await loadRatings();
  watchedAuthorsStoryCount = await statsServices("getWatchedAuthorsStats");
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
