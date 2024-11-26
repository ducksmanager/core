import { suggestions } from "~/stores/suggestions";
import type { FullIndexation } from "~dumili-services/indexation/types";
import { COVER } from "~dumili-types/storyKinds";
import { socketInjectionKey as dmSocketInjectionKey } from "~web/src/composables/useDmSocket";

import { dumiliSocketInjectionKey } from "./useDumiliSocket";
import useHint from "./useHint";

export default () => {
  const status = ref<"idle" | "loading" | "loaded">("idle");

  const {
    coverId: { services: coverIdServices },
  } = inject(dmSocketInjectionKey)!;

  const { indexationSocket } = inject(dumiliSocketInjectionKey)!;

  const indexationServices = indexationSocket.value!.services;
  const { loadIndexation } = suggestions();
  const indexation = storeToRefs(suggestions())
    .indexation as Ref<FullIndexation>;

  const hint = useHint();

  const runKumiko = async (entryId?: number) => {
    status.value = "loading";
    console.log("Kumiko...");
    const result = await Promise.all(
      indexation.value.entries
        .filter(({ id }) => entryId === undefined || id === entryId)
        .map((entry) => indexationServices.runKumiko(entry.id)),
    );
    const resultsWithErrors = result.filter((result) => "error" in result);
    if (resultsWithErrors.length) {
      console.error(resultsWithErrors);
    } else {
      console.log("Kumiko OK");
    }
    await loadIndexation();
    status.value = "idle";
  };

  const runKumikoOnPage = async (pageId: number) => {
    status.value = "loading";
    console.log("Kumiko...");
    await indexationServices.runKumikoOnPage(pageId);
    await loadIndexation();
    status.value = "idle";
  };

  const runCoverSearch = async () => {
    const firstEntry = indexation.value!.entries[0];
    if (firstEntry?.acceptedStoryKind?.kind === COVER) {
      console.info(
        "La première page est une couverture, on va chercher si on la détecte parmi les résultats de la recherche par image...",
      );

      const url = indexation.value!.pages[0].url;
      if (!url) {
        alert("La première page n'a pas d'URL");
        return;
      }
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

  const runStorycodeOcr = async (entryId?: number) => {
    status.value = "loading";
    console.log("OCR...");
    const result = await Promise.all(
      indexation.value.entries
        .filter(({ id }) => entryId === undefined || id === entryId)
        .map((entry) => indexationServices.runOcr(entry.id)),
    );
    const resultsWithErrors = result.filter(
      (result) => "error" in result && result.error === "OCR error",
    );
    if (resultsWithErrors.length) {
      console.error(resultsWithErrors);
    } else {
      console.log("OCR OK");
    }
    await loadIndexation();
    status.value = "idle";
  };

  return {
    status,
    runCoverSearch,
    runKumiko,
    runKumikoOnPage,
    runStorycodeOcr,
  };
};
