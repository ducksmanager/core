import { suggestions } from "~/stores/suggestions";
import type { FullIndexation } from "~dumili-services/indexation/types";
import { storyKinds } from "~dumili-types/storyKinds";
import { socketInjectionKey as dmSocketInjectionKey } from "~web/src/composables/useDmSocket";

import { getFirstPageOfEntry } from "../../utils/entryPages";
import { dumiliSocketInjectionKey } from "./useDumiliSocket";
import useHint from "./useHint";

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
      const result = await Promise.all(
        indexation.value.entries.map((entry) =>
          indexationServices.runKumiko(entry.id),
        ),
      );
      const resultsWithErrors = result.filter((result) => "error" in result);
      if (resultsWithErrors.length) {
        console.error(resultsWithErrors);
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
    const storyStoryKindCode = storyKinds.find(
      ({ label }) => label === "Story",
    )!.code;
    const storyFirstPageUrls = indexation
      .value!.entries.filter(
        ({ acceptedStoryKind }) =>
          acceptedStoryKind?.kind === storyStoryKindCode,
      )
      .map(({ id }) => getFirstPageOfEntry(indexation.value, id))
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
