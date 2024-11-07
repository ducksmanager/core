import type { FullIndexation } from "~dumili-services/indexation/types";
import { getEntryPages } from "~dumili-utils/entryPages";

import { suggestions } from "./suggestions";

export const ui = defineStore("ui", () => {
  const hoveredEntry = ref<FullIndexation["entries"][number] | null>(null);
  return {
    showAiDetectionsOn: ref<number | undefined>(undefined),
    hoveredEntry,
    hoveredEntryPageNumbers: computed(
      () =>
        suggestions().indexation &&
        hoveredEntry.value &&
        getEntryPages(suggestions().indexation!, hoveredEntry.value.id).map(
          ({ pageNumber }) => pageNumber,
        ),
    ),
  };
});
