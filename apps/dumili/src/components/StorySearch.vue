<template>
  <ul class="navbar-nav">
    <b-form-input
      v-model="search"
      list="search"
      :placeholder="$t('Rechercher une histoire')"
    />
    <datalist v-if="storyResults?.results && !isSearching">
      <option v-if="!storyResults.results.length">
        {{ $t("Aucun résultat.") }}
      </option>
      <option
        v-for="searchResult in storyResults.results"
        :key="searchResult!.storycode"
        class="d-flex align-items-center"
        @click="selectSearchResult(searchResult!)"
      >
        {{ searchResult!.title }}
      </option>
    </datalist>
  </ul>
</template>

<script setup lang="ts">
import type { SimpleStory } from "~dm-types/SimpleStory";
import { socketInjectionKey as dmSocketInjectionKey } from "~web/src/composables/useDmSocket";

const {
  coa: { services: coaServices },
} = inject(dmSocketInjectionKey)!;

const emit = defineEmits<{
  (e: "story-selected", searchResult: SimpleStory): void;
}>();

let isSearching = ref(false);
let pendingSearch = ref<string>();
let search = ref("");
let storyResults = ref<{
  results: SimpleStory[];
  hasMore: boolean;
}>();

const { t: $t } = useI18n();
const selectSearchResult = (searchResult: SimpleStory) => {
  emit("story-selected", searchResult);
};
const runSearch = async (value: string) => {
  isSearching.value = true;
  try {
    storyResults.value = await coaServices.searchStory(value.split(" "), false);
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
datalist {
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
</style>
