import axios from "axios";
import type { Socket } from "socket.io";

import type { SessionDataWithIndexation } from "~/index";
import { prisma } from "~/index";
import type { aiKumikoResultPanel } from "~/prisma/client_dumili";

import type { FullIndexation, ServerSentEvents } from "./types";
import type Events from "./types";

type OcrResult = {
  box: [[number, number], [number, number], [number, number], [number, number]];
  text: string;
  confidence: number;
};

export const runOcrOnImages = async (
  socket: Socket<
    Events,
    ServerSentEvents,
    Record<string, never>,
    SessionDataWithIndexation
  >,
  pages: Exclude<Pick<FullIndexation["pages"][number], 'pageNumber'|'image'>, {image: null}>[],
) => {
  for (const {image, pageNumber} of pages) {
    const firstPanel = image!.aiKumikoResult?.detectedPanels[0];
    if (!firstPanel) {
      console.log("This page does not have any panels");
      continue;
    }
    if (image!.aiOcrResultId) {
      console.log("This page already has OCR results");
      continue;
    }
    socket.emit("runOcrOnImage", image!.id);
    const firstPanelUrl = image!.url.replace(
      "/pg_",
      `/c_crop,h_${firstPanel.height},w_${firstPanel.width},x_${firstPanel.x},y_${firstPanel.y},pg_`,
    );

    console.log(`Running OCR on page ${pageNumber}`);

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
              }
            },
            update: {
              matches: {
                deleteMany: {},
                createMany: { data: matches },
              },
            }
          },
        },
      }
    });
    socket.emit("runOcrOnImageEnd", image!.id);
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

export const runOcr = async (url: string): Promise<OcrResult[]> => axios
  .post(process.env.OCR_HOST!, { url, language: "french" })
  .then(({ data }) => data);
