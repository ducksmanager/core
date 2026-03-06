<template>
  <div class="d-flex align-items-top w-100">
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
      <datalist v-if="storyResults && !isSearching">
        <option v-if="!storyResults.length">
          {{ $t("Aucun résultat.") }}
        </option>
        <b-dropdown-item
          v-for="searchResult in storyResults"
          :key="searchResult.storycode"
          link-class="h-100p"
          class="d-flex align-items-center"
          @click="emit('story-selected', searchResult.storycode)"
        >
          <StoryWithImage :storycode="searchResult.storycode">
            <template #prefix>
              <story-kind-badge :kind="searchResult.kind as storyKind" />
            </template>
          </StoryWithImage>
        </b-dropdown-item>
      </datalist>
    </ul>
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
datalist {
  $margin: calc(var(--bs-gutter-x) * 0.5);
  display: block;
  position: absolute;
  width: calc(100% - #{$margin});
  margin: 26px $margin;
  left: 0;
  background: #eee;
  padding-left: 0;

  :deep(.dropdown-item) {
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
