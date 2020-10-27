<template>
  <div v-if="l10n">
    <div v-if="!hasSuggestions">
      {{ l10n.AUCUNE_SUGGESTION }}
    </div>
    <div
      v-for="{publicationcode, issuenumber, score, stories} in suggestions.issues"
      v-else
      :key="`${publicationcode} ${issuenumber}`"
    >
      <div :class="{suggestions: true, 'since-last-visit': sinceLastVisit}">
        <span
          :class="{issue: true, [`importance-${getImportance(score)}`]: true}"
          :title="`${l10n.SCORE} : ${score}`"
        ><b-icon-cash
           v-for="i in 4-getImportance(score)"
           :key="i"
         />
          <Issue
            :publicationcode="publicationcode"
            :publicationname="suggestions.publicationTitles[publicationcode]"
            :issuenumber="issuenumber"
          /></span>
        {{ l10n.NUMERO_CONTIENT }}
      </div>
      <StoryList
        :key="`${publicationcode} ${issuenumber}-stories`"
        :authors="suggestions.authors"
        :stories="stories"
        :story-details="suggestions.storyDetails"
      />
    </div>
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

  computed: {
    ...mapState("collection", ["suggestions"]),
    ...mapGetters("collection", ["hasSuggestions"]),
  },

  watch: {
    countrycode: {
      immediate: true,
      async handler(newValue) {
        console.log("countrycode : " + newValue)
        await this.loadSuggestions({
          countryCode: newValue,
          sinceLastVisit: this.sinceLastVisit,
        })
      }
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

    &.importance-1 {
      font-size: x-large;
    }

    &.importance-2 {
      font-size: large;
    }

    .bi {
      margin: 0 4px;
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