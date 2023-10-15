import axios from "axios";
import { Request, Response } from "express";
import Cookies from "js-cookie";

import {
  addTokenRequestInterceptor,
  addUrlParamsRequestInterceptor,
} from "~axios-helper";

import { getIndexationResources } from "..";

const defaultApi = addTokenRequestInterceptor(
  addUrlParamsRequestInterceptor(
    axios.create({ baseURL: process.env.DM_API_URL })
  ),
  () => Cookies.get("token") as string
);
export const get = async (req: Request, res: Response) => {
  const indexationResources = await getIndexationResources(
    req.params.indexation,
    req.user.username
  );
  const image = await axios.get(indexationResources[0].url, {
    responseType: "arraybuffer",
  });
  try {
    return res.json(
      (
        await axios.post(`${defaultApi.defaults.baseURL}/cover-id/search`, {
          base64: Buffer.from(image.data).toString("base64"),
        })
      ).data
    );
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e });
  }
};
