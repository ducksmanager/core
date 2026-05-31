import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import type { FullIndexation } from "~dumili-services/indexation";
import { getEntryFromPage } from "~dumili-utils/entryPages";
import type { issueSuggestion } from "~prisma/client_dumili/client";

import { ui } from "./ui";
import { socketInjectionKey as dmSocketInjectionKey } from "~web/src/composables/useDmSocket";

export const suggestions = defineStore("suggestions", () => {
  const { indexationSocket, setIndexationSocketFromId } = inject(
    dumiliSocketInjectionKey,
  )!;
  const { coa: coaEvents } = inject(dmSocketInjectionKey)!;
  const indexation = ref<FullIndexation>();
  const languagecode = ref<string>();

  const loadIndexation = async (indexationId?: string) => {
    const uiStore = ui();
    setIndexationSocketFromId(indexationId || indexation.value!.id);
    indexationSocket.value!._connect();
    indexationSocket.value!.indexationUpdated = async (newIndexation) => {
      indexation.value = newIndexation;
      languagecode.value = newIndexation.acceptedIssueSuggestion
        ?.publicationcode
        ? (await coaEvents.getPublicationLanguagecode(
            newIndexation.acceptedIssueSuggestion.publicationcode,
          )) || undefined
        : undefined;
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
    languagecode,
    loadIndexation,
    createIssueSuggestion,
    hasPendingIssueSuggestions: computed(
      () => false, //pendingIssueSuggestions.value.length
    ),
    acceptedIssue,
  };
});
