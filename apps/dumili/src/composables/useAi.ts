import { suggestions } from "~/stores/suggestions";
import { storyKinds } from "~dumili-types/storyKinds";

import { getIndexationSocket } from "./useDumiliSocket";
import useHint from "./useHint";

const coverStoryKindCode = storyKinds.find(
  ({ label }) => label === "Cover"
)!.code;

export default (indexationId: string) => {
  const status = ref<"idle" | "loading" | "loaded">("idle");

  const indexationServices = getIndexationSocket(indexationId);
  const { indexation, entriesFirstPages } = storeToRefs(suggestions());

  const hint = useHint();

  const runKumiko = async () => {
    status.value = "loading";
    nextTick(async () => {
      console.log("Kumiko...");
      const result = await indexationServices.runKumiko();
      if ("error" in result) {
        console.error(result.error);
      } else {
        console.log("Kumiko OK");
        await indexationServices.loadIndexation();
      }
      status.value = "idle";
    });
  };

  const runCoverSearch = async () => {
    const firstEntry = indexation.value!.entries[0];
    if (firstEntry?.acceptedSuggestedStoryKind?.kind === coverStoryKindCode) {
      console.info(
        "La première page est une couverture, on va chercher si on la détecte parmi les résultats de la recherche par image..."
      );

      const url = indexation.value!.pages[0].url;
      nextTick(async () => {
        coverIdServices.searchFromCover({ url }).then((results) => {
          if ("error" in results) {
            console.error(results.error);
          } else {
            hint.applyHintsFromCoverSearch(results);
          }
          console.log("Recherche par image terminée");
        });
      });
    } else {
      console.warn("La première page n'est pas une couverture");
    }
  };

  const runStorycodeOcr = async () => {
    const storyStoryKindCode = storyKinds.find(
      ({ label }) => label === "Story"
    )!.code;
    const storiesFirstPages = entriesFirstPages.value.filter(
      ({ entryId }) =>
        indexation.value?.entries[entryId].acceptedSuggestedStoryKind?.kind ===
        storyStoryKindCode
    );
    for (const { startsAtPage } of storiesFirstPages.filter(
      ({ entryId }) =>
        indexation.value?.entries[entryId].acceptedSuggestedStoryKind?.kind ===
        storyStoryKindCode
    )) {
      const url = indexation.value!.pages.find(
        ({ pageNumber }) => pageNumber === startsAtPage
      )!.url;
      const ocrResults = await indexationServices.runOcr(url);

      if ("error" in ocrResults) {
        console.error(ocrResults.error);
        return;
      }
      console.log(`${url} : Recherche par OCR terminée`);
    }
  };

  return {
    status,
    runCoverSearch,
    runKumiko,
    runStorycodeOcr,
  };
};
