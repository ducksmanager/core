import { v2 as cloudinary } from "cloudinary";
import { Request, Response } from "express";

import { CloudinaryResourceContext } from "~dumili-types/CloudinaryResourceContext";

export const get = async (req: Request, res: Response) =>
  res.json(
    (await cloudinary.api
      .resources_by_context("first_image", "true", {
        context: true,
      })
      .catch(async (err) => {
        console.error(err);
      }))!.resources.filter(
      ({ context }) =>
        (context as CloudinaryResourceContext).custom.user === req.user.username
    )
  );
