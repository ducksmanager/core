import axios from "axios";

import { aiKumikoResultPanel } from "~/prisma/client_dumili";

type KumikoResult = {
  filename: string;
  size: number[];
  background: string;
  gutters: number[];
  panels: [number, number, number, number][];
};

export const runKumiko = async (urls: string[]): Promise<Pick<aiKumikoResultPanel, 'x' | 'y' | 'width' | 'height'>[][]> =>
  (axios.get(`${process.env.KUMIKO_HOST}?i=${urls.join(",")}`))
  .then((result) => { return result.data as KumikoResult[]}).then(data => data.map(
    ({ panels }) => panels.map(([ x, y, width, height ]) => ({
      x,
      y,
      width,
      height,
    }))))
