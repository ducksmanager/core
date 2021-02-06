<template>
  <b-navbar
    toggleable="lg"
    type="dark"
    variant="dark"
    sticky
  >
    <b-navbar-brand v-if="withTitle">
      {{ $t('Rechercher une histoire') }}
    </b-navbar-brand>
    <b-navbar-nav>
      <b-dropdown
        class="search-type"
        :text="searchContexts[searchContext]"
      >
        <b-dropdown-item
          v-for="(l10nKey, alternativeSearchContext) in searchContextsWithoutCurrent"
          :key="alternativeSearchContext"
          @click="searchContext=alternativeSearchContext;search = ''"
        >
          {{ l10nKey }}
        </b-dropdown-item>
      </b-dropdown>
      <b-form-input
        v-model="search"
        list="search"
        :placeholder="searchContext === 'story' ? $t('Rechercher une histoire') : $t('Rechercher les publications d\'une histoire à partir d\'un code histoire')"
      />
      <datalist v-if="searchResults.results && !isSearching">
        <option v-if="!searchResults.results.length">
          {{ $t('Aucun résultat.') }}
        </option>
        <option
          v-for="searchResult in searchResults.results"
          :key="searchResult.code"
          @click="selectSearchResult(searchResult)"
        >
          <template v-if="!isSearchByCode(search)">
            {{ searchResult.title }}
          </template>
          <Issue
            v-else-if="publicationNames[searchResult.publicationcode]"
            :publicationcode="searchResult.publicationcode"
            :publicationname="publicationNames[searchResult.publicationcode]"
            :issuenumber="searchResult.issuenumber"
            :clickable="withStoryLink"
          />
        </option>
      </datalist>
    </b-navbar-nav>
  </b-navbar>
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

  props: {
    withTitle: {
      type: Boolean,
      default: true
    },
    withStoryLink: {
      type: Boolean,
      default: true
    }
  },
  emits: ['issue-selected'],

  data: () => ({
    isSearching: false,
    pendingSearch: null,
    search: '',
    searchResults: [],
    searchContext: 'story',
  }),

  computed: {
    ...mapState("coa", ["publicationNames"]),
    searchContexts() {
      return {
        story: this.$t("titre d'histoire"),
        storycode: this.$t("code histoire")
      }
    },
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
      if (newValue !== '') {
        this.pendingSearch = newValue
        if (!this.isSearching) {
          await this.runSearch(newValue)
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
        this.$emit('issue-selected', searchResult)
      } else {
        this.searchContext = 'storycode'
        this.search = searchResult.code
      }
    },
    async runSearch(value) {
      this.isSearching = true
      try {
        if (this.isSearchByCode()) {
          const vm = this
          this.searchResults = (await axios.get(`/api/coa/list/issues/withStoryVersionCode/${value.replace(/^code=/, '')}`)).data
          this.searchResults.results = this.searchResults.results.sort((issue1, issue2) =>
            Math.sign(!!vm.isInCollection(issue2) - !!vm.isInCollection(issue1)))
          await this.fetchPublicationNames(this.searchResults.results.map(({publicationcode}) => publicationcode))
        } else {
          this.searchResults = (await axios.post('/api/coa/stories/search', {keywords: value})).data
        }
      }
      finally {
        this.isSearching = false
        // The input value as changed since the beginning of the search, searching again
        if (value !== this.pendingSearch) {
          await this.runSearch(this.pendingSearch)
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
.navbar {
  .navbar-brand {
    min-width: 120px;
  }

  .navbar-nav {
    position: relative;
    flex-wrap: wrap;

    .dropdown.search-type {
      position: absolute;
      width: 120px;
      margin: 4px 0;

      .dropdown-menu {
        position: absolute;
        width: 100%;
        margin-top: 0;
        padding: 0;
        text-align: center;
      }

      ~ .form-control {
        padding-left: 135px;
      }

      ~ datalist {
        display: block;
        position: absolute;
        background: #eee;
        width: 100%;
        top: 30px;
        padding-left: 0;

        option {
          cursor: pointer;
          padding: 5px;
          border-bottom: 1px solid #888;
          color: #888;
          overflow-x: hidden;

          a {
            border: 0;
          }
        }
      }
    }
  }
}
</style>
