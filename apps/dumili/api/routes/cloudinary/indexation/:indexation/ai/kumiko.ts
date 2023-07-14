import { Request, Response } from "express";
import { execSync } from "child_process";
import { getIndexationResources } from "../index";
import axios from "axios";

export const get = async (req: Request, res: Response) => {
  const indexationResources = await getIndexationResources(
    req.params.indexation,
    req.user.username
  );
  const output = (
    await axios.get(
      `${process.env.KUMIKO_HOST}?i=${indexationResources
        .map(({ url }: { url: string }) => url)
        .join(",")}`
    )
  ).data;
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
