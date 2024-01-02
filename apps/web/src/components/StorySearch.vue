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
                searchContext = alternativeSearchContext as
                  | 'story'
                  | 'storycode';
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
                    `Rechercher les publications d'une histoire à partir d'un code histoire`,
                  )
            "
          />
          <datalist v-if="searchResults.results && !isSearching">
            <option v-if="!searchResults.results.length">
              {{ $t("Aucun résultat.") }}
            </option>
            <template v-if="!isSearchByCode">
              <option
                v-for="searchResult in searchResults.results as typeof issueResults.results"
                :key="searchResult!.storycode"
                class="d-flex align-items-center"
                @click="selectSearchResult(searchResult!)"
              >
                <Condition
                  v-if="searchResult!.collectionIssue"
                  :value="
                    conditions.find(
                      ({ dbValue }) =>
                        dbValue === searchResult!.collectionIssue.condition,
                    )?.value || undefined
                  "
                />&nbsp;{{ searchResult!.title }}
              </option>
            </template>
            <template v-else>
              <option
                v-for="searchResult in searchResults.results as typeof storyResults.results"
                :key="searchResult!.storycode"
                class="d-flex align-items-center"
                @click="selectSearchResult(searchResult!)"
              >
                <Issue
                  v-if="publicationNames[searchResult.publicationcode]"
                  :publicationcode="searchResult.publicationcode"
                  :publicationname="
                    publicationNames[searchResult.publicationcode]!
                  "
                  :is-public="isPublic"
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
import condition from "~/composables/useCondition";
import { IssueWithPublicationcode } from "~dm-types/IssueWithPublicationcode";
import { SimpleIssue } from "~dm-types/SimpleIssue";
import { SimpleStory } from "~dm-types/SimpleStory";
import {
  NamespaceEndpoint as CoaNamespaceEndpoint,
  Services as CoaServices,
} from "~services/coa/types";

const {
  withTitle = true,
  withStoryLink = true,
  isPublic = false,
} = defineProps<{
  withTitle?: boolean;
  withStoryLink?: boolean;
  isPublic?: boolean;
}>();
const emit = defineEmits<{
  (e: "issue-selected", story: SimpleIssue): void;
}>();
const { conditions } = condition();

const { findInCollection } = isPublic ? publicCollection() : collection();
const { issues } = storeToRefs(collection());
const { fetchPublicationNames, fetchCountryNames } = coa();
const { publicationNames } = storeToRefs(coa());
let coaServices = useSocket<CoaServices>(CoaNamespaceEndpoint);

let isSearching = $ref(false as boolean);
let pendingSearch = $ref(null as string | null);
let search = $ref("" as string);
let storyResults = $ref(
  {} as {
    results: (SimpleStory & {
      collectionIssue: IssueWithPublicationcode | null;
    })[];
    hasMore: boolean;
  },
);
let issueResults = $ref({} as { results: SimpleIssue[] });
let searchContext = $ref("story" as "story" | "storycode");

const { t: $t } = useI18n();
const isInCollection = ({ publicationcode, issuenumber }: SimpleIssue) =>
  findInCollection(publicationcode, issuenumber) !== undefined;

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
        {},
      ),
);
const isSearchByCode = $computed(() => searchContext === "storycode");
const searchResults = $computed(() =>
  isSearchByCode ? issueResults : storyResults,
);
const selectSearchResult = (searchResult: SimpleStory | SimpleIssue) => {
  if (isSearchByCode) {
    emit("issue-selected", searchResult as SimpleIssue);
  } else {
    searchContext = "storycode";
    search = (searchResult as SimpleStory).storycode;
  }
};
const runSearch = async (value: string) => {
  isSearching = true;
  try {
    if (isSearchByCode) {
      const data = await coaServices.getIssuesByStorycode(
        value.replace(/^code=/, ""),
      );
      issueResults = {
        results: data.sort((issue1, issue2) =>
          Math.sign(
            (isInCollection(issue2) ? 1 : 0) - (isInCollection(issue1) ? 1 : 0),
          ),
        ),
      };
      await fetchPublicationNames(
        issueResults.results.map(({ publicationcode }) => publicationcode),
      );
    } else {
      const data = await coaServices.searchStory(value.split(","), true);
      storyResults.results = data.results.map((story) => ({
        ...story,
        collectionIssue:
          issues.value!.find(
            ({
              publicationcode: collectionPublicationCode,
              issuenumber: collectionIssueNumber,
            }) =>
              story
                .issues!.map(
                  ({ publicationcode, issuenumber }) =>
                    `${publicationcode}-${issuenumber}`,
                )
                .includes(
                  `${collectionPublicationCode}-${collectionIssueNumber}`,
                ),
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

watch($$(search), async (newValue) => {
  if (newValue) {
    pendingSearch = newValue;
    if (!isSearching) await runSearch(newValue);
  }
});

fetchCountryNames();
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
      margin: -1px 0px -1px 0px;
    }

    :deep(.dropdown.search-type) {
      position: absolute;
      width: 120px;

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
