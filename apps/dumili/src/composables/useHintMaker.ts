import { POST__cover_id__search } from "ducksmanager/types/routes";
import { storeToRefs } from "pinia";

import { coa } from "~/stores/coa";
import {
  EntrySuggestion,
  issueDetails,
  StoryversionKind,
} from "~/stores/issueDetails";
import { KumikoResults } from "~types/KumikoResults";

export default () => {
  const issueDetailsStore = issueDetails();
  const { acceptedEntries } = storeToRefs(issueDetailsStore);
  const coaStore = coa();
  const applyHintsFromKumiko = (results: KumikoResults) => {
    results?.forEach((result, idx) => {
      const entryurl = Object.keys(issueDetailsStore.entrySuggestions)[idx];
      const shouldBeAccepted = acceptedEntries.value[entryurl] === undefined;
      const newEntrySuggestion: EntrySuggestion = {
        type: "ai",
        storyversion: {
          kind:
            result.panels.length === 1
              ? idx === 0
                ? StoryversionKind.Cover
                : StoryversionKind.Illustration
              : StoryversionKind.Story,
        },
      };
      if (shouldBeAccepted) {
        issueDetailsStore.rejectAllEntrySuggestions(entryurl);
        newEntrySuggestion.isAccepted = true;
      }
      issueDetailsStore.entrySuggestions[entryurl].push(newEntrySuggestion);
    });
  };

  const applyHintsFromCoverSearch = async (
    results: POST__cover_id__search["resBody"]
  ) => {
    if (!results.covers?.length) {
      console.error("Erreur lors de la recherche par image de la couverture");
      return;
    }
    issueDetailsStore.issueSuggestions = results.covers.map((cover) => ({
      isAccepted: undefined,
      coverId: cover.id,
      issuecode: cover.issuecode,
      publicationcode: cover.publicationcode,
      issuenumber: cover.issuenumber,
      type: "ai",
    }));

    await coaStore.fetchPublicationNames([
      ...results.covers.map(({ publicationcode }) => publicationcode!),
    ]);
  };

  return { applyHintsFromKumiko, applyHintsFromCoverSearch };
};
