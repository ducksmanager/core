import { Request, Response } from "express";
import Tesseract, { createWorker } from "tesseract.js";

import { getIndexationResources } from "../../index";
import { KumikoResult, runKumiko } from "../kumiko";

let tesseractWorker: Tesseract.Worker;

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

createWorker({
  logger: (m) => console.log(m),
}).then(async (worker) => {
  tesseractWorker = worker;
  await tesseractWorker.loadLanguage("eng");
  await tesseractWorker.initialize("eng");
  console.info("Tesseract worker initialized");
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
  const { data } = await tesseractWorker.recognize(pageUrl, {
    rectangle: extendBoundaries(kumikoResultsForPage.panels[0], 20),
  });
  return res.json(
    data.lines?.map(({ bbox: { x0, x1, y0, y1 }, confidence, text }) => ({
      bbox: {
        x: x0,
        y: y0,
        width: x1 - x0,
        height: y1 - y0,
      },
      confidence,
      text,
    }))
  );
};
