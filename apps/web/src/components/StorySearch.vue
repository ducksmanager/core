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
      v-if="searchResults?.results && !isSearching && showSearchResults"
      class="position-absolute"
      :class="{ 'issues-list': isSearchByCode, 'story-list': !isSearchByCode }"
    >
      <b-list-group-item v-if="!searchResults.results.length">
        {{ $t("Aucun résultat.") }}
      </b-list-group-item>
      <b-list-group-item
        v-for="searchResult in searchResults.results"
        :key="JSON.stringify(searchResult)"
        class="d-flex align-items-center"
        @click="selectSearchResult(searchResult)"
      >
        <template v-if="!isSearchByCode">
          <div class="me-1 d-flex">
            <Condition
              v-if="
                (searchResult as SimpleStoryWithOptionalCollectionIssue)
                  .collectionIssue
              "
              :value="
                conditions.find(
                  ({ dbValue }) =>
                    dbValue ===
                    (searchResult as SimpleStoryWithOptionalCollectionIssue)
                      .collectionIssue!.condition
                )?.dbValue || undefined
              "
            />
          </div>
          <div>
            {{ (searchResult as SimpleStoryWithOptionalCollectionIssue).title }}
          </div>
        </template>
        <Issue
          v-else
          :is-public="isPublic"
          :issuecode="(searchResult as IssueWithIssuecodeOnly).issuecode"
          clickable
        />
      </b-list-group-item>
    </b-list-group>
  </nav>
</template>

<script setup lang="ts">
import type { IssueWithIssuecodeOnly } from "~dm-types/IssueWithIssuecodeOnly";
import type { SimpleStory } from "~dm-types/SimpleStory";
import type { issue } from "~prisma-schemas/schemas/dm";

import { dmSocketInjectionKey } from "../composables/useDmSocket";

const { withTitle = true, isPublic = false } = defineProps<{
  withTitle?: boolean;
  isPublic?: boolean;
}>();
const emit = defineEmits<{
  (e: "issue-selected", story: IssueWithIssuecodeOnly): void;
}>();
const { conditions } = useCondition();

const {
  coa: { services: coaServices },
} = inject(dmSocketInjectionKey)!;

const { findInCollection } = isPublic ? publicCollection() : collection();
const { issues } = storeToRefs(collection());
const { fetchPublicationNames, fetchIssuecodeDetails, fetchCountryNames } =
  coa();
const { issuecodeDetails } = storeToRefs(coa());

const nav = shallowRef<HTMLElement | null>(null);

onClickOutside(nav, () => {
  showSearchResults = false;
});

type SimpleStoryWithOptionalCollectionIssue = SimpleStory & {
  collectionIssue: issue | null;
};

let isSearching = $ref(false);
let pendingSearch = $ref<string | null>(null);
let search = $ref("");
let storyResults = $ref<{
  results: SimpleStoryWithOptionalCollectionIssue[];
  hasMore: boolean;
} | null>(null);

const { t: $t } = useI18n();
const searchContexts = {
  story: $t("titre d'histoire"),
  storycode: $t("code histoire"),
} as const;

let issueResults = $ref<{ results: IssueWithIssuecodeOnly[] }>();
let searchContext = $ref<keyof typeof searchContexts>("story");
let showSearchResults = $ref(true);

const isInCollection = ({ issuecode }: IssueWithIssuecodeOnly) =>
  findInCollection(issuecode) !== undefined;
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
const selectSearchResult = (
  searchResult: SimpleStory | IssueWithIssuecodeOnly,
) => {
  if (isSearchByCode) {
    emit("issue-selected", searchResult as IssueWithIssuecodeOnly);
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
      await fetchIssuecodeDetails(
        issueResults.results.map(({ issuecode }) => issuecode),
      );
      await fetchPublicationNames(
        issueResults.results.map(
          ({ issuecode }) => issuecodeDetails.value[issuecode].publicationcode,
        ),
      );
    } else {
      const data = await coaServices.searchStory(value.split(","), true);
      storyResults = {
        hasMore: data.hasMore,
        results: data.results.map((story) => ({
          ...story,
          collectionIssue:
            issues.value!.find(({ issuecode: collectionIssuecode }) =>
              story.issuecodes.includes(collectionIssuecode),
            ) || null,
        })),
      };
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
    align-items: end;

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
