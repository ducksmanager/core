import { suggestions } from "~/stores/suggestions";
import type CoverIdServices from "~dm-services/cover-id/types";
import type { EventReturnType } from "~socket.io-services";

import { dumiliSocketInjectionKey } from "./useDumiliSocket";

export default () => {
  const { loadIndexation } = suggestions();
  const { indexation } = storeToRefs(suggestions());
  const { fetchIssuecodeDetails, fetchPublicationNames } = coa();
  const { issuecodeDetails } = storeToRefs(coa());

  const { indexationSocket } = inject(dumiliSocketInjectionKey)!;

  const applyHintsFromCoverSearch = async (
    results: EventReturnType<CoverIdServices["searchFromCover"]>,
  ) => {
    if (!results.covers?.length) {
      console.error("Erreur lors de la recherche par image de la couverture");
      return;
    }
    await Promise.all(
      results.covers.map(({ issuecode }) =>
        indexationSocket.value!.services.createIssueSuggestion({
          source: "ai",
          ...issuecodeDetails.value[issuecode]!,
        }),
      ),
    );

    await loadIndexation(indexation.value!.id);

    await fetchIssuecodeDetails(
      results.covers.map(({ issuecode }) => issuecode!),
    );

    await fetchPublicationNames(
      results.covers.map(
        ({ issuecode }) => issuecodeDetails.value[issuecode]!.publicationcode,
      ),
    );
  };

  return {
    applyHintsFromCoverSearch,
  };
};
