<template>
  <b-card
    no-body
    class="table-of-contents d-flex w-100 h-100 m-0 p-1 py-2"
    body-class="flex-grow-1 w-100 h-100"
    @mouseleave="hoveredEntry = null"
  >
    <template #header>
      <IssueSuggestionModal />
      <IssueSuggestionList />
      <b-dropdown
        v-if="indexation.acceptedIssueSuggestion"
        variant="light"
        class="position-absolute m-4 top-0 end-0"
        style="z-index: 1030"
      >
        <template #button-content>{{ $t("Méta-données") }}</template>
        <b-dropdown-item
          >{{ $t("Prix") }}
          <input v-model="indexation.price" type="text" @click.stop="() => {}"
        /></b-dropdown-item>
        <b-dropdown-item
          >{{ $t("Nombre de pages") }}
          <input
            :value="numberOfPages"
            type="number"
            min="4"
            max="996"
            @click.stop="updateNumberOfPages"
            @blur.stop="updateNumberOfPages"
        /></b-dropdown-item>
      </b-dropdown>
      <div>
        <ai-tooltip
          id="ai-issue-suggestion"
          :status="issueAiSuggestion?.issuecode ? 'success' : 'idle'"
          :on-click-rerun="() => runKumikoOnPage(1)"
        /></div
    ></template>

    <b-row
      style="outline: 1px solid black"
      class="overflow-y-auto overflow-x-hidden w-100 m-0"
    >
      <b-col :cols="1" style="padding: 0">
        <b-row
          v-for="page in indexation.pages"
          :key="page.id"
          :style="{ height: `${pageHeight}px` }"
          class="g-0 px-0 py-0 align-items-center page outline"
        >
          <TableOfContentsPage :page="page" />
        </b-row>
      </b-col>
      <b-col :cols="1" class="position-relative p-0">
        <template v-for="(entry, idx) in indexation.entries" :key="entry.id">
          <TableOfContentsEntry
            :entry="entry"
            @on-entry-resize-stop="onEntryResizeStop(idx, $event)"
            @create-entry-after="createEntry"
          />
        </template>
      </b-col>
      <b-col :cols="10" class="d-flex flex-column" style="padding: 0">
        <b-row
          v-for="(entry, idx) in indexation.entries"
          :key="entry.id"
          class="entry-details"
          :class="{ current: currentEntry === entry }"
          :style="{
            height: `${getEntryPages(indexation, entry.id).length * pageHeight}px`,
          }"
        >
          <b-col class="d-flex sticky-top" @click="currentEntry = entry"
            ><Entry
              v-model="indexation.entries[idx]"
              :editable="currentEntry === entry"
          /></b-col>
        </b-row>
      </b-col>
    </b-row>
  </b-card>
</template>

<script setup lang="ts">
import useAi from "~/composables/useAi";
import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import { getEntryFromPage, getEntryPages } from "~dumili-utils/entryPages";
import { suggestions } from "~/stores/suggestions";
import { ui } from "~/stores/ui";
import { FullIndexation } from "~dumili-services/indexation/types";
import { watchDebounced } from "@vueuse/core";
import TableOfContentsEntry from "./TableOfContentsEntry.vue";

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;

const { loadIndexation } = suggestions();
const { hoveredEntry, currentEntry } = storeToRefs(ui());
const indexation = storeToRefs(suggestions()).indexation as Ref<FullIndexation>;
const { currentPage, pageHeight } = storeToRefs(ui());

const { runKumikoOnPage } = useAi();

const { t: $t } = useI18n();

const numberOfPages = computed({
  get: () => indexation.value.pages.length,
  set: async (value) => {
    if (value < numberOfPages.value) {
      if (
        !confirm(
          $t(
            "Vous êtes sur le point de supprimer les {numberOfPagesToDelete} dernières pages de l'indexation. Êtes-vous sûr(e) ?",
            { numberOfPagesToDelete: numberOfPages.value - value },
          ),
        )
      ) {
        numberOfPages.value = indexation.value.pages.length;
        return;
      }
    }
    indexationSocket.value!.services.updateNumberOfPages(value);
    await loadIndexation();
  },
});

const issueAiSuggestion = computed(() =>
  indexation.value.issueSuggestions.find(({ isChosenByAi }) => isChosenByAi),
);

const updateNumberOfPages = (event: Event) => {
  numberOfPages.value = parseInt((event.target as HTMLInputElement).value);
};

const onEntryResizeStop = (entryIdx: number, height: number) => {
  indexation.value!.entries[entryIdx].entirepages = Math.max(
    0,
    Math.round(height / pageHeight.value),
  );
};

const createEntry = async () => {
  await indexationSocket.value!.services.createEntry();
  return loadIndexation();
};

watchDebounced(
  () => JSON.stringify([indexation.value.price]),
  () => {
    if (indexation.value.price) {
      const { price } = indexation.value;
      indexationSocket.value!.services.updateIndexation({
        price,
      });
    }
  },
  { debounce: 500, maxWait: 1000 },
);

watch(
  currentPage,
  (value) => {
    if (indexation.value && value !== undefined) {
      currentEntry.value = indexation.value.entries.find(
        ({ id }) =>
          id ===
          getEntryFromPage(
            indexation.value,
            indexation.value.pages.find(
              ({ pageNumber }) => pageNumber === value + 1,
            )!.id,
          )!.id,
      );
    }
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.table-of-contents {
  background-color: #eee;
  color: black;
  white-space: nowrap;

  :deep(.card-header) {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    :deep(a),
    :deep(h6) {
      color: #666;
    }

    h3 {
      margin: 6px 6px 0 6px;
      text-align: center;
    }
  }

  .col-auto {
    width: 100%;
  }

  :deep(ul) {
    overflow-x: auto;
  }

  :deep(.tab-content) {
    display: none;
  }

  button.create-entry {
    height: 25px;
    z-index: 10;
  }
}

.entry-details {
  z-index: 1;
  &.current {
    width: 100%;
    z-index: 2;
    position: relative;
    .col {
      align-items: start;
      position: absolute;
      backdrop-filter: blur(5px);
      left: 10px;
      width: calc(100% - 2px);
      padding-bottom: 1rem;

      $background: rgba(238, 238, 238, 0.85);
      box-shadow: 0px 35px 5px -4px;
      color: #{$background};

      border-top: 1px solid lightgray;
      border-bottom: 1px solid lightgray;
    }
  }
}

:deep(.resizable .handle) {
  bottom: 0;
}
</style>
