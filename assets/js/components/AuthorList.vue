<template>
  <div>
    <b-alert
      v-if="!watchedAuthors.length"
      show
      variant="warning"
      class="section"
    >
      {{ $t('Aucun auteur noté.') }}
      {{ $t('Ajoutez vos auteurs préférés ci-dessous et indiquez les notes que vous leur attribuez.') }}
      {{ $t('Grâce à ces notes, DucksManager déterminera ensuite les magazines susceptibles de vous intéresser.') }}
    </b-alert>
    <div
      v-else
      class="section"
    >
      <h5>{{ $t('Auteurs suivis') }}</h5>
      <p>
        {{ $t('Entrez les noms de vos auteurs favoris pour voir combien de leurs histoires vous possédez. Noter les auteurs permettra également à DucksManager de vous') }}
        <a :href="$r('/expand')">{{ $t('suggérer des numéros en fonction de vos préférences.') }}</a>
      </p>
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
            <star-rating
              v-model:rating="author.notation"
              :max-rating="10"
              @change="updateRating(author)"
            />
          </b-col>
          <b-col lg="2">
            <b-button
              size="sm"
              @click="deleteAuthor(author)"
            >
              {{ $t('Supprimer') }}
            </b-button>
          </b-col>
        </b-row>
      </div>
    </div>
    <div>
      <h5>{{ $t('Ajouter un auteur') }}</h5>
      <b-alert
        v-if="watchedAuthors.length >= 5"
        variant="warning"
        show
      >
        {{ $t("Vous avez atteint le nombre maximal d'auteurs surveillés. Supprimez des auteurs existants pour en surveiller d'autres.") }}
      </b-alert>
      <b-row v-else>
        <b-col sm="4">
          <nav class="navbar">
            <div class="collapse navbar-collapse">
              <ul class="navbar-nav">
                <b-form-input
                  v-model="search"
                  list="search"
                  :placeholder="$t('Auteur')"
                />
                <datalist v-if="searchResults && Object.keys(searchResults) && !isSearching">
                  <option v-if="!Object.keys(searchResults).length">
                    {{ $t('Aucun résultat.') }}
                  </option>
                  <option
                    v-for="(fullName, personCode) in searchResults"
                    :key="personCode"
                    :disabled="isAuthorWatched(personCode)"
                    @click="isAuthorWatched(personCode) ? () => {} : createRating(personCode)"
                  >
                    {{ fullName }}
                  </option>
                </datalist>
              </ul>
            </div>
          </nav>
        </b-col>
      </b-row>
    </div>
  </div>
</template>
<script>
import l10nMixin from "../mixins/l10nMixin";
import {mapActions, mapState} from "pinia";
import axios from "axios";
import {BAlert, BCol, BFormInput, BRow} from "bootstrap-vue-3";
import StarRating from 'vue-star-rating'
import { coa } from "../stores/coa";
import { collection } from "../stores/collection";

export default {
  name: "AuthorList",
  components: {
    BAlert,
    BRow,
    BCol,
    BFormInput,
    StarRating
  },
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
    searchResults: null
  }),

  computed: {
    ...mapState(coa, ["personNames"])
  },

  watch: {
    async search(newValue) {
      if (newValue !== '') {
        this.pendingSearch = newValue
        if (!this.isSearching) {
          await this.runSearch(newValue)
        }
      }
    },
    watchedAuthors: {
      immediate: true,
      async handler(newValue) {
        await this.fetchPersonNames(newValue.map(({personCode}) => personCode))
      }
    }
  },

  methods: {
    ...mapActions(coa, ["fetchPersonNames"]),
    ...mapActions(collection, ["loadWatchedAuthors"]),

    isAuthorWatched(personCode) {
      return this.watchedAuthors.some(({personCode: watchedPersonCode}) => personCode === watchedPersonCode)
    },

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
  margin: 15px 0;
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

    &[disabled] {
      cursor: default;
    }

    a {
      border: 0;
    }
  }
}
</style>
