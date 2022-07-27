<template>
  <div class="mt-4">
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
        } in suggestions.issues"
        :key="`${publicationcode} ${issuenumber}`"
      >
        <div
          :class="{
            suggestions: true,
            'since-last-visit': sinceLastVisit,
            'pt-2': true,
          }"
        >
          <div
            class="d-flex align-items-center issue importance"
            :title="`${$t('Score')} : ${score}`"
          >
            <div class="d-flex justify-content-center importance-bills">
              <b-icon-cash
                v-for="i in 4 - getImportance(score)"
                :key="i"
                class="me-1"
              />
            </div>
            <div>
              <Issue
                :publicationcode="publicationcode"
                :publicationname="
                  suggestions.publicationTitles[publicationcode]
                "
                :issuenumber="issuenumber"
                no-wrap
              >
                <template #title-suffix>
                  <div class="release-date mt-2 ms-1">
                    {{ $t("Sortie :") }} {{ oldestdate }}
                  </div>
                </template>
              </Issue>
            </div>
          </div>
        </div>
        <StoryList
          :key="`${publicationcode} ${issuenumber}-stories`"
          :authors="suggestions.authors"
          :stories="stories"
          :story-details="suggestions.storyDetails"
        />
      </div>
    </template>
  </div>
</template>
<script setup>
import { BIconCash } from "bootstrap-icons-vue";
import { BButton, BButtonGroup } from "bootstrap-vue-3";
import { watch } from "vue";
import { useI18n } from "vue-i18n";

import Issue from "../components/Issue";
import StoryList from "../components/StoryList";
import { collection } from "../stores/collection";

const { countrycode, sinceLastVisit } = defineProps({
  countrycode: {
    type: String,
    default: null,
  },
  sinceLastVisit: {
    type: Boolean,
    default: false,
  },
});
const { t: $t } = useI18n(),
  suggestions = $computed(() => collection().suggestions),
  hasSuggestions = $computed(() => collection().hasSuggestions),
  suggestionSorts = () => ({
    oldestdate: $t("Trier par date de parution"),
    score: $t("Trier par score"),
  }),
  loadSuggestions = collection().loadSuggestions,
  getImportance = (score) => {
    const { minScore, maxScore } = suggestions;
    return maxScore === score ? 1 : minScore === score ? 3 : 2;
  };

let loading = $ref(true),
  suggestionSortCurrent = $ref("score");

watch(
  () => countrycode,
  async (newValue) => {
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
