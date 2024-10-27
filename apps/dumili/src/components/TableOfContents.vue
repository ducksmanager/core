<template>
  <b-card
    no-body
    class="table-of-contents d-flex w-50 h-100 m-0 overflow-auto"
    body-class="flex-grow-1 w-100 h-100"
    @mouseleave="hoveredEntry = null"
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
            >Page {{ pageNumber }}<br /><!--<b-button disabled variant="light"
              ><i-bi-scissors
            /></b-button
            >-->
            <table-tooltip
              :target="`ai-results-page-${pageNumber}`"
              :data="aiKumikoResultPanels" />
            <i-bi-info-circle-fill
              :id="`ai-results-page-${pageNumber}`"
              style="cursor: help"
              @click.stop="() => {}"
          /></b-col>
        </b-row>
      </b-col>
      <b-col :cols="1" class="position-relative p-0">
        <template v-for="(entry, idx) in indexation.entries" :key="entry.id">
          <div style="height: 1px" class="bg-black"></div>
          <vue-draggable-resizable
            :active="hoveredEntry === entry"
            :parent="true"
            prevent-deactivation
            :resizable="true"
            :draggable="false"
            :handles="['bm']"
            :grid="[1, tocPageHeight]"
            :min-height="tocPageHeight - 1"
            :class-name="`entry col w-100 kind-${
              acceptedStoryKinds[entry.id]?.kind
            } ${hoveredEntry === entry ? 'striped' : ''}`"
            :title="`${entry.title || 'Inconnu'} (${getUserFriendlyPageCount(
              entry,
            )})`"
            @mouseover="hoveredEntry = entry"
            @mouseout="hoveredEntry = null"
            @resize-stop="(_left: number,
  _top: number,
  _width: number,
  height: number) => onEntryResizeStop(idx, height)"
            @click="
              if (entry !== currentEntry)
                currentPage = getFirstPageOfEntry(idx);
            "
          ></vue-draggable-resizable>
          <b-button
            v-if="
              indexation.entries.length - 1 === idx &&
              lastHoveredEntry?.id === entry.id
            "
            class="create-entry fw-bold position-absolute w-100 mt-n1 d-flex justify-content-center align-items-center"
            title="Create an entry here"
            variant="info"
            @click="createEntry()"
          >
            Add entry
          </b-button>
        </template>
      </b-col>
      <b-col :cols="10" class="d-flex flex-column" style="padding: 0">
        <b-row
          v-for="(entry, idx) in indexation.entries"
          :key="entry.id"
          :style="currentEntry === entry ? {} : { height: '50px' }"
          class="flex-grow-1 g-0 px-0 py-0 align-items-top border bg-light"
        >
          <b-col
            @click="
              if (entry !== currentEntry)
                currentPage = getFirstPageOfEntry(idx);
            "
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
import useEntryPage from "~/composables/useEntryPage";
import { suggestions } from "~/stores/suggestions";
import { ui } from "~/stores/ui";
import { FullEntry, FullIndexation } from "~dumili-services/indexation/types";
import { entry as entryModel } from "~prisma/client_dumili";

defineProps<{
  shownPages: number[];
}>();

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;

const { acceptedStoryKinds } = storeToRefs(suggestions());
const { hoveredEntry } = storeToRefs(ui());
const indexation = storeToRefs(suggestions()).indexation as Ref<FullIndexation>;
const currentPage = defineModel<number>();

const lastHoveredEntry = ref<entryModel | null>(null);

const { status: aiStatus, runKumiko } = useAi();

const { getFirstPageOfEntry } = useEntryPage(indexation);

const tocPageHeight = 50;

const currentEntry = ref<FullEntry | null>(null);

watch(hoveredEntry, (entry) => {
  if (entry) {
    lastHoveredEntry.value = entry;
  }
});

const onEntryResizeStop = (entryIdx: number, height: number) => {
  indexation.value!.entries[entryIdx].entirepages = Math.max(
    0,
    Math.round(height / tocPageHeight),
  );
};

const getUserFriendlyPageCount = (entry: FullEntry) => {
  const fraction = entry.brokenpagenumerator
    ? `${entry.brokenpagenumerator}/${entry.brokenpagedenominator}`
    : "";
  if (entry.entirepages === 0) {
    if (fraction) {
      return `${fraction} page`;
    } else {
      return "0 page";
    }
  }
  return `${entry.entirepages}${fraction ? `+ ${fraction}` : ""} pages`;
};

const createEntry = () => indexationSocket.value!.services.createEntry();

watch(
  currentPage,
  (value) => {
    if (value !== undefined) {
      let pagesSoFar = 0;
      currentEntry.value = indexation.value.entries.find((entry) => {
        if (pagesSoFar >= value) {
          return true;
        }
        pagesSoFar +=
          entry.entirepages +
          entry.brokenpagenumerator / entry.brokenpagedenominator;
      })!;
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
  }
}

:deep(.resizable .handle) {
  bottom: 0;
}
</style>
