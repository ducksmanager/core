<template>
  <div v-if="loading">
    {{ $t("Chargement...") }}
  </div>
  <div v-else-if="!hasSuggestions">
    {{
      $t(
        "Vous possédez toutes les publications contenant des histoires de vos auteurs favoris pour le pays sélectionné.",
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
      } in sortedSuggestions!.issues"
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
            <i-bi-fire
              v-for="i in 4 - getImportance(score)"
              :key="i"
              class="me-1"
            />
          </div>
          <div>
            <Issue
              :publicationcode="publicationcode"
              :publicationname="
                sortedSuggestions!.publicationTitles[publicationcode]!
              "
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
        :authors="sortedSuggestions!.authors"
        :stories="stories"
        :story-details="sortedSuggestions!.storyDetails"
      />
    </div>
  </template>
</template>

<script setup lang="ts">
const { countrycode = null, sinceLastVisit = false } = defineProps<{
  countrycode?: string;
  sinceLastVisit?: boolean;
}>();
const { t: $t } = useI18n();
const { loadSuggestions } = collection();
const { suggestions, hasSuggestions } = storeToRefs(collection());
const suggestionSorts = () => ({
  oldestdate: $t("Trier par date de parution"),
  score: $t("Trier par score"),
});

const sortedSuggestions = computed(
  () => suggestions.value![suggestionSortCurrent.value],
);

const getImportance = (score: number) =>
  sortedSuggestions.value?.maxScore === score
    ? 1
    : sortedSuggestions.value?.minScore === score
      ? 3
      : 2;

let loading = $ref(true);
const suggestionSortCurrent = ref("score" as "score" | "oldestdate");

watch(
  $$(countrycode),
  async (newValue) => {
    if (!newValue) {
      return;
    }
    loading = true;
    await loadSuggestions({
      countryCode: newValue,
      sinceLastVisit,
    });
    loading = false;
  },
  { immediate: true },
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
