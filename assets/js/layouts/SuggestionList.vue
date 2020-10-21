<template>
  <div v-if="l10n">
    <div v-if="!hasSuggestion">
      {{ l10n.AUCUNE_SUGGESTION }}
    </div>
    <template
      v-for="{publicationcode, issuenumber, score, stories, storyDetails} in suggestions.issues"
      v-else
    >
      <div
        :key="`${publicationcode} ${issuenumber}`"
        :class="{suggestions: true, 'since-last-visit': true}"
      >
        <span
          :class="{issue: true, [`importance-${getImportance(score)}`]: true}"
        ><Issue
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
        :story-details="storyDetails"
      />
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

  computed: {
    ...mapState("collection", ["suggestions"]),
    ...mapGetters("collection", ["hasSuggestions"]),
  },

  async mounted() {
    await this.loadSuggestions({
      countryCode: this.countrycode,
      sinceLastVisit: this.sinceLastVisit,
    })
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
      font-size: xx-large;
    }

    &.importance-2 {
      font-size: x-large;
    }

    &.importance-3 {
      font-size: large;
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