import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import type { FullIndexation } from "~dumili-services/indexation";
import { getEntryFromPage } from "~dumili-utils/entryPages";
import type { issueSuggestion } from "~prisma/client_dumili/client";

import { ui } from "./ui";

export const suggestions = defineStore("suggestions", () => {
  const { indexationSocket, setIndexationSocketFromId } = inject(
    dumiliSocketInjectionKey,
  )!;
  const indexation = ref<FullIndexation>();

  const loadIndexation = async (indexationId?: string) => {
    const uiStore = ui();
    setIndexationSocketFromId(indexationId || indexation.value!.id);
    indexationSocket.value!._connect();
    indexationSocket.value!.indexationUpdated = (newIndexation) => {
      indexation.value = newIndexation;
      if (uiStore.currentEntry) {
        uiStore.currentEntry = newIndexation.entries.find(
          (entry) => entry.id === uiStore.currentEntry!.id,
        );
      } else {
        uiStore.currentEntry = getEntryFromPage(
          indexation.value!,
          indexation.value!.pages[0].id,
        )!;
      }
    };
  };

  const createIssueSuggestion = async (
    suggestion: Pick<issueSuggestion, "publicationcode" | "issuenumber">,
  ) => indexationSocket.value!.createIssueSuggestion(suggestion);

  const acceptedIssue = computed({
    get: () => indexation.value?.acceptedIssueSuggestion,
    set: (value) => (indexation.value!.acceptedIssueSuggestion = value!),
  });

  return {
    indexation,
    loadIndexation,
    createIssueSuggestion,
    hasPendingIssueSuggestions: computed(
      () => false, //pendingIssueSuggestions.value.length
    ),
    acceptedIssue,
  };
});
