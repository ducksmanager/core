import { v2 as cloudinary } from "cloudinary";
import { Request, Response } from "express";

export const get = async (req: Request, res: Response) => {
  return res.json(
    (await cloudinary.api
      .resources_by_context("indexation", req.params.folder, {
        context: true,
      })
      .catch(async (err) => {
        console.error(err);
      }))!.resources.filter(
      ({ context }) => (context as any).custom.user === req.user.username
    )
  );
};
