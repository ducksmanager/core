import type { FullEntry } from "~dumili-services/indexation/types";
import { getEntryFromPage, getEntryPages } from "~dumili-utils/entryPages";

import { suggestions } from "./suggestions";

export const ui = defineStore("ui", () => {
  const { indexation } = storeToRefs(suggestions());
  const hoveredEntry = ref<FullEntry | null>(null);
  const currentEntry = ref<FullEntry>();

  watch(
    indexation,
    () => {
      currentEntry.value = getEntryFromPage(indexation.value!, 0)!;
    },
    { once: true },
  );

  return {
    showAiDetectionsOn: ref<number | undefined>(undefined),
    selectedPageNumber: ref<number | undefined>(undefined),
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
