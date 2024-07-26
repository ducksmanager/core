import { suggestions } from "~/stores/suggestions";
import CoverIdServices from "~dm-services/cover-id/types";
import { EventReturnType } from "~socket.io-services/types";
import { stores as webStores } from "~web";

import { dumiliSocketInjectionKey } from "./useDumiliSocket";

export default () => {
  const { loadIndexation } = suggestions();
  const { indexation } = storeToRefs(suggestions());
  const coaStore = webStores.coa();

  const { getIndexationSocket } = inject(dumiliSocketInjectionKey)!;

  const applyHintsFromCoverSearch = async (
    results: EventReturnType<CoverIdServices["searchFromCover"]>,
  ) => {
    if (!results.covers?.length) {
      console.error("Erreur lors de la recherche par image de la couverture");
      return;
    }
    await Promise.all(
      results.covers.map(
        ({ shortIssuecode, publicationcode, shortIssuenumber /*, id: coverId*/ }) =>
          getIndexationSocket(
            indexation.value!.id,
          ).services.acceptIssueSuggestion({
            source: "ai",
            shortIssuecode,
            publicationcode,
            shortIssuenumber,
            // coverId,
            indexationId: indexation.value!.id,
          }),
      ),
    );

    await loadIndexation(indexation.value!.id);

    await coaStore.fetchPublicationNames(
      results.covers.map(({ publicationcode }) => publicationcode!),
    );
  };

  return {
    applyHintsFromCoverSearch,
  };
};
