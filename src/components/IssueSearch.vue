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
            :text="searchContexts[searchContext as 'story' | 'storycode']"
          >
            <b-dropdown-item
              v-for="(
                l10nKey, alternativeSearchContext
              ) in searchContextsWithoutCurrent"
              :key="alternativeSearchContext"
              @click="
                searchContext = alternativeSearchContext as 'story' | 'storycode';
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
            <template v-if="!isSearchByCode">
              <option
                v-for="searchResult in (searchResults.results as typeof issueResults.results)"
                :key="searchResult!.storycode"
                class="d-flex align-items-center"
                @click="selectSearchResult(searchResult!)"
              >
                <Condition
                  v-if="searchResult!.collectionIssue"
                  :value="
                    conditions.find(
                      ({ dbValue }) =>
                        dbValue === searchResult!.collectionIssue.condition
                    )?.value || null
                  "
                />&nbsp;{{ searchResult!.title }}
              </option>
            </template>
            <template v-else>
              <option
                v-for="searchResult in (searchResults.results as typeof storyResults.results)"
                :key="searchResult!.storycode"
                class="d-flex align-items-center"
                @click="selectSearchResult(searchResult!)"
              >
                <Issue
                  v-if="publicationNames[searchResult.publicationcode]"
                  :publicationcode="searchResult.publicationcode"
                  :publicationname="
                    publicationNames[searchResult.publicationcode]
                  "
                  :issuenumber="searchResult.issuenumber"
                  :clickable="withStoryLink"
                /></option
            ></template>
          </datalist>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import axios from "axios";
import { BDropdown, BDropdownItem, BFormInput } from "bootstrap-vue-3";
import { onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";

import condition from "~/composables/condition";
import { coa } from "~/stores/coa";
import {
  collection as collectionStore,
  IssueWithPublicationcode,
} from "~/stores/collection";
import { simple_issue } from "~types/SimpleIssue";
import { simple_story } from "~types/SimpleStory";

const { withTitle = true, withStoryLink = true } = defineProps<{
  withTitle?: boolean;
  withStoryLink?: boolean;
}>();
const emit = defineEmits<{
  (e: "issue-selected", story: simple_issue): void;
}>();
const { conditions } = condition();

let isSearching = $ref(false as boolean);
let pendingSearch = $ref(null as string | null);
let search = $ref("" as string);
let storyResults = $ref(
  {} as {
    results: (simple_story & {
      collectionIssue: IssueWithPublicationcode | null;
    })[];
    hasMore: boolean;
  }
);
let issueResults = $ref({} as { results: simple_issue[] });
let searchContext = $ref("story" as "story" | "storycode");

const publicationNames = $computed(() => coa().publicationNames);
const { t: $t } = useI18n();
const fetchPublicationNames = coa().fetchPublicationNames;
const isInCollection = (issue: simple_issue) =>
  collectionStore().findInCollection(
    issue.publicationcode,
    issue.issuenumber
  ) !== undefined;
const searchContexts = {
  story: $t("titre d'histoire"),
  storycode: $t("code histoire"),
} as { story: string; storycode: string };
const searchContextsWithoutCurrent = $computed(
  (): { [searchContext: string]: { [key: string]: string } } =>
    Object.keys(searchContexts)
      .filter((currentSearchContext) => currentSearchContext !== searchContext)
      .reduce(
        (acc, currentSearchContext) => ({
          ...acc,
          [currentSearchContext]:
            searchContexts[currentSearchContext as "story" | "storycode"],
        }),
        {}
      )
);
const isSearchByCode = $computed(() => searchContext === "storycode");
const searchResults = $computed(() =>
  isSearchByCode ? issueResults : storyResults
);
const selectSearchResult = (searchResult: simple_story | simple_issue) => {
  if (isSearchByCode) {
    emit("issue-selected", searchResult as simple_issue);
  } else {
    searchContext = "storycode";
    search = (searchResult as simple_story).storycode;
  }
};
const runSearch = async (value: string) => {
  isSearching = true;
  try {
    if (isSearchByCode) {
      const data = (
        await axios.get(
          `/coa/list/issues?storycode=${value.replace(/^code=/, "")}`
        )
      ).data as { results: simple_issue[] };
      issueResults = {
        results: data.results.sort((issue1, issue2) =>
          Math.sign(
            (isInCollection(issue2) ? 1 : 0) - (isInCollection(issue1) ? 1 : 0)
          )
        ),
      };
      await fetchPublicationNames(
        issueResults.results.map(({ publicationcode }) => publicationcode)
      );
    } else {
      const data = (
        await axios.post("/coa/stories/search/withIssues", {
          keywords: value,
        })
      ).data as { results: simple_story[]; hasMore: boolean };
      storyResults.results = data.results.map((story) => ({
        ...story,
        collectionIssue:
          collectionStore().collection!.find(
            ({
              publicationcode: collectionPublicationCode,
              issuenumber: collectionIssueNumber,
            }) =>
              story
                .issues!.map(
                  ({ publicationcode, issuenumber }) =>
                    `${publicationcode}-${issuenumber}`
                )
                .includes(
                  `${collectionPublicationCode}-${collectionIssueNumber}`
                )
          ) || null,
      }));
    }
  } finally {
    isSearching = false;
    // The input value as changed since the beginning of the search, searching again
    if (value !== pendingSearch && pendingSearch) {
      await runSearch(pendingSearch);
    }
  }
};

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
