import { KumikoResults } from "../../types/KumikoResults";
import { issueDetails } from "../stores/issueDetails";

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
          ? (entries[idx].storyversion!.kind = idx === 0 ? "c" : "i")
          : (entries[idx].storyversion!.kind = "n");
      }
    });
  };

  return { applyHintsFromKumiko };
};
