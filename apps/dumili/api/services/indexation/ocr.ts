import axios from "axios";

import prisma from "~prisma/client";
import type { aiKumikoResultPanel } from "~prisma/client_dumili/client";

import { type FullIndexation, type IndexationServices } from ".";

type OcrResult = {
  box: [number /* x1 */, number /* y1 */, number /* x2 */, number /* y2 */];
  text: string;
  confidence: number;
};

export const runOcrOnImage = async (
  services: IndexationServices,
  pageNumber: number,
  image: NonNullable<FullIndexation["pages"][number]["image"]>,
) => {
  const firstPanel = image.aiKumikoResult?.detectedPanels[0];
  if (!firstPanel) {
    console.log(`Page ${pageNumber}: This page does not have any panels`);
    return [];
  }
  if (image.aiOcrResult) {
    console.log(`Page ${pageNumber}: This page already has OCR results`);
    return image.aiOcrResult.matches;
  }
  services.reportRunOcrOnImage(image.id);
  const firstPanelUrl = image.url.replace(
    "/pg_",
    `/c_crop,h_${firstPanel.height},w_${firstPanel.width},x_${firstPanel.x},y_${firstPanel.y},pg_`,
  );

  console.log(`Page ${pageNumber}: Running OCR on ${firstPanelUrl}`);

  const ocrResults = await runOcr(firstPanelUrl);
  const matches = ocrResults.map(
    ({ confidence, text, box: [x1, y1, x2, y2] }) => ({
      confidence,
      text,
      x1,
      y1,
      x2,
      y2,
    }),
  );

  await prisma.image.update({
    where: {
      id: image.id,
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

  services.reportRunOcrOnImageEnd(image.id);
  return matches;
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
