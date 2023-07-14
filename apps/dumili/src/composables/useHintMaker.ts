import { POST__cover_id__search } from "ducksmanager/types/routes";
import { KumikoResults } from "~types/KumikoResults";
import { StoryversionKind, issueDetails } from "~/stores/issueDetails";

export default () => {
  const issueDetailsStore = issueDetails();
  const applyHintsFromKumiko = (results: KumikoResults) => {
    const entries = issueDetailsStore.entries;
    results.forEach((result, idx) => {
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

  const applyHintsFromCoverSearch = (
    results: POST__cover_id__search["resBody"]
  ) => {
    if (!results.covers?.length) {
      console.error("Erreur lors de la recherche par image de la couverture");
      return;
    }
    for (const result of results.covers) {
      issueDetailsStore.issue.issuecode = result.issuecode;
      issueDetailsStore.issue.publicationcode = result.publicationcode;
      issueDetailsStore.issue.issuenumber = result.issuenumber;
    }
  };

  return { applyHintsFromKumiko, applyHintsFromCoverSearch };
};
