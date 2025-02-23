<template>
  <b-card
    no-body
    class="table-of-contents d-flex w-100 h-100 m-0 p-0"
    body-class="flex-grow-1 w-100 h-100"
    header-class="position-relative p-0"
    @mouseleave="hoveredEntry = undefined"
  >
    <template #header>
      <IssueSuggestionModal />
      <IssueSuggestionList />
      <b-dropdown
        v-if="indexation.acceptedIssueSuggestion"
        variant="light"
        class="position-absolute h-100 end-0 d-flex"
        style="z-index: 1030"
      >
        <template #button-content>{{ $t("Méta-données") }}</template>
        <b-form @submit.prevent="updateIndexation">
          <b-dropdown-item
            >{{ $t("Prix") }}
            <input
              v-model="indexation.price"
              type="text"
              @click.stop="() => {}"
          /></b-dropdown-item>
          <b-dropdown-item
            >{{ $t("Nombre de pages") }}
            <input
              :value="numberOfPages"
              type="number"
              min="4"
              max="996"
              step="2"
              @click.stop="updateNumberOfPages"
              @blur.stop="updateNumberOfPages"
          /></b-dropdown-item>
          <b-dropdown-item>
            <b-button type="submit" variant="primary">{{ $t("OK") }}</b-button>
          </b-dropdown-item>
        </b-form>
      </b-dropdown>
      <!-- <div>
        <ai-tooltip
          id="ai-issue-suggestion"
          :status="issueAiSuggestion?.issuecode ? 'success' : 'idle'"
          :on-click-rerun="() => runKumikoOnPage(1)"
        /></div
    > -->
    </template>

    <b-row
      style="outline: 1px solid black"
      class="overflow-y-auto overflow-x-hidden w-100 m-1"
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
      <b-col :cols="11" class="position-relative p-0">
        <template
          v-for="(entry, idx) in indexation.entries"
          :key="indexation.entries[idx].id"
        >
          <div class="position-absolute w-100 d-flex justify-content-center">
            <b-button
              v-if="hasEntryGapWithNext(idx)"
              class="create-entry fw-bold position-absolute mx-md-n5 d-flex justify-content-center align-items-center"
              :style="{
                top: `${pageHeight * (entry.position + entry.entirepages - 1)}px`,
              }"
              variant="success"
              @click="createEntry(entry.position + entry.entirepages)"
              >{{ $t("Ajouter une entrée") }}</b-button
            >
          </div>
          <TableOfContentsEntry
            v-model="indexation.entries[idx]"
            @on-entry-resize-stop="($event) => onEntryResizeStop(idx, $event)"
            @on-entry-drag-stop="($event) => onEntryDragStop(idx, $event)"
          />
        </template>
      </b-col>
    </b-row>
  </b-card>
</template>

<script setup lang="ts">
import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import { getEntryFromPage } from "~dumili-utils/entryPages";
import { suggestions } from "~/stores/suggestions";
import { ui } from "~/stores/ui";
import type { FullIndexation } from "~dumili-services/indexation";
import TableOfContentsEntry from "./TableOfContentsEntry.vue";

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;

const { hoveredEntry, currentEntry } = storeToRefs(ui());
const indexation = storeToRefs(suggestions()).indexation as Ref<FullIndexation>;
const { currentPage, pageHeight } = storeToRefs(ui());

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
  },
});

const hasEntryGapWithNext = (entryIdx: number) => {
  const entry = indexation.value.entries[entryIdx];
  const nextEntry = indexation.value.entries[entryIdx + 1];
  return nextEntry && entry.position + entry.entirepages < nextEntry.position;
};

const updateNumberOfPages = (event: Event) => {
  numberOfPages.value = parseInt((event.target as HTMLInputElement).value);
};

const onEntryResizeStop = (entryIdx: number, height: number) => {
  indexation.value!.entries[entryIdx].entirepages = Math.max(
    0,
    Math.round(height / pageHeight.value),
  );
};

const onEntryDragStop = (entryIdx: number, y: number) => {
  indexation.value!.entries[entryIdx].position = 1 + y / pageHeight.value;
};

const createEntry = async (position: number) => {
  await indexationSocket.value!.createEntry(position);
};

const updateIndexation = () => {
  const { price } = indexation.value;
  indexationSocket.value!.updateIndexation({
    price,
    numberOfPages: numberOfPages.value,
  });
};

watch(
  currentPage,
  (value) => {
    if (indexation.value && value !== undefined) {
      currentEntry.value = getEntryFromPage(
        indexation.value,
        indexation.value.pages.find(
          ({ pageNumber }) => pageNumber === value + 1,
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
  z-index: 1021 !important;
}
</style>
