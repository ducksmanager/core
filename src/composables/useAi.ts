import { storeToRefs } from "pinia";

import { StoryversionKind, suggestions } from "~/stores/suggestions";
import { defaultApi } from "~/util/api";
import { Boundaries, KumikoResults } from "~types/KumikoResults";

import useHintMaker from "./useHint";

export type BoundariesWithText = {
  bbox: Boundaries;
  text: string;
}[];

export default () => {
  const status = ref("idle" as "idle" | "loading" | "loaded");

  const aiDetails = ref(
    {} as Record<
      string /* entry URL */,
      {
        panels: Omit<BoundariesWithText[0], "text">[];
        texts: BoundariesWithText;
      }
    >
  );

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
      .map(([url, suggestionsForEntry]) =>
        suggestionsForEntry.some(
          ({ data, meta }) =>
            meta.isAccepted && data.kind === StoryversionKind.Story
        )
          ? url
          : undefined
      )
      .filter((url) => url !== undefined)
      .reduce(
        (acc, url) => ({ ...acc, [url as string]: [] }),
        {} as Record<string, BoundariesWithText>
      );
    for (const url of Object.keys(storyFirstPages)) {
      const { data } = await defaultApi
        .get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/cloudinary/indexation/${indexationId}/ai/tesseract/${url}`
        )
        .catch((e) => {
          console.error(e);
          return { data: [] };
        })
        .finally(() => {
          console.log("Recherche par OCR terminée");
          status.value = "loaded";
        });
      storyFirstPages[url] = data;
    }

    for (const [url, ocrResult] of Object.entries(storyFirstPages)) {
      aiDetails.value[url] = {
        ...(aiDetails.value[url] || {}),
        texts: ocrResult,
      };
    }
    status.value = "loaded";
  };

  return { status, aiDetails, runCoverSearch, runKumiko, runStorycodeOcr };
};
