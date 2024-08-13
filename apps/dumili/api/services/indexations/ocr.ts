import axios from "axios";

import type { aiKumikoResultPanel } from "~/prisma/client_dumili";

type OcrResult = {
  box: [[number, number], [number, number], [number, number], [number, number]];
  text: string;
  confidence: number;
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

export const runOcr = async (base64: string): Promise<OcrResult[]> =>
  axios.post(process.env.OCR_HOST!, base64).then(({ data }) => data);
