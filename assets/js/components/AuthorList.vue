<template>
  <div>
    <b-alert
      v-if="!watchedAuthors.length"
      show
      variant="warning"
      class="section"
    >
      {{ $t("Aucun auteur noté.") }}
      {{
        $t(
          "Ajoutez vos auteurs préférés ci-dessous et indiquez les notes que vous leur attribuez."
        )
      }}
      {{
        $t(
          "Grâce à ces notes, DucksManager déterminera ensuite les magazines susceptibles de vous intéresser."
        )
      }}
    </b-alert>
    <div v-else class="section">
      <h5>{{ $t("Auteurs suivis") }}</h5>
      <p>
        {{
          $t(
            "Entrez les noms de vos auteurs favoris pour voir combien de leurs histoires vous possédez. Noter les auteurs permettra également à DucksManager de vous"
          )
        }}
        <a :href="r('/expand')">{{
          $t("suggérer des numéros en fonction de vos préférences.")
        }}</a>
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
              :star-size="20"
              @update:rating="updateRating(author)"
            />
          </b-col>
          <b-col lg="2">
            <b-button size="sm" @click="deleteAuthor(author)">
              {{ $t("Supprimer") }}
            </b-button>
          </b-col>
        </b-row>
      </div>
    </div>
    <div>
      <h5>{{ $t("Ajouter un auteur") }}</h5>
      <b-alert v-if="watchedAuthors.length >= 5" variant="warning" show>
        {{
          $t(
            "Vous avez atteint le nombre maximal d'auteurs surveillés. Supprimez des auteurs existants pour en surveiller d'autres."
          )
        }}
      </b-alert>
      <b-row v-else>
        <b-col sm="4">
          <nav class="navbar">
            <ul class="navbar-nav">
              <b-form-input
                v-model="search"
                list="search"
                :placeholder="$t('Auteur')"
              />
              <datalist
                v-if="
                  searchResults && Object.keys(searchResults) && !isSearching
                "
              >
                <option v-if="!Object.keys(searchResults).length">
                  {{ $t("Aucun résultat.") }}
                </option>
                <option
                  v-for="(fullName, personCode) in searchResults"
                  :key="personCode"
                  :disabled="isAuthorWatched(personCode)"
                  @click="
                    isAuthorWatched(personCode)
                      ? () => {}
                      : createRating(personCode)
                  "
                >
                  {{ fullName }}
                </option>
              </datalist>
            </ul>
          </nav>
        </b-col>
      </b-row>
    </div>
  </div>
</template>
<script setup>
import axios from "axios";
import { BAlert, BCol, BFormInput, BRow } from "bootstrap-vue-3";
import StarRating from "vue-star-rating";
import { coa } from "../stores/coa";
const { collection } = require("../stores/collection");
import { l10n } from "../stores/l10n";
import { computed, watch, ref } from "vue";

const props = defineProps({
  watchedAuthors: {
    type: Array,
    required: true,
  },
});

const isSearching = ref(false),
  pendingSearch = ref(null),
  search = ref(""),
  searchResults = ref(null),
  personNames = computed(() => coa().personNames);

watch(
  () => search.value,
  async (newValue) => {
    if (newValue !== "") {
      pendingSearch.value = newValue;
      if (!isSearching.value) {
        await runSearch(newValue);
      }
    }
  }
);
watch(
  () => props.watchedAuthors,
  async (newValue) => {
    await coa().fetchPersonNames(newValue.map(({ personCode }) => personCode));
  },
  { immediate: true }
);
const { r } = l10n(),
  { loadWatchedAuthors } = collection(),
  isAuthorWatched = (personCode) =>
    props.watchedAuthors.some(
      ({ personCode: watchedPersonCode }) => personCode === watchedPersonCode
    ),
  createRating = async (personCode) => {
    await axios.put("/api/collection/authors/watched", { personCode });
    await loadWatchedAuthors(true);
  },
  updateRating = async (author) => {
    await axios.post("/api/collection/authors/watched", author);
  },
  deleteAuthor = async (author) => {
    await axios.delete("/api/collection/authors/watched", {
      params: {
        personCode: author.personCode,
      },
    });
    await loadWatchedAuthors(true);
  },
  runSearch = async (value) => {
    if (!isSearching.value) {
      try {
        isSearching.value = true;
        searchResults.value = (
          await axios.get(`/api/coa/authorsfullnames/search/${value}`)
        ).data;
      } finally {
        isSearching.value = false;
        // The input value has changed since the beginning of the search, searching again
        if (value !== pendingSearch.value) {
          await runSearch(pendingSearch);
        }
      }
    }
  };
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
