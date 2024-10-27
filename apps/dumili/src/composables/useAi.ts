import { suggestions } from "~/stores/suggestions";
import { storyKinds } from "~dumili-types/storyKinds";
import { socketInjectionKey as dmSocketInjectionKey } from "~web/src/composables/useDmSocket";

import { dumiliSocketInjectionKey } from "./useDumiliSocket";
import useHint from "./useHint";
import useEntryPage from "./useEntryPage";
import { FullIndexation } from "~dumili-services/indexation/types";

const coverStoryKindCode = storyKinds.find(
  ({ label }) => label === "Cover",
)!.code;

export default () => {
  const status = ref<"idle" | "loading" | "loaded">("idle");

  const {
    coverId: { services: coverIdServices },
  } = inject(dmSocketInjectionKey)!;

  const { indexationSocket } = inject(dumiliSocketInjectionKey)!;

  const indexationServices = indexationSocket.value!.services;
  const indexation = storeToRefs(suggestions())
    .indexation as Ref<FullIndexation>;

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
    if (firstEntry?.acceptedStoryKind?.kind === coverStoryKindCode) {
      console.info(
        "La première page est une couverture, on va chercher si on la détecte parmi les résultats de la recherche par image...",
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
    const { getFirstPageOfEntry } = useEntryPage(indexation);
    const storyStoryKindCode = storyKinds.find(
      ({ label }) => label === "Story",
    )!.code;
    const storyFirstPageUrls = indexation
      .value!.entries.filter(
        ({ acceptedStoryKind }) =>
          acceptedStoryKind?.kind === storyStoryKindCode,
      )
      .map(({ id }) => getFirstPageOfEntry(id))
      .map((pageIdx) => indexation.value!.pages[pageIdx].url);
    for (const url of storyFirstPageUrls) {
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
