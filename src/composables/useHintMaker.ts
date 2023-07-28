import { POST__cover_id__search } from "ducksmanager/types/routes";

import { coa } from "~/stores/coa";
import { issueDetails, StoryversionKind } from "~/stores/issueDetails";
import { KumikoResults } from "~types/KumikoResults";

export default () => {
  const issueDetailsStore = issueDetails();
  const coaStore = coa();
  const applyHintsFromKumiko = (results: KumikoResults) => {
    const entries = issueDetailsStore.entries;
    results?.forEach((result, idx) => {
      if (entries[idx]) {
        if (!entries[idx].storyversion) {
          entries[idx].storyversion = {};
        }
        result.panels.length === 1
          ? (entries[idx].storyversion!.kind =
              idx === 0
                ? StoryversionKind.Cover
                : StoryversionKind.Illustration)
          : (entries[idx].storyversion!.kind = StoryversionKind.Story);
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
    issueDetailsStore.issueSuggestions = results.covers.map((cover) => ({
      accepted: undefined,
      coverId: cover.id,
      issuecode: cover.issuecode,
      publicationcode: cover.publicationcode,
      issuenumber: cover.issuenumber,
      isAi: true,
    }));

    await coaStore.fetchPublicationNames([
      ...results.covers.map(({ publicationcode }) => publicationcode!),
    ]);
  };

  return { applyHintsFromKumiko, applyHintsFromCoverSearch };
};
