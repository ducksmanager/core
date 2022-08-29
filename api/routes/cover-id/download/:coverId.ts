import { Handler } from "express";
import https from "https";

import { PrismaClient } from "../../../prisma/generated/client_cover_info";

const prisma = new PrismaClient();

export const get: Handler = async (req, res) => {
  const id = parseInt(req.params.coverId);
  const cover = await prisma.cover.findUniqueOrThrow({
    where: {
      id,
    },
  });
  const remotePath = `${cover.sitecode}/${
    cover.sitecode === "webusers" ? "webusers" : ""
  }${cover.url}`;

  const externalRequest = https.request(
    {
      hostname: process.env.IMAGE_REMOTE_ROOT,
      path: remotePath,
    },
    (externalRes) => {
      res.setHeader("content-disposition", "attachment; filename=cover.jpg");
      externalRes.pipe(res);
    }
  );
  externalRequest.end();
};
