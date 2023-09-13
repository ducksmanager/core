import axios from "axios";
import { Request, Response } from "express";

import { getIndexationResources } from "../index";

export type KumikoResult = {
  filename: string;
  size: number[];
  background: string;
  gutters: number[];
  panels: { x: number; y: number; width: number; height: number }[];
};

type KumikoResultWithNumberPanels = Omit<KumikoResult, "panels"> & {
  panels: [number, number, number, number][];
};

export const get = async (req: Request, res: Response) => {
  const indexationResources = await getIndexationResources(
    req.params.indexation,
    req.user.username
  );
  const output = await runKumiko(
    indexationResources.map(({ secure_url }) => secure_url)
  );
  try {
    return res.json(output);
  } catch (err) {
    console.error(err);
    console.error(output);
    return res.status(500).send({
      message: "Kumiko output could not be parsed",
    });
  }
};

export const runKumiko = async (urls: string[]): Promise<KumikoResult[]> =>
  (await axios.get(`${process.env.KUMIKO_HOST}?i=${urls.join(",")}`)).data.map(
    (result: KumikoResultWithNumberPanels) => ({
      ...result,
      panels: result.panels.map(([x, y, width, height]) => ({
        x,
        y,
        width,
        height,
      })),
    })
  );
