import { suggestions } from "~/stores/suggestions";
import type CoverIdServices from "~dm-services/cover-id/types";
import type { EventReturnType } from "~socket.io-services/types";
import { stores as webStores } from "~web";

import { dumiliSocketInjectionKey } from "./useDumiliSocket";

export default () => {
  const { loadIndexation } = suggestions();
  const { indexation } = storeToRefs(suggestions());
  const { fetchIssuecodeDetails, fetchPublicationNames } = webStores.coa();
  const { issuecodeDetails } = storeToRefs(webStores.coa());

  const { indexationSocket } = inject(dumiliSocketInjectionKey)!;

  const applyHintsFromCoverSearch = async (
    results: EventReturnType<CoverIdServices["searchFromCover"]>,
  ) => {
    if (!results.covers?.length) {
      console.error("Erreur lors de la recherche par image de la couverture");
      return;
    }
    await Promise.all(
      results.covers.map(({ issuecode /*, id: coverId*/ }) =>
        indexationSocket.value!.services.acceptIssueSuggestion({
          source: "ai",
          issuecode,
          // coverId,
          indexationId: indexation.value!.id,
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
