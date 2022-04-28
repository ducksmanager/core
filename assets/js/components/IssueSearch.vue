<template>
  <nav class="navbar navbar-expand-lg navbar-dark position-sticky">
    <div class="container-fluid">
      <div v-if="withTitle" class="navbar-brand">
        {{ $t("Rechercher une histoire") }}
      </div>
      <div class="collapse navbar-collapse">
        <ul class="navbar-nav">
          <b-dropdown
            class="dropdown search-type"
            :text="searchContexts[searchContext]"
          >
            <b-dropdown-item
              v-for="(
                l10nKey, alternativeSearchContext
              ) in searchContextsWithoutCurrent"
              :key="alternativeSearchContext"
              @click="
                searchContext = alternativeSearchContext;
                search = '';
              "
            >
              {{ l10nKey }}
            </b-dropdown-item>
          </b-dropdown>
          <b-form-input
            v-model="search"
            list="search"
            :placeholder="
              searchContext === 'story'
                ? $t('Rechercher une histoire')
                : $t(
                    `Rechercher les publications d'une histoire à partir d'un code histoire`
                  )
            "
          />
          <datalist v-if="searchResults.results && !isSearching">
            <option v-if="!searchResults.results.length">
              {{ $t("Aucun résultat.") }}
            </option>
            <option
              v-for="searchResult in searchResults.results"
              :key="searchResult.code"
              class="d-flex align-items-center"
              @click="selectSearchResult(searchResult)"
            >
              <template v-if="!isSearchByCode(search)">
                <Condition
                  v-if="searchResult.collectionIssue"
                  :value="
                    conditions.find(
                      ({ dbValue }) =>
                        dbValue === searchResult.collectionIssue.condition
                    ).value
                  "
                />&nbsp;{{ searchResult.title }}
              </template>
              <Issue
                v-else-if="publicationNames[searchResult.publicationcode]"
                :publicationcode="searchResult.publicationcode"
                :publicationname="
                  publicationNames[searchResult.publicationcode]
                "
                :issuenumber="searchResult.issuenumber"
                :clickable="withStoryLink"
              />
            </option>
          </datalist>
        </ul>
      </div>
    </div>
  </nav>
</template>
<script setup>
import axios from "axios";
import Issue from "./Issue";
import { mapActions, mapState } from "pinia";
import { collection } from "../composables/collection";
import Condition from "./Condition";
import { condition } from "../composables/condition";
import { BDropdown, BDropdownItem, BFormInput } from "bootstrap-vue-3";
import { coa } from "../stores/coa";
import { computed, watch } from "vue";
import { useI18n } from "vue-i18n";

defineProps({
  withTitle: {
    type: Boolean,
    default: true,
  },
  withStoryLink: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits(["issue-selected"]);

const { findInCollection } = collection(),
  { conditions } = condition(),
  isSearching = ref(false),
  pendingSearch = ref(null),
  search = ref(""),
  searchResults = ref([]),
  searchContext = ref("story"),
  publicationNames = computed(() => coa().publicationNames),
  { t: $t } = useI18n(),
  fetchPublicationNames = coa().fetchPublicationNames,
  isInCollection = (issue) =>
    findInCollection(issue.publicationcode, issue.issuenumber),
  searchContexts = {
    story: $t("titre d'histoire"),
    storycode: $t("code histoire"),
  },
  searchContextsWithoutCurrent = computed(() =>
    Object.keys(searchContexts)
      .filter(
        (currentSearchContext) => currentSearchContext !== searchContext.value
      )
      .reduce(
        (acc, currentSearchContext) => ({
          ...acc,
          [currentSearchContext]: searchContexts[currentSearchContext],
        }),
        {}
      )
  ),
  isSearchByCode = computed(() => searchContext.value === "storycode"),
  selectSearchResult = (searchResult) => {
    if (isSearchByCode.value) {
      emit("issue-selected", searchResult);
    } else {
      searchContext.value = "storycode";
      search.value = searchResult.code;
    }
  },
  runSearch = async (value) => {
    isSearching.value = true;
    try {
      if (isSearchByCode.value) {
        searchResults.value = (
          await axios.get(
            `/api/coa/list/issues/withStoryVersionCode/${value.replace(
              /^code=/,
              ""
            )}`
          )
        ).data;
        searchResults.value.results = searchResults.value.results.sort(
          (issue1, issue2) =>
            Math.sign(!!isInCollection(issue2) - !!isInCollection(issue1))
        );
        await fetchPublicationNames(
          searchResults.value.results.map(
            ({ publicationcode }) => publicationcode
          )
        );
      } else {
        searchResults.value = (
          await axios.post("/api/coa/stories/search/withIssues", {
            keywords: value,
          })
        ).data;
        searchResults.value.results = searchResults.value.results.map(
          (story) => ({
            ...story,
            collectionIssue: collection.value.find(
              ({
                publicationCode: collectionPublicationCode,
                issueNumber: collectionIssueNumber,
              }) =>
                story.issues
                  .map(
                    ({ publicationcode, issuenumber }) =>
                      `${publicationcode}-${issuenumber}`
                  )
                  .includes(
                    `${collectionPublicationCode}-${collectionIssueNumber}`
                  )
            ),
          })
        );
      }
    } finally {
      isSearching.value = false;
      // The input value as changed since the beginning of the search, searching again
      if (value !== pendingSearch.value) {
        await runSearch(pendingSearch.value);
      }
    }
  };

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
</script>

<style scoped lang="scss">
.navbar {
  flex-flow: row nowrap;

  .navbar-brand {
    min-width: 120px;
  }

  .navbar-nav {
    flex-wrap: wrap;

    input {
      width: auto;
    }

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
        top: 36px;
        padding-left: 0;

        option {
          cursor: pointer;
          height: 26px;
          padding: 5px;
          overflow: auto;
          border-bottom: 1px solid #888;
          color: #888;

          :deep(a) {
            .issue-condition {
              display: inline-block;

              &:before {
                margin-top: -12px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
