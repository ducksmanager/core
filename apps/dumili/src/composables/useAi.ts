import axios from "axios";
import { storeToRefs } from "pinia";

import { ai as aiStore } from "~/stores/ai";
import { StoryversionKind, suggestions } from "~/stores/suggestions";
import { defaultApi } from "~/util/api";
import { POST__coa__stories__search } from "~api-routes";
import { call } from "~axios-helper";
import { KumikoResults } from "~dumili-types/KumikoResults";
import { OcrResult } from "~dumili-types/OcrResults";

import useHintMaker from "./useHint";

export default () => {
  const status = ref("idle" as "idle" | "loading" | "loaded");

  const aiDetails = storeToRefs(aiStore()).aiDetails;

  const hint = useHintMaker();

  const {
    acceptedStoryversionKinds: acceptedStoryKinds,
    entrySuggestions,
    storyversionKindSuggestions,
  } = storeToRefs(suggestions());

  const runKumiko = async (indexationId: string) => {
    status.value = "loading";
    nextTick(async () => {
      console.log("Kumiko...");
      const { data }: { data: KumikoResults } = await defaultApi
        .get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/cloudinary/indexation/${indexationId}/ai/kumiko`
        )
        .catch((e) => {
          console.error(e);
          return { data: [] };
        });

      console.log("Kumiko OK");
      if (data.length) {
        hint.applyHintsFromKumiko(data);
      }

      for (const { filename, panels } of data) {
        aiDetails.value[filename] = {
          ...(aiDetails.value[filename] || {}),
          panels: panels.map((panel) => ({ bbox: panel })),
        };
      }
    });
  };

  const runCoverSearch = async (indexationId: string) => {
    if (
      acceptedStoryKinds.value[Object.keys(entrySuggestions)[0]]?.data?.kind ===
      StoryversionKind.Cover
    ) {
      console.info(
        "La première page est une couverture, on va chercher si on la détecte parmi les résultats de la recherche par image..."
      );

      nextTick(async () => {
        const { data } = await defaultApi
          .get(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/cloudinary/indexation/${indexationId}/ai/cover-search`
          )
          .catch((e) => {
            console.error(e);
            return { data: { results: [] } };
          })
          .finally(() => {
            console.log("Recherche par image terminée");
          });
        hint.applyHintsFromCoverSearch(data);
      });
    } else {
      console.warn("La première page n'est pas une couverture");
    }
  };

  const runStorycodeOcr = async (indexationId: string) => {
    const storyFirstPages = Object.entries(storyversionKindSuggestions.value)
      .filter(([, suggestionsForEntry]) =>
        suggestionsForEntry.some(
          ({ data, meta }) =>
            meta.isAccepted && data.kind === StoryversionKind.Story
        )
      )
      .map(([url]) => url);

    for (const url of storyFirstPages) {
      const ocrResults = (
        await defaultApi
          .get<OcrResult[]>(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/cloudinary/indexation/${indexationId}/ai/ocr/${url}`
          )
          .catch((e) => {
            console.error(e);
            return { data: [] };
          })
          .finally(() => {
            console.log(`${url} : Recherche par OCR terminée`);
          })
      ).data;

      try {
        const possibleStories = (
          await call(
            axios,
            new POST__coa__stories__search({
              reqBody: {
                keywords: ocrResults.map(({ text }) => text).join(","),
              },
            })
          )
        ).data.results.results;

        hint.applyHintsFromKeywordSearch(url, possibleStories);

        aiDetails.value[url!].texts = {
          ocrResults,
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
