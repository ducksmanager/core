import axios from "axios";

import { COVER, ILLUSTRATION, STORY } from "~dumili-types/storyKinds";
import { getEntryFromPage } from "~dumili-utils/entryPages";
import type { aiKumikoResultPanel, Prisma } from "~prisma/client_dumili";

import { prisma } from "../../index";
import type { IndexationServices } from ".";
import { type FullIndexation, refreshIndexation } from ".";

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

const getPanelRows = (
  panels: Awaited<ReturnType<typeof runKumiko>>[number],
): number => {
  if (!panels.length) {
    return 0;
  }

  const sortedPanels = [...panels].sort((a, b) => a.y - b.y);
  const rows: number[] = [sortedPanels[0].y];
  const tolerance = 5;
  for (let i = 0; i < sortedPanels.length; i++) {
    const panelY = sortedPanels[i].y;

    const belongsToExistingRow = rows.some(
      (rowY) => Math.abs(panelY - rowY) <= tolerance,
    );

    if (!belongsToExistingRow) {
      rows.push(panelY);
    }
  }

  return rows.length;
};

const runKumikoOnPage = async (
  indexationServices: IndexationServices,
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
    indexationServices.reportSetKumikoInferredPageStoryKinds(page.id);
    const panelsPerPage = await runKumiko([page.image.url]);
    const panelsOfPage = panelsPerPage[0] || [];
    console.info(
      `Kumiko: page ${page.pageNumber}: detected ${panelsOfPage.length} panels`,
    );

    const inferredStoryKind = inferStoryKindFromAiResults(
      panelsOfPage,
      page.pageNumber,
    );

    const inferredNumberOfRows = getPanelRows(panelsOfPage);

    console.log(
      `Kumiko: page ${page.pageNumber}: inferred story kind is ${inferredStoryKind}, inferred number of rows is ${inferredNumberOfRows}`,
    );

    const inferredStoryKindRowsStr = (
      await prisma.storyKindRows.findFirst({
        where: {
          kind: inferredStoryKind,
          numberOfRows: inferredNumberOfRows,
        },
      })
    )?.id;

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
              inferredStoryKindRowsStr,
              detectedPanels: {
                createMany: {
                  data: panelsOfPage,
                },
              },
            },
            update: {
              inferredStoryKindRowsStr,
              detectedPanels: {
                deleteMany: {},
                createMany: {
                  data: panelsOfPage,
                },
              },
            },
          },
        },
      },
      where: {
        id: page.image.id,
      },
    });

    await refreshIndexation(indexationServices);

    indexationServices.reportSetKumikoInferredPageStoryKindsEnd(page.id);
    return true;
  }
  return false;
};

export const runKumikoOnPages = async (
  services: IndexationServices,
  indexation: FullIndexation,
  force = false,
) => {
  const updatedImageIds = [];
  for (const page of indexation.pages) {
    if (await runKumikoOnPage(services, page, force)) {
      updatedImageIds.push(page.id);
    }
  }

  const outdatedEntryIds = new Set(
    updatedImageIds
      .map((id) => getEntryFromPage(indexation, id)?.id)
      .filter((id) => !!id)
      .map((id) => id!),
  );

  if (!outdatedEntryIds.size) {
    return;
  }

  // Invalidate story kind suggestions for entries whose pages have been updated
  await prisma.storyKindSuggestionAi.deleteMany({
    where: {
      storyKindSuggestion: {
        entry: {
          id: {
            in: [...outdatedEntryIds.values()],
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
            in: [...outdatedEntryIds.values()],
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
    .then<KumikoResult[]>((result) => result.data || [])
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
