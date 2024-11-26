import axios from "axios";

import type { aiKumikoResultPanel } from "~/prisma/client_dumili";

type KumikoResult = {
  filename: string;
  size: number[];
  background: string;
  gutters: number[];
  panels: [number, number, number, number][];
};

export type KumikoProcessedResult = Pick<
  aiKumikoResultPanel,
  "x" | "y" | "width" | "height"
>;

export const runKumiko = async (
  urls: (string | null)[],
): Promise<KumikoProcessedResult[][]> =>
  axios
    .get(
      `${process.env.KUMIKO_HOST}?i=${urls.filter((url) => !!url).join(",")}`,
    )
    .then((result) => {
      return result.data as KumikoResult[];
    })
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
