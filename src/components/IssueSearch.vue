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
              :key="searchResult.storycode"
              class="d-flex align-items-center"
              @click="selectSearchResult(searchResult)"
            >
              <template v-if="!isSearchByCode">
                <Condition
                  v-if="searchResult.collectionIssue"
                  :value="
                    conditions.find(
                      ({ dbValue }) =>
                        dbValue === searchResult.collectionIssue.condition
                    )
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
import { BDropdown, BDropdownItem, BFormInput } from "bootstrap-vue-3";
import { onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";

import { condition } from "~/composables/condition";
import { coa } from "~/stores/coa";
import { collection as collectionStore } from "~/stores/collection";

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
const { conditions } = condition();
const publicationNames = $computed(() => coa().publicationNames);
const { t: $t } = useI18n();
const fetchPublicationNames = coa().fetchPublicationNames;
const isInCollection = (issue) =>
  collectionStore().findInCollection(issue.publicationcode, issue.issuenumber);
const searchContexts = {
  story: $t("titre d'histoire"),
  storycode: $t("code histoire"),
};
const searchContextsWithoutCurrent = $computed(() =>
  Object.keys(searchContexts)
    .filter((currentSearchContext) => currentSearchContext !== searchContext)
    .reduce(
      (acc, currentSearchContext) => ({
        ...acc,
        [currentSearchContext]: searchContexts[currentSearchContext],
      }),
      {}
    )
);
const isSearchByCode = $computed(() => searchContext === "storycode");
const selectSearchResult = (searchResult) => {
  if (isSearchByCode) {
    emit("issue-selected", searchResult);
  } else {
    searchContext = "storycode";
    search = searchResult.storycode;
  }
};
const runSearch = async (value) => {
  isSearching = true;
  try {
    if (isSearchByCode) {
      searchResults = (
        await axios.get(
          `/coa/list/issues?storycode=${value.replace(/^code=/, "")}`
        )
      ).data;
      searchResults.results = searchResults.results.sort((issue1, issue2) =>
        Math.sign(!!isInCollection(issue2) - !!isInCollection(issue1))
      );
      await fetchPublicationNames(
        searchResults.results.map(({ publicationcode }) => publicationcode)
      );
    } else {
      searchResults = (
        await axios.post("/coa/stories/search/withIssues", {
          keywords: value,
        })
      ).data;
      searchResults.results = searchResults.results.map((story) => ({
        ...story,
        collectionIssue: collectionStore().collection.find(
          ({
            publicationCode: collectionPublicationCode,
            issueNumber: collectionIssueNumber,
          }) =>
            story.issues
              .map(
                ({ publicationcode, issuenumber }) =>
                  `${publicationcode}-${issuenumber}`
              )
              .includes(`${collectionPublicationCode}-${collectionIssueNumber}`)
        ),
      }));
    }
  } finally {
    isSearching = false;
    // The input value as changed since the beginning of the search, searching again
    if (value !== pendingSearch) await runSearch(pendingSearch);
  }
};

let isSearching = $ref(false);
let pendingSearch = $ref(null);
let search = $ref("");
let searchResults = $ref([]);
let searchContext = $ref("story");

watch(
  () => search,
  async (newValue) => {
    if (newValue) {
      pendingSearch = newValue;
      if (!isSearching) await runSearch(newValue);
    }
  }
);

onMounted(async () => {
  await collectionStore().loadCollection();
  await coa().fetchCountryNames();
});
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
        min-width: 275px;
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
