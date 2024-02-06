import axios from "axios";

import { KumikoResult } from "~dumili-types/KumikoResult";
import { OcrResult } from "~dumili-types/OcrResults";


/* Adding a bit of extra in case the storycode is just outside the panel */
export const extendBoundaries = (
  { x, y, width, height }: KumikoResult["panels"][0],
  extendBy: number
) => ({
  left: x,
  top: y,
  width: width + extendBy,
  height: height + extendBy,
});

export const runOcr = async (base64: string): Promise<OcrResult[]> =>
  (axios.post(process.env.OCR_HOST!, base64)).then(({data}) => data);
