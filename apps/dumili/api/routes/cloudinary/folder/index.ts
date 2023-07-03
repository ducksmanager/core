import { v2 as cloudinary } from "cloudinary";
import { Request, Response } from "express";

export const get = async (req: Request, res: Response) => {
  const folderName = `dumili/${req.user.username}`;
  let folders;
  folders = await cloudinary.api
    .sub_folders(folderName, { max_results: 500 })
    .catch(async (err) => {
      console.error(err);
      await cloudinary.api.create_folder(folderName);
      folders = await cloudinary.api.sub_folders(folderName, {
        max_results: 500,
      });
    });

  return res.json(folders);
};
