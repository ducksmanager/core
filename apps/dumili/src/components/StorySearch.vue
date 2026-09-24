<template>
  <div class="d-flex align-items-top w-100">
    <b-dropdown variant="dark" class="col col-2">
      <b-dropdown-item @click="searchType = 'byStoryTitle'">{{
        $t("Par titre d'histoire")
      }}</b-dropdown-item>
      <b-dropdown-item @click="searchType = 'byStoryCode'">{{
        $t("Par code histoire")
      }}</b-dropdown-item>
      <template #button-content>
        {{
          searchType === "byStoryTitle"
            ? $t("Par titre d'histoire")
            : $t("Par code histoire")
        }}
      </template>
    </b-dropdown>
    <div class="position-relative col col-10">
      <b-form-input
        v-model="search"
        autofocus
        :placeholder="$t('Rechercher une histoire')"
      />
      <ul v-if="storyResults && !isSearching" class="search-results">
        <li v-if="!storyResults.length" class="no-results">
          {{ $t("Aucun résultat.") }}
        </li>
        <li
          v-for="searchResult in storyResults"
          :key="searchResult.storycode"
          class="search-result"
          @click="emit('story-selected', searchResult.storycode)"
        >
          <StoryWithImage :storycode="searchResult.storycode">
            <template #prefix>
              <story-kind-badge :kind="searchResult.kind as storyKind" />
            </template>
          </StoryWithImage>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { socketInjectionKey as dmSocketInjectionKey } from "~web/src/composables/useDmSocket";
import type { SuccessfulEventOutput } from "socket-call-client";
import type { ClientEvents as CoaServices } from "~dm-services/coa";
import type { storyKind } from "~prisma/client_dumili/enums";

const { coa: coaEvents } = inject(dmSocketInjectionKey)!;

const { storyUrls } = storeToRefs(coa());

// const { kind = undefined } = defineProps<{
//   kind?: storyKind;
// }>();

const emit = defineEmits<{
  (e: "story-selected", storycode: string): void;
}>();

let isSearching = ref(false);
let pendingSearch = ref<string>();
let search = ref("");
let storyResults =
  ref<
    SuccessfulEventOutput<
      CoaServices,
      "getFullStoriesFromKeywords" | "searchStoryByStorycode"
    >["stories"]
  >();

const searchType = ref<"byStoryTitle" | "byStoryCode">("byStoryTitle");

watch(searchType, () => {
  search.value = "";
  storyResults.value = undefined;
});

const { t: $t } = useI18n();

const runSearch = async (value: string) => {
  isSearching.value = true;
  try {
    const response =
      searchType.value === "byStoryTitle"
        ? await coaEvents.getFullStoriesFromKeywords(value.split(" "))
        : await coaEvents.searchStoryByStorycode(value);
    if ("error" in response) {
      console.error(response.error);
      storyResults.value = [];
    } else {
      storyResults.value = response.stories;
      for (const searchResult of response.stories) {
        storyUrls.value[searchResult.storycode] = searchResult.url;
      }
    }
  } finally {
    isSearching.value = false;
    // The input value has changed since the beginning of the search, searching again
    if (value !== pendingSearch.value) {
      await runSearch(pendingSearch.value!);
    }
  }
};

watch(search, async (newValue) => {
  if (newValue) {
    pendingSearch.value = newValue;
    if (!isSearching.value) await runSearch(newValue);
  }
});
</script>

<style scoped lang="scss">
.search-results {
  // Same containing block as the input, so `width: 100%` is the input's width.
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  z-index: 5;

  max-height: 16rem;
  overflow-y: auto;

  margin: 0;
  padding: 0;
  list-style: none;
  background: #eee;
  border: 1px solid #888;
  border-radius: 0 0 0.25rem 0.25rem;
}

.search-result {
  height: 7rem;
  overflow: hidden;
  padding: 0.25rem;
  border-bottom: 1px solid #ccc;
  color: #333;
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #ddd;
  }
}

.no-results {
  padding: 0.5rem;
  color: #666;
}
</style>
