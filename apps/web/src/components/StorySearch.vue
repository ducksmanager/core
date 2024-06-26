<template>
  <nav
    ref="nav"
    class="navbar navbar-expand-lg navbar-dark position-relative d-flex flex-column"
    style="z-index: 9"
  >
    <div class="container-fluid">
      <div v-if="withTitle" class="navbar-brand">
        {{ $t("Rechercher une histoire") }}
      </div>
      <div class="collapse navbar-collapse d-block">
        <ul class="navbar-nav position-relative">
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
            @focus="showSearchResults = true"
          />
        </ul>
      </div>
    </div>
    <b-list-group
      v-if="searchResults.results && !isSearching && showSearchResults"
      class="position-absolute"
      :class="{ 'issues-list': isSearchByCode, 'story-list': !isSearchByCode }"
    >
      <b-list-group-item v-if="!searchResults.results.length">
        {{ $t("Aucun résultat.") }}
      </b-list-group-item>
      <b-list-group-item
        v-for="searchResult in searchResults.results as typeof issueResults.results"
        :key="searchResult!.storycode"
        class="d-flex align-items-center"
        @click="selectSearchResult(searchResult!)"
      >
        <template v-if="!isSearchByCode">
          <div class="me-1 d-flex">
            <Condition
              v-if="searchResult!.collectionIssue"
              :value="
                conditions.find(
                  ({ dbValue }) =>
                    dbValue === searchResult!.collectionIssue.condition,
                )?.value || undefined
              "
            />
          </div>
          <div>{{ searchResult!.title }}</div>
        </template>
        <Issue
          v-else-if="publicationNames[searchResult.publicationcode]"
          :publicationcode="searchResult.publicationcode"
          :publicationname="publicationNames[searchResult.publicationcode]!"
          :is-public="isPublic"
          :issuenumber="searchResult.issuenumber"
          clickable
        />
      </b-list-group-item>
    </b-list-group>
  </nav>
</template>

<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";
import axios from "axios";
import { watch } from "vue";

import condition from "~/composables/useCondition";
import { call } from "~axios-helper";
import { IssueWithPublicationcode } from "~dm-types/IssueWithPublicationcode";
import { SimpleIssue } from "~dm-types/SimpleIssue";
import { SimpleStory } from "~dm-types/SimpleStory";

const { withTitle = true, isPublic = false } = defineProps<{
  withTitle?: boolean;
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

const nav = ref<HTMLElement | null>(null);

onClickOutside(nav, () => {
  showSearchResults = false;
});

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
let showSearchResults = $ref(true);

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
    showSearchResults = false;
  } else {
    searchContext = "storycode";
    search = (searchResult as SimpleStory).storycode;
  }
};
const runSearch = async (value: string) => {
  isSearching = true;
  try {
    if (isSearchByCode) {
      const data = (
        await call(
          axios,
          new GET__coa__list__issues__by_storycode({
            query: { storycode: value.replace(/^code=/, "") },
          }),
        )
      ).data;
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
      const data = (
        await call(
          axios,
          new POST__coa__stories__search__withIssues({
            reqBody: { keywords: value },
          }),
        )
      ).data;
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
    showSearchResults = true;
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
  padding: 0 !important;

  > * {
    padding: 0 !important;
  }

  .navbar-brand {
    min-width: 120px;
  }

  .list-group {
    top: 26px;
    right: 0;
    width: max-content;

    &.story-list {
      :deep(> *) {
        width: 100%;
        height: 100%;
      }
    }

    .list-group-item {
      cursor: pointer;
      height: 26px;
      padding: 5px;
      overflow: auto;
      border-bottom: 1px solid #888;
      color: #888;

      > * {
        display: flex !important;
      }

      :deep(.issue-condition) {
        display: inline-block;

        &:before {
          margin-top: -12px;
        }
      }
    }
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
    }
  }
}
</style>
