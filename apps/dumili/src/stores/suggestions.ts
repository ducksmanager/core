import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import type { FullIndexation } from "~dumili-services/indexation/types";
import type { issueSuggestion } from "~prisma/client_dumili";
import { ui } from "./ui";

export const suggestions = defineStore("suggestions", () => {
  const { indexationSocket, setIndexationSocketFromId } = inject(
    dumiliSocketInjectionKey,
  )!;
  const indexation = ref<FullIndexation>();

  const loadIndexation = async (indexationId?: string) => {
    setIndexationSocketFromId(indexationId || indexation.value!.id);
    const currentEntryId = ui().currentEntry?.id;
    const data = await indexationSocket.value!.services.loadIndexation();
    if ("error" in data) {
      console.error(data.error);
      return;
    }
    indexation.value = data.indexation;
    if (currentEntryId) {
      ui().currentEntry = indexation.value!.entries.find(
        ({ id }) => id === currentEntryId,
      );
    }
  };

  const createIssueSuggestion = async (
    suggestion: Pick<
      issueSuggestion,
      "publicationcode" | "issuenumber" | "issuecode" | "isChosenByAi"
    >,
  ) => indexationSocket.value!.services.createIssueSuggestion(suggestion);

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
