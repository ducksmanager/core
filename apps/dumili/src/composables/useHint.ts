import { suggestions } from "~/stores/suggestions";
import CoverIdServices from "~dm-services/cover-id/types";
import { EventReturnType } from "~socket.io-services/types";
import { stores as webStores } from "~web";

import { getIndexationSocket } from "./useDumiliSocket";

export default () => {
  const { loadIndexation } = suggestions();
  const { indexation } = storeToRefs(suggestions());
  const coaStore = webStores.coa();

  const applyHintsFromCoverSearch = async (
    results: EventReturnType<CoverIdServices["searchFromCover"]>
  ) => {
    if (!results.covers?.length) {
      console.error("Erreur lors de la recherche par image de la couverture");
      return;
    }
    Promise.all(
      results.covers.map(
        ({ issuecode, publicationcode, issuenumber /*, id: coverId*/ }) =>
          getIndexationSocket(indexation.value!.id).acceptIssueSuggestion({
            source: "ai",
            issuecode,
            publicationcode,
            issuenumber,
            // coverId,
            indexationId: indexation.value!.id,
          })
      )
    );

    await loadIndexation(indexation.value!.id);

    await coaStore.fetchPublicationNames(
      results.covers.map(({ publicationcode }) => publicationcode!)
    );
  };

  return {
    applyHintsFromCoverSearch,
  };
};
