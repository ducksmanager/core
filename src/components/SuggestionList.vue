<template>
  <div v-if="loading">
    {{ $t("Chargement...") }}
  </div>
  <div v-else-if="!hasSuggestions">
    {{
      $t(
        "Vous possédez toutes les publications contenant des histoires de vos auteurs favoris pour le pays sélectionné."
      )
    }}
  </div>
  <template v-else>
    <b-button-group>
      <b-button
        v-for="(suggestionText, suggestionSort) in suggestionSorts"
        :key="suggestionSort"
        :pressed="suggestionSortCurrent === suggestionSort"
        @click="suggestionSortCurrent = suggestionSort"
      >
        {{ suggestionText }}
      </b-button>
    </b-button-group>
    <div
      v-for="{
        publicationcode,
        issuenumber,
        oldestdate,
        score,
        stories,
      } in suggestions!.issues"
      :key="`${publicationcode} ${issuenumber}`"
    >
      <div
        class="suggestions pt-2"
        :class="{
          'since-last-visit': sinceLastVisit,
        }"
      >
        <div
          class="d-flex align-items-center issue importance"
          :title="`${$t('Score')} : ${score}`"
        >
          <div class="d-flex justify-content-center importance-bills">
            <i-bi-cash
              v-for="i in 4 - getImportance(score)"
              :key="i"
              class="me-1"
            />
          </div>
          <div>
            <Issue
              :publicationcode="publicationcode"
              :publicationname="suggestions!.publicationTitles[publicationcode]!"
              :issuenumber="issuenumber"
              no-wrap
            >
              <template #title-suffix>
                <div
                  v-if="oldestdate.split('T')?.[0]"
                  class="release-date mt-2 ms-1"
                >
                  {{ $t("Sortie :") }} {{ oldestdate.split("T")[0] }}
                </div>
              </template>
            </Issue>
          </div>
        </div>
      </div>
      <StoryList
        :key="`${publicationcode} ${issuenumber}-stories`"
        :authors="suggestions!.authors"
        :stories="stories"
        :story-details="suggestions!.storyDetails"
      />
    </div>
  </template>
</template>

<script setup lang="ts">
import { BButton, BButtonGroup } from "bootstrap-vue-next";
import { watch } from "vue";
import { useI18n } from "vue-i18n";

import { collection } from "~/stores/collection";

const { countrycode = null, sinceLastVisit = false } = defineProps<{
  countrycode?: string;
  sinceLastVisit?: boolean;
}>();
const { t: $t } = useI18n();
const suggestions = $computed(() => collection().suggestions);
const hasSuggestions = $computed(() => collection().hasSuggestions);
const suggestionSorts = () => ({
  oldestdate: $t("Trier par date de parution"),
  score: $t("Trier par score"),
});
const loadSuggestions = collection().loadSuggestions;
const getImportance = (score: number) =>
  suggestions?.maxScore === score ? 1 : suggestions?.minScore === score ? 3 : 2;

let loading = $ref(true);
const suggestionSortCurrent = $ref("score");

watch(
  () => countrycode,
  async (newValue) => {
    if (!newValue) {
      return;
    }
    loading = true;
    await loadSuggestions({
      countryCode: newValue,
      sort: suggestionSortCurrent,
      sinceLastVisit,
    });
    loading = false;
  },
  { immediate: true }
);
watch(
  () => suggestionSortCurrent,
  async (newValue) => {
    if (!countrycode) {
      return;
    }
    loading = true;
    await loadSuggestions({
      countryCode: countrycode,
      sort: newValue,
      sinceLastVisit,
    });
    loading = false;
  }
);
</script>

<style scoped lang="scss">
select {
  width: 300px;
}

.suggestions {
  .issue {
    display: inline-block;
    margin: 20px 0 10px 0;

    &.importance {
      font-size: large;
    }

    .importance-bills {
      width: 80px;

      .bi {
        margin: 0 4px;
      }
    }

    .release-date {
      font-size: 12px;
    }
  }

  &.since-last-visit {
    font-size: initial !important;
    margin: 10px 0 !important;

    .issue {
      font-size: initial;
    }
  }
}
</style>
