<template>
  <b-card
    no-body
    class="table-of-contents d-flex w-50 h-100 m-0 overflow-auto"
    body-class="flex-grow-1 w-100 h-100"
    @mouseleave="showCreateEntryButtonAfter = null"
  >
    <template #header>
      <IssueSuggestionModal />
      <IssueSuggestionList />
      <div>
        <b-button
          variant="success"
          pill
          class="ms-2 hint"
          :class="aiStatus"
          :disabled="aiStatus === 'loading'"
          @click="runKumiko()"
        >
          <i-bi-lightbulb-fill
        /></b-button></div
    ></template>

    <b-row>
      <b-col :cols="1" style="padding: 0">
        <b-row
          v-for="{ id, pageNumber, aiKumikoResultPanels } in indexation.pages"
          :key="id"
          style="height: 50px"
          :variant="currentPage === pageNumber ? 'secondary' : 'light'"
          class="g-0 px-0 py-0 align-items-center border"
        >
          <b-col
            role="button"
            :class="{
              'fw-bold': shownPages.includes(pageNumber - 1),
            }"
            @click="currentPage = pageNumber - 1"
            >Page {{ pageNumber }}<br /><b-button disabled variant="light"
              ><i-bi-scissors
            /></b-button>
            <table-tooltip
              :target="`ai-results-page-${pageNumber}`"
              :data="aiKumikoResultPanels" />
            <i-bi-info-circle-fill
              :id="`ai-results-page-${pageNumber}`"
              @click.stop="() => {}"
          /></b-col>
        </b-row>
      </b-col>
      <b-col :cols="1" class="position-relative p-0">
        <template
          v-for="({ entry, pageIds }, idx) in entryPages"
          :key="entry.url"
        >
          <vue-draggable-resizable
            active
            prevent-deactivation
            :resizable="!isEntryGoingUntilEndOfBook(pageIds)"
            :draggable="false"
            :handles="['bm']"
            :grid="[1, tocPageHeight]"
            w="auto"
            :h="tocPageHeight * pageIds.length"
            :max-height="tocPageHeight * pageIds.length"
            :min-height="tocPageHeight"
            :class-name="`col w-100 kind-${acceptedStoryKinds[entry.id]?.kind}`"
            :title="`${entry.title || 'Inconnu'} (${pageIds.length} pages)`"
            @mouseover="showCreateEntryButtonAfter = entry"
          ></vue-draggable-resizable>
          <button
            v-if="showCreateEntryButtonAfter?.id === entry.id"
            class="create-entry mt-1 fw-bold position-absolute w-100 start-0 d-flex justify-content-center align-items-center"
            @click="createEntry(idx)"
          >
            &plus;
          </button>
        </template>
      </b-col>
      <b-col :cols="10" class="d-flex flex-column" style="padding: 0">
        <b-row
          v-for="(entry, idx) in indexation.entries"
          :key="entry.id"
          :style="currentPage === idx ? {} : { height: '50px' }"
          class="flex-grow-1 g-0 px-0 py-0 align-items-top border bg-light"
        >
          <b-col @click="currentPage = idx"
            ><Entry
              :entry="entry"
              :editable="
                entry.entryPages
                  .map(({ pageId }) =>
                    shownPages
                      .map((shownPage) => indexation.pages[shownPage].id)
                      .includes(pageId)
                  )
                  .includes(true)
              "
          /></b-col>
        </b-row>
      </b-col>
    </b-row>
  </b-card>
</template>

<script setup lang="ts">
import useAi from "~/composables/useAi";
import { getIndexationSocket } from "~/composables/useDumiliSocket";
import { suggestions } from "~/stores/suggestions";
import { FullIndexation } from "~dumili-services/indexations/types";
import { entry as entryModel } from "~prisma/client_dumili";

defineProps<{
  shownPages: number[];
}>();
const { acceptedStoryKinds } = storeToRefs(suggestions());
const indexation = storeToRefs(suggestions()).indexation as Ref<FullIndexation>;
const currentPage = defineModel<number>();

const { status: aiStatus, runKumiko } = useAi(indexation.value.id);

const tocPageHeight = 50;

const showCreateEntryButtonAfter = ref<entryModel | null>(null);

const entryPages = ref<{ entry: entryModel; pageIds: number[] }[]>([]);

const isEntryGoingUntilEndOfBook = (pageIds: number[]) =>
  pageIds[pageIds.length - 1] ===
  indexation.value.pages[indexation.value.pages.length - 1].id;

watch(
  indexation,
  ({ entries }) => {
    entryPages.value = entries.map((entry) => ({
      entry,
      pageIds: entry.entryPages.map(({ pageId }) => pageId),
    }));
  },
  { immediate: true }
);

const createEntry = async (idx: number) => {
  const entries: { id?: number; pageIds: number[] }[] =
    indexation.value.entries.map(({ id, entryPages }) => ({
      id,
      pageIds: entryPages.map(({ pageId }) => pageId),
    }));
  entries.splice(idx + 1, 0, {
    pageIds: [indexation.value.pages[0].id],
  });
  await getIndexationSocket(indexation.value.id).upsertEntries(entries);
};
</script>

<style scoped lang="scss">
.table-of-contents {
  background-color: #eee;
  color: black;
  white-space: nowrap;

  .hint {
    svg {
      color: #999;
    }
    &:hover,
    &.loaded {
      svg {
        color: yellow;
      }
    }
    &.loading {
      svg {
        animation: pulse-yellow 2s infinite;
      }
    }
  }

  .card-header {
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
    opacity: 0.5;
    height: 50px;
    &:last-child {
      bottom: 0px;
    }
  }
}

:deep(.resizable .handle) {
  bottom: -5px;
}
</style>