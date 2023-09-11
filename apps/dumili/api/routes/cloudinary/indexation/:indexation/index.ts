import { v2 as cloudinary } from "cloudinary";
import { Request, Response } from "express";

import { CloudinaryResourceContext } from "~pulumi-types/CloudinaryResourceContext";

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
    ({ context }) =>
      (context as CloudinaryResourceContext).custom.user === username
  );
