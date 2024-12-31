import axios from "axios";

import { prisma } from "~/index";
import type { aiKumikoResultPanel, Prisma } from "~/prisma/client_dumili";
import { COVER, ILLUSTRATION, STORY } from "~dumili-types/storyKinds";
import { getEntryFromPage } from "~dumili-utils/entryPages";

import type { FullIndexation } from "./types";
import { IndexationSocket } from ".";

type KumikoResult = {
  filename: string;
  size: number[];
  background: string;
  gutters: number[];
  panels: [number, number, number, number][];
};

type KumikoProcessedResult = Pick<
  aiKumikoResultPanel,
  "x" | "y" | "width" | "height"
>;

const inferStoryKindFromAiResults = (
  panelsOfPage: KumikoProcessedResult[],
  pageNumber: number,
) =>
  pageNumber === 1 ? COVER : panelsOfPage.length === 1 ? ILLUSTRATION : STORY;

const runKumikoOnPage = async (
  indexationSocket: IndexationSocket,
  page: Prisma.pageGetPayload<{
    include: { image: { include: { aiKumikoResult: true } } };
  }>,
  force: boolean,
) => {
  if (!page.image) {
    console.info(`Kumiko: page ${page.pageNumber}: no image`);
  } else if (page.image.aiKumikoResult && !force) {
    console.info(`Kumiko: page ${page.pageNumber}: already inferred`);
  } else {
    indexationSocket.emit("setKumikoInferredPageStoryKinds", page.id);
    const panelsPerPage = await runKumiko([page.image.url]);
    const panelsOfPage = panelsPerPage[0];
    console.info(
      `Kumiko: page ${page.pageNumber}: detected ${panelsOfPage.length} panels`,
    );

    const inferredStoryKind = inferStoryKindFromAiResults(
      panelsOfPage,
      page.pageNumber,
    );

    console.log(
      `Kumiko: page ${page.pageNumber}: inferred story kind is ${inferredStoryKind}`,
    );

    await prisma.image.update({
      include: {
        aiKumikoResult: {
          include: {
            detectedPanels: true,
          },
        },
      },
      data: {
        aiKumikoResult: {
          upsert: {
            create: {
              inferredStoryKind: inferredStoryKind,
              detectedPanels: {
                createMany: {
                  data: panelsOfPage,
                },
              }
            },
            update: {
              inferredStoryKind: inferredStoryKind,
              detectedPanels: {
                deleteMany: {},
                createMany: {
                  data: panelsOfPage,
                },
              }
            }
          },
        },
      },
      where: {
        id: page.image.id,
      },
    });

    indexationSocket.emit("setKumikoInferredPageStoryKindsEnd", page.id);
    return true;
  }
  return false;
};

export const runKumikoOnPages = async (
  socket: IndexationSocket,
  indexation: FullIndexation,
  force = false,
) => {
  let updatedImageIds = []
  for (const page of indexation.pages) {
    if (await runKumikoOnPage(socket, page, force)) {
      updatedImageIds.push(page.id);
    }
  }

  const outdatedEntryIds = new Set(updatedImageIds
    .map((id ) => getEntryFromPage(indexation, id)?.id)
    .filter((id) => !!id)
    .map((id) => id!))

    if (!outdatedEntryIds.size) {
      return
    }

  // Invalidate story kind suggestions for entries whose pages have been updated
  await prisma.storyKindSuggestionAi.deleteMany({
    where: {
      storyKindSuggestion: {
        entry: {
          id: {
            in: outdatedEntryIds.values().toArray(),
          },
        },
      },
    },
  });

  // Invalidate story suggestions for entries whose pages have been updated
  await prisma.storySuggestionAi.deleteMany({
    where: {
      storySuggestion: {
        entry: {
          id: {
            in: outdatedEntryIds.values().toArray(),
          },
        },
      },
    },
  });
};

export const runKumiko = async (
  urls: (string | null)[],
): Promise<KumikoProcessedResult[][]> =>
  axios
    .get(
      `${process.env.KUMIKO_HOST}?i=${urls.filter((url) => !!url).join(",")}`,
    )
    .then<KumikoResult[]>((result) => result.data)
    .then((data) =>
      data.map(({ panels }) =>
        panels.map(([x, y, width, height]) => ({
          x,
          y,
          width,
          height,
        })),
      ),
    );
