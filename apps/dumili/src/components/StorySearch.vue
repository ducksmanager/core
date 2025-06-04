<template>
  <div class="d-flex align-items-top">
    <b-dropdown variant="dark">
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
    <ul class="navbar-nav mw-100 z-4">
      <b-form-input
        v-model="search"
        autofocus
        list="search"
        :placeholder="$t('Rechercher une histoire')"
      />
      <datalist v-if="storyResults?.results && !isSearching" class="mw-100">
        <option v-if="!storyResults.results.length">
          {{ $t("Aucun résultat.") }}
        </option>
        <option
          v-for="searchResult in storyResults.results"
          :key="searchResult!.storycode"
          class="d-flex align-items-center"
          @click="selectSearchResult(searchResult!)"
        >
          {{ searchResult.storycode }}&nbsp;{{ searchResult.title }}
        </option>
      </datalist>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { SimpleStory } from "~dm-types/SimpleStory";
import { socketInjectionKey as dmSocketInjectionKey } from "~web/src/composables/useDmSocket";
import type { EventOutput } from "socket-call-client";
import type { ClientEvents as CoaServices } from "~dm-services/coa";

const { coa: coaEvents } = inject(dmSocketInjectionKey)!;

const emit = defineEmits<{
  (e: "story-selected", searchResult: SimpleStory): void;
}>();

let isSearching = ref(false);
let pendingSearch = ref<string>();
let search = ref("");
let storyResults = ref<EventOutput<CoaServices, "searchStory">>();

const searchType = ref<"byStoryTitle" | "byStoryCode">("byStoryTitle");

watch(searchType, () => {
  search.value = "";
});

const { t: $t } = useI18n();
const selectSearchResult = (searchResult: SimpleStory) => {
  emit("story-selected", searchResult);
};
const runSearch = async (value: string) => {
  isSearching.value = true;
  try {
    if (searchType.value === "byStoryTitle") {
      storyResults.value = await coaEvents.searchStory(value.split(" "), false);
    } else {
      storyResults.value = await coaEvents.searchStoryByStorycode(value);
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
input {
  min-width: 300px;
}
datalist {
  display: block;
  position: relative;
  background: #eee;
  min-width: 300px;
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
</style>
