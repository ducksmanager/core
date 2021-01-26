<template>
  <div class="mt-4">
    <div v-if="loading">
      {{ l10n.CHARGEMENT }}
    </div>
    <div v-else-if="!hasSuggestions">
      {{ l10n.AUCUNE_SUGGESTION }}
    </div>
    <template v-else>
      <b-button-group>
        <b-button
          v-for="(l10nKey, suggestionSort) in suggestionSorts"
          :key="suggestionSort"
          :pressed="suggestionSortCurrent === suggestionSort"
          @click="suggestionSortCurrent = suggestionSort"
        >
          {{ l10n[l10nKey] }}
        </b-button>
      </b-button-group>
      <div
        v-for="{publicationcode, issuenumber, oldestdate, score, stories} in suggestions.issues"
        :key="`${publicationcode} ${issuenumber}`"
      >
        <div :class="{suggestions: true, 'since-last-visit': sinceLastVisit, 'pt-2': true}">
          <div
            class="d-flex align-items-center issue importance"
            :title="`${l10n.SCORE} : ${score}`"
          >
            <div class="mr-3 d-flex justify-content-center importance-bills">
              <b-icon-cash
                v-for="i in 4-getImportance(score)"
                :key="i"
              />
            </div>
            <div>
              <Issue
                :publicationcode="publicationcode"
                :publicationname="suggestions.publicationTitles[publicationcode]"
                :issuenumber="issuenumber"
                no-wrap
              >
                <template #title-suffix>
                  <div class="release-date mt-2">
                    {{ l10n.SORTIE }}{{ oldestdate }}
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
<script>
import {mapActions, mapGetters, mapState} from "vuex";
import l10nMixin from "../mixins/l10nMixin";
import Issue from "../components/Issue";
import StoryList from "../components/StoryList";

export default {
  name: 'SuggestionList',

  components: {
    StoryList,
    Issue
  },

  mixins: [l10nMixin],

  props: {
    countrycode: {
      type: String,
      default: null
    },
    sinceLastVisit: {
      type: Boolean,
      default: false
    }
  },

  data: () => ({
    loading: true,
    suggestionSortCurrent: 'score',
    suggestionSorts: {oldestdate: 'TRIER_PAR_DATE_SORTIE', score: 'TRIER_PAR_SCORE'},
  }),

  computed: {
    ...mapState("collection", ["suggestions"]),
    ...mapGetters("collection", ["hasSuggestions"]),
  },

  watch: {
    countrycode: {
      immediate: true,
      async handler(newValue) {
        this.loading = true
        await this.loadSuggestions({
          countryCode: newValue,
          sort: this.suggestionSortCurrent,
          sinceLastVisit: this.sinceLastVisit,
        })
        this.loading = false
      }
    },
    async suggestionSortCurrent(newValue) {
      this.loading = true
      await this.loadSuggestions({
        countryCode: this.countrycode,
        sort: newValue,
        sinceLastVisit: this.sinceLastVisit,
      })
      this.loading = false
    }
  },

  methods: {
    ...mapActions("collection", ["loadSuggestions"]),

    getImportance(score) {
      const {minScore, maxScore} = this.suggestions
      return maxScore === score ? 1 : (minScore === score ? 3 : 2)
    }
  }
}
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
