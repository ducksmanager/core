import axios from "axios";
import { Request, Response } from "express";
import sharp from "sharp";

import { OcrResult } from "~pulumi-types/OcrResults";

import { getIndexationResources } from "../..";
import { KumikoResult, runKumiko } from "../kumiko";

/* Adding a bit of extra in case the storycode is just outside the panel */
const extendBoundaries = (
  { x, y, width, height }: KumikoResult["panels"][0],
  extendBy: number
) => ({
  left: x,
  top: y,
  width: width + extendBy,
  height: height + extendBy,
});

export const get = async (req: Request, res: Response) => {
  const indexationResources = await getIndexationResources(
    req.params.indexation,
    req.user.username
  );
  const pageUrl = req.params[0];
  if (!indexationResources.some(({ secure_url }) => secure_url === pageUrl)) {
    return res.status(400).send({ message: "Invalid page URL" });
  }
  const kumikoResultsForPage = (await runKumiko([pageUrl]))[0];
  const firstPanel = kumikoResultsForPage.panels[0];

  const input = (
    await axios({
      url: pageUrl,
      responseType: "arraybuffer",
    })
  ).data as Buffer;

  const base64 = (
    await sharp(input).extract(extendBoundaries(firstPanel, 20)).toBuffer()
  ).toString("base64");
  return res.json(await runOcr(base64));
};

export const runOcr = async (base64: string): Promise<OcrResult[]> =>
  (await axios.post(process.env.OCR_HOST!, base64)).data;
