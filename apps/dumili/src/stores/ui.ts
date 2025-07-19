import type { FullEntry } from "~dumili-services/indexation";
import { getEntryPages } from "~dumili-utils/entryPages";

import { suggestions } from "./suggestions";

export const ui = defineStore("ui", () => {
  const { indexation } = storeToRefs(suggestions());
  const currentEntry = ref<FullEntry>();
  const currentPage = ref(0);
  const pageHeight = ref(50);
  const overlay = ref<
    | { type: "story kind"; entryId: number }
    | { type: "panels"; pageId: number }
    | {
        type: "ocr" | "panels";
        entryId: number;
      }
  >();

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

  watch(currentEntry, (entry) => {
    if (entry) {
      overlay.value = {
        type: "story kind",
        entryId: entry!.id,
      };
    } else {
      overlay.value = undefined;
    }
  });

  return {
    overlay,
    pageHeight,
    currentPage,
    visiblePages,
    currentEntry,
    currentEntryPageNumbers: computed(
      () =>
        indexation.value &&
        currentEntry.value &&
        getEntryPages(indexation.value, currentEntry.value.id).map(
          ({ pageNumber }) => pageNumber,
        ),
    ),
  };
});
