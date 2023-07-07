import { v2 as cloudinary } from "cloudinary";
import { Request, Response } from "express";

export const get = async (req: Request, res: Response) =>
  res.json(
    await getIndexationResources(req.params.indexation, req.user.username)
  );

export const getIndexationResources = async (
  indexation: string,
  username: string
) =>
  (await cloudinary.api
    .resources_by_context("indexation", indexation, {
      context: true,
    })
    .catch(async (err) => {
      console.error(err);
    }))!.resources.filter(
    ({ context }) => (context as any).custom.user === username
  );
