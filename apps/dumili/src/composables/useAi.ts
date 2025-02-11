import { suggestions } from "~/stores/suggestions";
import type { FullIndexation } from "~dumili-services/indexation";
import { COVER } from "~dumili-types/storyKinds";
import { socketInjectionKey as dmSocketInjectionKey } from "~web/src/composables/useDmSocket";

import useHint from "./useHint";

export default () => {
  const { coverId: coverIdEvents } = inject(dmSocketInjectionKey)!;

  const indexation = storeToRefs(suggestions())
    .indexation as Ref<FullIndexation>;

  const hint = useHint();

  const runCoverSearch = async () => {
    const firstEntry = indexation.value!.entries[0];
    if (firstEntry?.acceptedStoryKind?.kind === COVER) {
      console.info(
        "La première page est une couverture, on va chercher si on la détecte parmi les résultats de la recherche par image...",
      );

      const url = indexation.value!.pages[0].image?.url;
      if (!url) {
        alert("La première page n'a pas d'URL");
        return;
      }
      nextTick(async () => {
        coverIdEvents.searchFromCover({ url }).then((results) => {
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

  return {
    runCoverSearch,
  };
};
