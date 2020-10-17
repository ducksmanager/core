<template>
  <span v-if="l10n">
    <b-dropdown
      class="search-type"
      :text="l10n[searchContexts[searchContext]]"
    >
      <b-dropdown-item
        v-for="(l10nKey, alternativeSearchContext) in searchContextsWithoutCurrent"
        :key="alternativeSearchContext"
        @click="searchContext=alternativeSearchContext;search = ''"
      >{{ l10n[l10nKey] }}</b-dropdown-item>
    </b-dropdown>
    <b-form-input
      v-model="search"
      list="search"
      :placeholder="searchContext === 'story' ? l10n.RECHERCHER_HISTOIRE : l10n.RECHERCHER_PUBLICATIONS"
    />
    <datalist
      v-if="searchResults.results"
      id="search"
    >
      <option v-if="!searchResults.results.length">
        {{ l10n.RECHERCHE_MAGAZINE_AUCUN_RESULTAT }}
      </option> 
      <option
        v-for="searchResult in searchResults.results"
        :key="searchResult.code"
        @click="selectSearchResult(searchResult)"
      >
        <span v-if="!isSearchByCode(search)">{{ searchResult.title }}</span>
        <Issue
          v-else-if="publicationNames && publicationNames[searchResult.publicationcode]"
          :publicationcode="searchResult.publicationcode"
          :publicationname="publicationNames[searchResult.publicationcode]"
          :issuenumber="searchResult.issuenumber"
          clickable
        />
      </option>
    </datalist>
  </span>
</template>
<script>
import axios from "axios";
import l10nMixin from "../mixins/l10nMixin";
import Issue from "./Issue";
import {mapActions, mapState} from "vuex";
import collectionMixin from "../mixins/collectionMixin";

export default {
  name: "IssueSearch",
  components: {Issue},
  mixins: [l10nMixin, collectionMixin],
  emits: ['scroll-to-issue'],

  data: () => ({
    search: '',
    searchResults: [],
    searchContext: 'story',
    searchContexts: {
      story: 'TITRE_HISTOIRE',
      storycode: 'CODE_HISTOIRE',
    }
  }),

  computed: {
    ...mapState("coa", ["publicationNames"]),
    searchContextsWithoutCurrent() {
      const vm = this
      return Object.keys(this.searchContexts).filter(searchContext => searchContext !== vm.searchContext)
        .reduce((acc, searchContext) => ({
          ...acc,
          [searchContext]: vm.searchContexts[searchContext]
        }), {})
    }
  },

  watch: {
    async search(newValue) {
      const vm = this
      if (newValue !== '') {
        if (this.isSearchByCode()) {
          this.searchResults = (await axios.get(`/api/coa/list/issues/withStoryVersionCode/${newValue.replace(/^code=/, '')}`)).data
          this.searchResults.results = this.searchResults.results.sort((issue1, issue2) =>
              !!vm.isInCollection(issue1) > !!vm.isInCollection(issue2) ? -1 : (!!vm.isInCollection(issue1) < !!vm.isInCollection(issue2) ? 1 : 0))
          await this.fetchPublicationNames(this.searchResults.results.map(({publicationcode}) => publicationcode))
        } else {
          this.searchResults = (await axios.post('/api/coa/stories/search', {keywords: newValue})).data
        }
      }
    }
  },

  methods: {
    ...mapActions("coa", ["fetchPublicationNames"]),
    isInCollection(issue) {
      return this.findInCollection(issue.publicationcode, issue.issuenumber)
    },
    isSearchByCode() {
      return this.searchContext === 'storycode'
    },
    selectSearchResult(searchResult) {
      if (this.isSearchByCode()) {
        this.$emit('scroll-to-issue', searchResult)
      } else {
        this.searchContext = 'storycode'
        this.search = searchResult.code
      }
    }
  }
}
</script>

<style scoped lang="scss">
.dropdown.search-type {
  position: absolute;
  width: 120px;

  + .form-control {
    padding-left: 135px;
  }
}

datalist {
  display: block;

  option {
    cursor: pointer;

    a {
      border: 0;
    }
  }
}
</style>