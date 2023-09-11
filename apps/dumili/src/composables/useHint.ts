import { storeToRefs } from "pinia";

import { coa } from "~/stores/coa";
import {
  IssueSuggestion,
  StoryversionKind,
  suggestions,
} from "~/stores/suggestions";
import { POST__cover_id__search } from "~api-routes";
import { KumikoResults } from "~pulumi-types/KumikoResults";

export default () => {
  const suggestionsStore = suggestions();
  const { acceptedEntries } = storeToRefs(suggestionsStore);
  const coaStore = coa();
  const applyHintsFromKumiko = (results: KumikoResults) => {
    results?.forEach((result, idx) => {
      const entryurl = Object.keys(suggestionsStore.entrySuggestions)[idx];
      const shouldBeAccepted = acceptedEntries.value[entryurl] === undefined;

      if (shouldBeAccepted) {
        const inferredKind =
          result.panels.length === 1
            ? idx === 0
              ? StoryversionKind.Cover
              : StoryversionKind.Illustration
            : StoryversionKind.Story;
        suggestionsStore.acceptSuggestion(
          suggestionsStore.storyversionKindSuggestions[entryurl],
          ({ data }) => data.kind === inferredKind,
          { source: "ai", status: "success" },
          (suggestion) => (suggestion.data.panels = result.panels)
        );
      }
    });
  };

  const applyHintsFromCoverSearch = async (
    results: POST__cover_id__search["resBody"]
  ) => {
    if (!results.covers?.length) {
      console.error("Erreur lors de la recherche par image de la couverture");
      return;
    }
    suggestionsStore.issueSuggestions = results.covers.map(
      ({ issuecode, publicationcode, issuenumber, id: coverId }) =>
        new IssueSuggestion(
          {
            issuecode,
            publicationcode,
            issuenumber,
            coverId,
          },
          {
            source: "ai",
            isAccepted: false,
            status: "success",
          }
        )
    );

    await coaStore.fetchPublicationNames(
      results.covers.map(({ publicationcode }) => publicationcode!)
    );
  };

  const applyHintsFromOcr = () => {
    // suggestionsStore.acceptSuggestion(
    //   suggestionsStore.entrySuggestions[entryurl],
    //   ({ data }) => data.kind === inferredKind,
    //   { source: "ai", status: "success" },
    //   (suggestion) => (suggestion.data.panels = result.panels)
    // );
  };

  return { applyHintsFromKumiko, applyHintsFromCoverSearch, applyHintsFromOcr };
};
