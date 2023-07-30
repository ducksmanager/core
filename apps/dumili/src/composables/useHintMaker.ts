import { POST__cover_id__search } from "ducksmanager/types/routes";
import { storeToRefs } from "pinia";

import { coa } from "~/stores/coa";
import {
  IssueSuggestion,
  StoryversionKind,
  suggestions,
} from "~/stores/suggestions";
import { KumikoResults } from "~types/KumikoResults";

export default () => {
  const issueDetailsStore = suggestions();
  const { acceptedEntries } = storeToRefs(issueDetailsStore);
  const coaStore = coa();
  const applyHintsFromKumiko = (results: KumikoResults) => {
    results?.forEach((result, idx) => {
      const entryurl = Object.keys(issueDetailsStore.entrySuggestions)[idx];
      const shouldBeAccepted = acceptedEntries.value[entryurl] === undefined;

      if (shouldBeAccepted) {
        const inferredKind =
          result.panels.length === 1
            ? idx === 0
              ? StoryversionKind.Cover
              : StoryversionKind.Illustration
            : StoryversionKind.Story;
        issueDetailsStore.acceptSuggestion(
          issueDetailsStore.storyversionKindSuggestions[entryurl],
          (suggestion) => suggestion.kind === inferredKind
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
    issueDetailsStore.issueSuggestions = results.covers.map(
      (cover) =>
        new IssueSuggestion(
          {
            issuecode: cover.issuecode,
            publicationcode: cover.publicationcode,
            issuenumber: cover.issuenumber,
          },
          {
            type: "ai",
            isAccepted: false,
          },
          cover.id
        )
    );

    await coaStore.fetchPublicationNames([
      ...results.covers.map(({ publicationcode }) => publicationcode!),
    ]);
  };

  return { applyHintsFromKumiko, applyHintsFromCoverSearch };
};
