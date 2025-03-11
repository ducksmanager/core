import axios from "axios";

import type { aiKumikoResultPanel } from "~prisma/client_dumili";

import { prisma } from "../../index";
import {
  type FullIndexation,
  type IndexationServices,
  refreshIndexation,
} from ".";

type OcrResult = {
  box: [[number, number], [number, number], [number, number], [number, number]];
  text: string;
  confidence: number;
};

export const runOcrOnImages = async (
  services: IndexationServices,
  pages: Exclude<
    Pick<FullIndexation["pages"][number], "pageNumber" | "image">,
    { image: null }
  >[],
) => {
  for (const { image, pageNumber } of pages) {
    const firstPanel = image!.aiKumikoResult?.detectedPanels[0];
    if (!firstPanel) {
      console.log(`Page ${pageNumber}: This page does not have any panels`);
      continue;
    }
    if (image!.aiOcrResultId) {
      console.log(`Page ${pageNumber}: This page already has OCR results`);
      continue;
    }
    services.runOcrOnImage(image!.id);
    const firstPanelUrl = image!.url.replace(
      "/pg_",
      `/c_crop,h_${firstPanel.height},w_${firstPanel.width},x_${firstPanel.x},y_${firstPanel.y},pg_`,
    );

    console.log(`Page ${pageNumber}: Running OCR on ${firstPanelUrl}`);

    const ocrResults = await runOcr(firstPanelUrl);
    const matches = ocrResults.map(
      ({
        confidence,
        text,
        box: [[x1, y1], [x2, y2], [x3, y3], [x4, y4]],
      }) => ({
        confidence,
        text,
        x1,
        y1,
        x2,
        y2,
        x3,
        y3,
        x4,
        y4,
      }),
    );

    await prisma.image.update({
      where: {
        id: image!.id,
      },
      data: {
        aiOcrResult: {
          upsert: {
            create: {
              matches: {
                createMany: { data: matches },
              },
            },
            update: {
              matches: {
                deleteMany: {},
                createMany: { data: matches },
              },
            },
          },
        },
      },
    });

    await refreshIndexation(services);

    services.runOcrOnImageEnd(image!.id);
  }
};
/* Adding a bit of extra in case the storycode is just outside the panel */
export const extendBoundaries = (
  { x, y, width, height }: aiKumikoResultPanel,
  extendBy: number,
) => ({
  left: x,
  top: y,
  width: width + extendBy,
  height: height + extendBy,
});

export const runOcr = async (url: string): Promise<OcrResult[]> =>
  axios
    .post(process.env.OCR_HOST!, { url, language: "french" })
    .then(({ data }) => data);
