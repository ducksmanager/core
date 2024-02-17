import { suggestions } from "~/stores/suggestions";
import CoverIdServices from "~dm-services/cover-id/types";
import { StorySearchResults } from "~dm-types/StorySearchResults";
import { KumikoResult } from "~dumili-types/KumikoResult";
import {
  EntrySuggestion,
  IssueSuggestion,
  StoryversionKind,
} from "~dumili-types/suggestions";
import { EventReturnType } from "~socket.io-services/types";
import { stores as webStores } from "~web";

export default () => {
  const { acceptSuggestion } = suggestions();
  const { acceptedEntries, entries, issueSuggestions, storyversionKinds } =
    storeToRefs(suggestions());
  const coaStore = webStores.coa();
  const applyHintsFromKumiko = (results: KumikoResult[]) => {
    results?.forEach((result, idx) => {
      const { url: entryurl } = entries.value[idx];
      const shouldBeAccepted = acceptedEntries.value[entryurl] === undefined;

      if (shouldBeAccepted) {
        const inferredKind =
          result.panels.length === 1
            ? idx === 0
              ? StoryversionKind.Cover
              : StoryversionKind.Illustration
            : StoryversionKind.Story;
        const suggestions = storyversionKinds.value.find(
          ({ url: thisUrl }) => thisUrl === entryurl
        )!.suggestions;
        acceptSuggestion(
          suggestions,
          ({ data }) => data.kind === inferredKind,
          { source: "ai", status: "success" },
          (suggestion) => (suggestion.data.panels = result.panels)
        );
      }
    });
  };

  const applyHintsFromCoverSearch = async (
    results: EventReturnType<CoverIdServices["searchFromCover"]>
  ) => {
    if (!results.covers?.length) {
      console.error("Erreur lors de la recherche par image de la couverture");
      return;
    }
    issueSuggestions.value = results.covers.map(
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

  const applyHintsFromKeywordSearch = (
    entryurl: string,
    results: StorySearchResults["results"]
  ) => {
    const entryIndex = entries.value.findIndex(({ url }) => url === entryurl);
    entries.value[entryIndex].suggestions = results.map(
      ({ storycode, title }) =>
        new EntrySuggestion(
          {
            storyversion: {
              storycode,
            },
            title,
          },
          {
            source: "ai",
            isAccepted: false,
            status: "success",
          }
        )
    );
  };

  return {
    applyHintsFromKumiko,
    applyHintsFromCoverSearch,
    applyHintsFromKeywordSearch,
  };
};
