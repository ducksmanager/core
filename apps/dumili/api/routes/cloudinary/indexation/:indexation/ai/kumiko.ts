import { Request, Response } from "express";
import { execSync } from "child_process";
import { getIndexationResources } from "../index";

export const get = async (req: Request, res: Response) => {
  const indexationResources = await getIndexationResources(
    req.params.indexation,
    req.user.username
  );
  const output = execSync(
    `docker-compose run --rm kumiko ./kumiko/kumiko -i ${indexationResources
      .map(({ url }: { url: string }) => url)
      .join(" ")}`
  );
  try {
    return res.json(JSON.parse(output.toString()));
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      message: "Kumiko output could not be parsed",
    });
  }
};
