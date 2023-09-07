<template>
  <div>
    <b-alert
      v-if="!watchedAuthors.length"
      :model-value="true"
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
        <router-link to="/expand/suggestions">{{
          $t("suggérer des numéros en fonction de vos préférences.")
        }}</router-link>
      </p>
      <div v-if="personNames">
        <b-row
          v-for="author in watchedAuthors"
          :key="author.personcode"
          align-v="center"
          class="mb-2"
        >
          <b-col lg="1">
            {{ personNames[author.personcode] }}
          </b-col>
          <b-col lg="2">
            <StarRating
              v-model:rating="author.notation"
              :max-rating="10"
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
      <b-alert
        v-if="watchedAuthors.length >= 5"
        variant="warning"
        :model-value="true"
      >
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
                  v-for="(fullName, personcode) in searchResults"
                  :key="personcode"
                  :disabled="isAuthorWatched(personcode as string)"
                  @click="
                    isAuthorWatched(personcode as string)
                      ? () => {}
                      : createRating({ personcode: personcode as string })
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

<script setup lang="ts">
import axios from "axios";
import { watch } from "vue";

import { coa } from "~/stores/coa";
import { collection } from "~/stores/collection";
import { call } from "~/util/axios";
import { inducks_person } from "~prisma-clients/client_coa";
import { authorUser } from "~prisma-clients/client_dm";
import {
  DELETE__collection__authors__watched,
  GET__coa__authorsfullnames__search__$partialAuthorName,
  POST__collection__authors__watched,
  PUT__collection__authors__watched,
} from "~types/routes";

const { watchedAuthors } = defineProps<{
  watchedAuthors: authorUser[];
}>();

let isSearching = $ref(false as boolean);
let pendingSearch = $ref(null as string | null);
const search = $ref("");
let searchResults = $ref(
  null as { [personcode: string]: inducks_person[] } | null
);

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
const { loadWatchedAuthors } = collection();
const isAuthorWatched = (personcode: string) =>
  watchedAuthors.some(
    ({ personcode: watchedPersonCode }) => personcode === watchedPersonCode
  );
const createRating = async (data: { personcode: string }) => {
  await call(
    axios,
    new PUT__collection__authors__watched({
      reqBody: data,
    })
  );
  await loadWatchedAuthors(true);
};
const updateRating = async (data: { personcode: string; notation: number }) => {
  await call(axios, new POST__collection__authors__watched({ reqBody: data }));
};
const deleteAuthor = async (data: { personcode: string }) => {
  await call(
    axios,
    new DELETE__collection__authors__watched({ reqBody: data })
  );
  await loadWatchedAuthors(true);
};
const runSearch = async (value: string) => {
  if (!isSearching) {
    try {
      isSearching = true;
      searchResults = (
        await call(
          axios,
          new GET__coa__authorsfullnames__search__$partialAuthorName({
            params: {
              partialAuthorName: value,
            },
          })
        )
      ).data;
    } finally {
      isSearching = false;
      // The input value has changed since the beginning of the search, searching again
      if (value !== pendingSearch) await runSearch(pendingSearch!);
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