import https from "https";

import { PrismaClient } from "~prisma_clients/client_cover_info";
import { ExpressCall } from "~routes/_express-call";
import { Call } from "~types/Call";

const prisma = new PrismaClient();

export type getCall = Call<undefined, { coverId: string }>;
export const get = async (...[req, res]: ExpressCall<getCall>) => {
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
