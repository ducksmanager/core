import { suggestions } from "~/stores/suggestions";
import type { ClientEvents as CoverIdServices } from "~dm-services/cover-id";

import { dumiliSocketInjectionKey } from "./useDumiliSocket";
import type { EventOutput } from "~socket.io-services/index";

export default () => {
  const { loadIndexation } = suggestions();
  const { fetchIssuecodeDetails, fetchPublicationNames } = coa();
  const { issuecodeDetails } = storeToRefs(coa());

  const { indexationSocket } = inject(dumiliSocketInjectionKey)!;

  const applyHintsFromCoverSearch = async (
    results: EventOutput<CoverIdServices, "searchFromCover">,
  ) => {
    if ("error" in results || !results.covers?.length) {
      console.error("Erreur lors de la recherche par image de la couverture");
      return;
    }
    await Promise.all(
      results.covers.map(({ issuecode }) =>
        indexationSocket.value!.services.createIssueSuggestion({
          ai: true,
          ...issuecodeDetails.value[issuecode]!,
        }),
      ),
    );

    await loadIndexation();

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
