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

  const hint = useHintMaker();

  const { acceptedStoryversionKinds: acceptedStoryKinds, storyversionKinds } =
    storeToRefs(suggestions());

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
    if (acceptedStoryKinds.value[0]?.data?.kind === StoryversionKind.Cover) {
      console.info(
        "La première page est une couverture, on va chercher si on la détecte parmi les résultats de la recherche par image..."
      );

      const url = storyversionKinds.value[0].url;
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
    const storyFirstPages = storyversionKinds.value
      .filter(({ suggestions: suggestionsForEntry }) =>
        suggestionsForEntry.some(
          ({ data, meta }) =>
            meta.isAccepted && data.kind === StoryversionKind.Story
        )
      )
      .map(({ url }) => url);

    for (const url of storyFirstPages) {
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

        aiDetails.value[url!].texts = {
          ocrResults: ocrResults.data,
          possibleStories: possibleStories.map(({ storycode, title }) => ({
            storyversion: {
              storycode,
            },
            title,
          })),
        };
      } catch (e) {
        console.error(e);
      } finally {
        console.log(`${url} : Recherche d'histoire par mots-clés terminée`);
      }
    }
  };

  return { status, runCoverSearch, runKumiko, runStorycodeOcr };
};
