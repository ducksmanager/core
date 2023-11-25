<template>
  <div>
    <b-alert
      v-if="!ratings.length"
      :model-value="true"
      variant="warning"
      class="section"
    >
      {{ $t("Aucun auteur noté.") }}
      {{
        $t(
          "Ajoutez vos auteurs préférés ci-dessous et indiquez les notes que vous leur attribuez.",
        )
      }}
      {{
        $t(
          "Grâce à ces notes, DucksManager déterminera ensuite les magazines susceptibles de vous intéresser.",
        )
      }}
    </b-alert>
    <div v-else class="section">
      <h5>{{ $t("Auteurs suivis") }}</h5>
      <p>
        {{
          $t(
            "Entrez les noms de vos auteurs favoris pour voir combien de leurs histoires vous possédez. Noter les auteurs permettra également à DucksManager de vous",
          )
        }}
        <router-link to="/expand/suggestions">{{
          $t("suggérer des numéros en fonction de vos préférences.")
        }}</router-link>
      </p>
      <div v-if="personNames">
        <b-row
          v-for="author in ratings"
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
              :readonly="false"
              :max-rating="10"
              @update:rating="updateRating(author)"
              ><template #emptyStarIcon><i-bi-star /></template>
              <template #filledStarIcon><i-bi-star-fill /></template
            ></StarRating>
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
      <b-alert v-if="ratings.length >= 5" variant="warning" :model-value="true">
        {{
          $t(
            "Vous avez atteint le nombre maximal d'auteurs surveillés. Supprimez des auteurs existants pour en surveiller d'autres.",
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
                  :class="{
                    disabled: isAuthorWatched(personcode as string),
                  }"
                  @click="
                    createRating({
                      personcode: personcode as string,
                    })
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
import type { authorUser } from "~prisma-clients/client_dm";

const {
  searchAuthors,
  updateRating,
  deleteAuthor,
  isAuthorWatched,
  createRating,
} = stats();
const { fetchPersonNames } = coa();

const {
  authorSearchResults: searchResults,
  pendingSearch,
  isSearching,
} = storeToRefs(stats());

const { personNames } = storeToRefs(coa());

const { ratings } = defineProps<{
  ratings: authorUser[];
}>();

const search = $ref("");

watch($$(search), async (newValue) => {
  if (newValue !== "") {
    pendingSearch.value = newValue;
    if (!isSearching.value) {
      await searchAuthors(newValue);
    }
  }
});
watch(
  $$(ratings),
  async (newValue) => {
    if (ratings?.length) {
      await fetchPersonNames(newValue.map(({ personcode }) => personcode));
    }
  },
  { immediate: true },
);
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

    &.disabled {
      color: #777;
    }

    a {
      border: 0;
    }
  }
}
</style>
