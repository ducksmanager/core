import { ai as aiStore } from "~/stores/ai";
import { suggestions } from "~/stores/suggestions";
import { StoryversionKind } from "~dumili-types/suggestions";
import { composables } from "~web";

import { getIndexationSocket } from "./useDumiliSocket";
import useHintMaker from "./useHint";

const coaServices = composables.useDmSocket.coaServices;

export default (indexationId: string) => {
  const status = ref<"idle" | "loading" | "loaded">("idle");

  const { aiDetails } = storeToRefs(aiStore());
  const indexationServices = getIndexationSocket(indexationId);
  const { indexation, acceptedStories, acceptedStoryKinds } = storeToRefs(
    suggestions()
  );

  const hint = useHintMaker();

  const runKumiko = async () => {
    status.value = "loading";
    nextTick(async () => {
      console.log("Kumiko...");
      const { data } = await indexationServices.getKumikoResults();

      console.log("Kumiko OK");
      if (data?.length) {
        hint.applyHintsFromKumiko(data);

        for (const { filename, panels } of data) {
          aiDetails.value[filename] = {
            ...(aiDetails.value[filename] || {}),
            panels: panels.map((panel) => ({ bbox: panel })),
          };
        }
      }
    });
  };

  const runCoverSearch = async () => {
    const firstEntry = indexation.value!.entries[0];
    if (
      firstEntry?.acceptedSuggestedStoryKind?.kind === StoryversionKind.Cover
    ) {
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
    const storiesFirstPages: { entryId: number; startsAtPage: number }[] = [];

    let pageCounter = 0;
    for (const [entryId, acceptedStory] of Object.entries(
      acceptedStories.value
    )) {
      const storyKind = acceptedStoryKinds.value[entryId]!.kind;
      if (storyKind === StoryversionKind.Story) {
        storiesFirstPages.push({
          entryId: parseInt(entryId),
          startsAtPage: pageCounter,
        });
      }
      pageCounter += Math.max(1, acceptedStory?.storyversion.entirepages || 1);
    }

    for (const { startsAtPage, entryId } of storiesFirstPages) {
      const url = indexation.value!.pages[startsAtPage].url;
      const ocrResults = await indexationServices.getOcrResults(url);

      if ("error" in ocrResults) {
        console.error(ocrResults.error);
        return;
      }
      console.log(`${url} : Recherche par OCR terminée`);

      try {
        const possibleStories = (
          await coaServices.searchStory(
            ocrResults.data.map(({ text }) => text),
            false
          )
        ).results;

        hint.applyHintsFromKeywordSearch(url, possibleStories);

        for (const { storycode } of possibleStories) {
          await indexationServices.createStorySuggestion({
            entryId,
            source: "ai",
            storyversioncode: storycode,
            ocrResults: JSON.stringify(ocrResults.data),
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        console.log(`${url} : Recherche d'histoire par mots-clés terminée`);
      }
    }
  };

  return { status, runCoverSearch, runKumiko, runStorycodeOcr };
};
