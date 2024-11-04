<template>
  <b-card
    no-body
    class="table-of-contents d-flex w-100 h-100 m-0 overflow-auto"
    body-class="flex-grow-1 w-100 h-100"
    @mouseleave="hoveredEntry = null"
  >
    <template #header>
      <IssueSuggestionModal />
      <IssueSuggestionList />
      <div>
        <ai-tooltip
          id="ai-issue-suggestion"
          :value="issueAiSuggestion?.issuecode"
          :status="aiStatus"
          :on-click-rerun="() => runKumiko()"
        /></div
    ></template>

    <b-row style="outline: 1px solid black">
      <b-col :cols="1" style="padding: 0">
        <b-row
          v-for="{
            id,
            pageNumber,
            aiKumikoResultPanels,
            aiKumikoInferredStoryKind,
          } in indexation.pages"
          :key="id"
          :style="{ height: `${pageHeight}px` }"
          class="g-0 px-0 py-0 align-items-center page"
        >
          <b-col
            role="button"
            :class="{
              'fw-bold': shownPages.includes(pageNumber - 1),
            }"
            @click="currentPage = pageNumber - 1"
            >Page {{ pageNumber
            }}<!--<b-button disabled variant="light"
              ><i-bi-scissors
            /></b-button
            >-->
            <ai-tooltip
              v-if="aiKumikoResultPanels"
              :id="`ai-results-page-${pageNumber}`"
              :value="aiKumikoInferredStoryKind"
              :on-click-rerun="() => runKumikoOnPage(id)"
            >
              <b>Detected panels</b>
              <table-results
                :data="
                  aiKumikoResultPanels.map(({ x, y, width, height }) => ({
                    x,
                    y,
                    width,
                    height,
                  }))
                "
              />
              <b>Inferred page story kind</b>
              {{
                storyKinds.find(
                  ({ code }) => code === aiKumikoInferredStoryKind,
                )?.label || "?"
              }}
            </ai-tooltip>
          </b-col>
        </b-row>
      </b-col>
      <b-col :cols="1" class="position-relative p-0">
        <template v-for="(entry, idx) in indexation.entries" :key="entry.id">
          <vue-draggable-resizable
            :active="hoveredEntry === entry"
            :parent="true"
            prevent-deactivation
            :resizable="true"
            :draggable="false"
            :handles="['bm']"
            :grid="[1, pageHeight]"
            :h="entry.entirepages * pageHeight"
            :min-height="pageHeight - 1"
            :class-name="`entry col w-100 kind-${acceptedStoryKinds?.[entry.id]?.kind} ${hoveredEntry === entry && 'striped'} ${currentEntry?.id === entry.id && 'current'}`"
            :title="`${entry.title || 'Inconnu'} (${getUserFriendlyPageCount(
              entry,
            )})`"
            @mouseover="hoveredEntry = entry"
            @mouseout="hoveredEntry = null"
            @resize-stop="
              (_left: number, _top: number, _width: number, height: number) =>
                onEntryResizeStop(idx, height)
            "
            @click="currentEntry = entry"
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
          class="entry-details"
          :class="{ current: currentEntry === entry }"
          :style="{
            height: `${getEntryPages(indexation, entry.id).length * pageHeight}px`,
          }"
        >
          <b-col class="d-flex" @click="currentEntry = entry"
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
import {
  getEntryFromPage,
  getEntryPages,
  getFirstPageOfEntry,
} from "~dumili-utils/entryPages";
import { suggestions } from "~/stores/suggestions";
import { ui } from "~/stores/ui";
import { FullEntry, FullIndexation } from "~dumili-services/indexation/types";
import { entry as entryModel } from "~prisma/client_dumili";
import { storyKinds } from "~dumili-types/storyKinds";

defineProps<{
  shownPages: number[];
}>();

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;

const { loadIndexation } = suggestions();
const { acceptedStoryKinds } = storeToRefs(suggestions());
const { hoveredEntry } = storeToRefs(ui());
const indexation = storeToRefs(suggestions()).indexation as Ref<FullIndexation>;
const currentPage = defineModel<number>();

const { runKumikoOnPage, runKumiko } = useAi();

const lastHoveredEntry = ref<entryModel | null>(null);

const { status: aiStatus } = useAi();

const pageHeight = 50;

const currentEntry = ref<FullEntry>(getEntryFromPage(indexation.value!, 0)!);

const issueAiSuggestion = computed(() =>
  indexation.value.issueSuggestions.find(({ isChosenByAi }) => isChosenByAi),
);

watch(hoveredEntry, (entry) => {
  if (entry) {
    lastHoveredEntry.value = entry;
  }
});

const onEntryResizeStop = (entryIdx: number, height: number) => {
  indexation.value!.entries[entryIdx].entirepages = Math.max(
    0,
    Math.round(height / pageHeight),
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

const createEntry = async () => {
  await indexationSocket.value!.services.createEntry();
  return loadIndexation();
};

watch(currentEntry, (entry) => {
  if (entry) {
    currentPage.value = getFirstPageOfEntry(
      indexation.value!.entries,
      entry.id,
    );
  }
});

watch(
  currentPage,
  (value) => {
    if (indexation.value && value !== undefined) {
      currentEntry.value = getEntryFromPage(
        indexation.value,
        indexation.value.pages.find(
          ({ pageNumber }) => pageNumber === value + 1,
        )!.id,
      )!;
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
  }
}

:deep(.entry) {
  outline: 1px solid black;
  margin-top: 1px;
  cursor: pointer;

  &.current {
    outline-width: 2px;
  }

  &:first-child {
    margin-top: 0;
  }
}

.entry-details {
  &.current {
    width: 100%;
    position: relative;
    .col {
      align-items: start;
      position: absolute;
      box-shadow: 0px 35px 5px -4px;
      color: rgba(238, 238, 238, 0.85);
      left: 9px;
    }
  }
}

:deep(.resizable .handle) {
  bottom: 0;
}
</style>
