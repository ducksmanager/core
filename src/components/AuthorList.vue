<template>
  <div>
    <BAlert
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
    </BAlert>
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
        <BRow
          v-for="author in watchedAuthors"
          :key="author.personcode"
          align-v="center"
          class="mb-2"
        >
          <BCol lg="1">
            {{ personNames[author.personcode] }}
          </BCol>
          <BCol lg="2">
            <StarRating
              v-model:rating="author.notation"
              :max-rating="10"
              @update:rating="updateRating(author)"
            />
          </BCol>
          <BCol lg="2">
            <b-button size="sm" @click="deleteAuthor(author)">
              {{ $t("Supprimer") }}
            </b-button>
          </BCol>
        </BRow>
      </div>
    </div>
    <div>
      <h5>{{ $t("Ajouter un auteur") }}</h5>
      <BAlert v-if="watchedAuthors.length >= 5" variant="warning" show>
        {{
          $t(
            "Vous avez atteint le nombre maximal d'auteurs surveillés. Supprimez des auteurs existants pour en surveiller d'autres."
          )
        }}
      </BAlert>
      <BRow v-else>
        <BCol sm="4">
          <nav class="navbar">
            <ul class="navbar-nav">
              <BFormInput
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
                  v-for="(fullName, personcode) in searchResults"
                  :key="personcode"
                  :disabled="isAuthorWatched(personcode)"
                  @click="
                    isAuthorWatched(personcode)
                      ? () => {}
                      : createRating({ personcode })
                  "
                >
                  {{ fullName }}
                </option>
              </datalist>
            </ul>
          </nav>
        </BCol>
      </BRow>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { BAlert, BCol, BFormInput, BRow } from "bootstrap-vue-3";
import { watch } from "vue";

import { coa } from "~/stores/coa";
import { collection } from "~/stores/collection";
import { l10n } from "~/stores/l10n";

const { watchedAuthors } = defineProps({
  watchedAuthors: {
    type: Array,
    required: true,
  },
});

let isSearching = $ref(false);
let pendingSearch = $ref(null);
const search = $ref("");
let searchResults = $ref(null);

const personNames = $computed(() => coa().personNames);

watch(
  () => search,
  async (newValue) => {
    if (newValue !== "") {
      pendingSearch = newValue;
      if (!isSearching) await runSearch(newValue);
    }
  }
);
watch(
  () => watchedAuthors,
  async (newValue) => {
    if (watchedAuthors?.length) {
      await coa().fetchPersonNames(
        newValue.map(({ personcode }) => personcode)
      );
    }
  },
  { immediate: true }
);
const { r } = l10n();
const { loadWatchedAuthors } = collection();
const isAuthorWatched = (personcode) =>
  watchedAuthors.some(
    ({ personcode: watchedPersonCode }) => personcode === watchedPersonCode
  );
const createRating = async (author) => {
  await axios.put("/collection/authors/watched", author);
  await loadWatchedAuthors(true);
};
const updateRating = async (author) => {
  await axios.post("/collection/authors/watched", author);
};
const deleteAuthor = async (author) => {
  await axios.delete("/collection/authors/watched", author);
  await loadWatchedAuthors(true);
};
const runSearch = async (value) => {
  if (!isSearching) {
    try {
      isSearching = true;
      searchResults = (await axios.get(`/coa/authorsfullnames/search/${value}`))
        .data;
    } finally {
      isSearching = false;
      // The input value has changed since the beginning of the search, searching again
      if (value !== pendingSearch) await runSearch(pendingSearch);
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
