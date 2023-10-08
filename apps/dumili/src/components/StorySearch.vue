<template>
  <ul class="navbar-nav">
    <b-form-input
      v-model="search"
      list="search"
      :placeholder="$t('Rechercher une histoire')"
    />
    <datalist v-if="storyResults.results && !isSearching">
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
import axios from "axios";
import { watch } from "vue";
import { useI18n } from "vue-i18n";

import { POST__coa__stories__search } from "~api-routes";
import { call } from "~axios-helper";
import { SimpleStory } from "~dm-types/SimpleStory";

const emit = defineEmits<{
  (e: "story-selected", story: Pick<SimpleStory, "storycode" | "title">): void;
}>();

let isSearching = ref(false as boolean);
let pendingSearch = ref(null as string | null);
let search = ref("" as string);
let storyResults = ref(
  {} as {
    results: SimpleStory[];
    hasMore: boolean;
  },
);

const { t: $t } = useI18n();
const selectSearchResult = (searchResult: SimpleStory) => {
  const { storycode, title } = searchResult;
  emit("story-selected", { storycode, title });
};
const runSearch = async (value: string) => {
  isSearching.value = true;
  try {
    const data = (
      await call(
        axios,
        new POST__coa__stories__search({
          reqBody: { keywords: value },
        }),
      )
    ).data;
    storyResults.value.results = data.results.results;
  } finally {
    isSearching.value = false;
    // The input value as changed since the beginning of the search, searching again
    if (value !== pendingSearch.value) {
      await runSearch(pendingSearch.value!);
    }
  }
};

watch(
  () => search.value,
  async (newValue) => {
    if (newValue) {
      pendingSearch.value = newValue;
      if (!isSearching.value) await runSearch(newValue);
    }
  },
);
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
