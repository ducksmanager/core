import axios from "axios";
import { storeToRefs } from "pinia";
import { call } from "web/src/util/axios";

import { ai as aiStore, BoundariesWithText } from "~/stores/ai";
import { StoryversionKind, suggestions } from "~/stores/suggestions";
import { defaultApi } from "~/util/api";
import { POST__coa__stories__search__withIssues } from "~api-routes";
import { KumikoResults } from "~pulumi-types/KumikoResults";

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

      status.value = "loaded";
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

      status.value = "loading";
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
            status.value = "loaded";
          });
        hint.applyHintsFromCoverSearch(data);
        status.value = "loaded";
      });
    } else {
      console.warn("La première page n'est pas une couverture");
    }
  };

  const runStorycodeOcr = async (indexationId: string) => {
    status.value = "loading";

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
          .get<BoundariesWithText>(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/cloudinary/indexation/${indexationId}/ai/ocr/${url}`
          )
          .catch((e) => {
            console.error(e);
            return { data: [] };
          })
          .finally(() => {
            console.log("Recherche par OCR terminée");
            status.value = "loaded";
          })
      ).data;

      const possibleStories = (
        await call(
          axios,
          new POST__coa__stories__search__withIssues({
            reqBody: {
              keywords: ocrResults.map(({ text }) => text).join(","),
            },
          })
        )
      ).data;

      aiDetails.value[url!].texts = {
        ocrResults,
        possibleStories,
      };
    }
    status.value = "loaded";
  };

  return { status, runCoverSearch, runKumiko, runStorycodeOcr };
};
