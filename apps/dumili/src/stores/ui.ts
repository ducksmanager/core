import type { FullEntry } from "~dumili-services/indexation";
import { getEntryFromPage, getEntryPages } from "~dumili-utils/entryPages";

import { suggestions } from "./suggestions";

export const ui = defineStore("ui", () => {
  const { indexation } = storeToRefs(suggestions());
  const hoveredEntry = ref<FullEntry | null>(null);
  const currentEntry = ref<FullEntry>();
  const currentPage = ref(0);
  const pageHeight = ref(50);

  const visiblePages = ref<Set<number>>(new Set());

  watch(currentPage, () => {
    if (!indexation.value) {
      visiblePages.value = new Set();
      return;
    }
    const leftPage = 2 * Math.floor((currentPage.value - 1) / 2) + 1;
    visiblePages.value = new Set(
      (currentPage.value === 0 ||
      currentPage.value === indexation.value.pages.length - 1
        ? [currentPage.value]
        : [leftPage, leftPage + 1]
      ).map((idx) => indexation.value!.pages[idx].id),
    );
  });

  watch(
    indexation,
    () => {
      currentEntry.value = getEntryFromPage(indexation.value!, 0)!;
    },
    { once: true },
  );

  return {
    showAiDetectionsOn: ref<{ type: "page" | "entry"; id: number } | undefined>(
      undefined,
    ),
    pageHeight,
    currentPage,
    visiblePages,
    currentEntry,
    hoveredEntry,
    hoveredEntryPageNumbers: computed(
      () =>
        indexation.value &&
        hoveredEntry.value &&
        getEntryPages(indexation.value, hoveredEntry.value.id).map(
          ({ pageNumber }) => pageNumber,
        ),
    ),
  };
});
