<template>
  <div v-if="watchedAuthors.length">
    <h5>{{ l10n.LISTE_AUTEURS_INTRO }}</h5>
    <div v-if="personNames">
      <b-row
        v-for="author in watchedAuthors"
        :key="author.personCode"
        align-v="center"
      >
        <b-col lg="1">
          {{ personNames[author.personCode] }}
        </b-col>
        <b-col lg="2">
          <b-form-rating
            v-model="author.notation"
            :stars="10"
            @change="updateRating(author)"
          />
        </b-col>
        <b-col lg="2">
          <b-btn
            size="sm"
            @click="deleteAuthor(author)"
          >
            {{ l10n.SUPPRIMER }}
          </b-btn>
        </b-col>
      </b-row>
    </div>
    <h5>{{ l10n.LISTE_AUTEURS_AJOUTER }}</h5>
    <b-row>
      <b-col sm="4">
        <b-navbar-nav>
          <b-form-input
            v-model="search"
            list="search"
            :placeholder="l10n.AUTEUR"
          />
          <datalist v-if="Object.keys(searchResults) && !isSearching">
            <option v-if="!Object.keys(searchResults).length">
              {{ l10n.RECHERCHE_MAGAZINE_AUCUN_RESULTAT }}
            </option>
            <option
              v-for="(fullName, personCode) in searchResults"
              :key="personCode"
              @click="createRating(personCode)"
            >
              {{ fullName }}
            </option>
          </datalist>
        </b-navbar-nav>
      </b-col>
    </b-row>
  </div>

  <b-alert
    v-else-if="l10n"
    show
    variant="warn"
  >
    {{ l10n.AUCUN_AUTEUR_NOTE_1 }}
    {{ l10n.AUCUN_AUTEUR_NOTE_2_MEME_PAGE }}
    {{ l10n.AUCUN_AUTEUR_NOTE_3 }}
  </b-alert>
</template>
<script>
import l10nMixin from "../mixins/l10nMixin";
import {mapActions, mapState} from "vuex";
import axios from "axios";

export default {
  name: "AuthorList",
  mixins: [l10nMixin],
  props: {
    watchedAuthors: {
      type: Array,
      required: true
    }
  },

  data: () => ({
    isSearching: false,
    pendingSearch: null,
    search: '',
    searchResults: {}
  }),

  computed: {
    ...mapState("coa", ["personNames"])
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

  mounted() {
    this.fetchPersonNames(this.watchedAuthors.map(({personCode}) => personCode))
  },

  methods: {
    ...mapActions("coa", ["fetchPersonNames"]),
    ...mapActions("collection", ["loadWatchedAuthors"]),

    async createRating(personCode) {
      await axios.put('/api/collection/authors/watched', {personCode})
      await this.loadWatchedAuthors(true)
    },

    async updateRating(author) {
      await axios.post('/api/collection/authors/watched', author)
    },

    async deleteAuthor(author) {
      await axios.delete('/api/collection/authors/watched', {
        params: {
          personCode: author.personCode
        }
      })
      await this.loadWatchedAuthors(true)
    },

    async runSearch(value) {
      if (!this.isSearching) {
        try {
          this.isSearching = true
          this.searchResults = (await axios.get(`/api/coa/authorsfullnames/search/${value}`)).data;
        } finally {
          this.isSearching = false
          // The input value as changed since the beginning of the search, searching again
          if (value !== this.pendingSearch) {
            await this.runSearch(this.pendingSearch)
          }
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
ul li div {
  display: inline-block;
  width: 200px;
}

h5 {
  margin: 15px 0 0 0;
}

datalist {
  display: block;
  position: absolute;
  background: darkgray;
  width: 100%;
  top: 30px;
  padding-left: 0;

  option {
    cursor: pointer;
    padding: 5px;
    border-bottom: 1px solid #888;
    overflow-x: hidden;

    a {
      border: 0;
    }
  }
}
</style>