import bodyParser from "body-parser";
import dayjs from "dayjs";

import EdgePhotoSent from "~/emails/edge-photo-sent";
import { prismaDm, prismaEdgeCreator } from "~/prisma";
import { ExpressCall } from "~routes/_express-call";

import { Socket } from "../types";

export default (socket: Socket) => {
  socket.on("sendNewEdgePhotoEmail", async (publicationcode, issuenumber, callback) => {
    const user = await prismaDm.user.findUniqueOrThrow({
      where: { id: socket.data.user!.id },
    });
    const email = new EdgePhotoSent({
      user,
      publicationcode,
      issuenumber,
    });
    const edgeUrl = email.data.ecLink;
    await email.send();

    callback({ url: edgeUrl });
  })
  socket.on("createElementImage", async (hash, fileName, callback) => prismaEdgeCreator.elementImage.create({
    select: { id: true },
    data: { hash, fileName },
  }).then(({ id }) => ({ photoId: id })).then(callback));

  socket.on("checkTodayLimit", async (callback) => (prismaEdgeCreator.elementImage.findMany({
    select: { fileName: true },
    where: {
      userId: socket.data.user!.id,
      createdAt: {
        gt: dayjs().hour(0).minute(0).toDate(),
        lt: dayjs().add(1, "day").hour(0).minute(0).toDate(),
      },
    },
  })
  ).then(data => ({ uploadedFilesToday: data.map(({ fileName }) => fileName) })).then(callback));
  socket.on("getImageByHash", async (hash, callback) => prismaEdgeCreator.elementImage.findFirstOrThrow({
    where: {
      userId: socket.data.user!.id,
      hash,
    },
  }).then(callback).catch(() => callback(null)))
}

const parseForm = bodyParser.json();
export const put = [
  parseForm,
  async (
    ...[req, res]: ExpressCall<{
      resBody: {
        photo: { id: number };
      };
      reqBody: {
        hash: string;
        filename: string;
      };
    }>
  ) =>
    res.json({
      photo: {
        id: (
          await prismaEdgeCreator.elementImage.create({
            data: { hash: req.body.hash, fileName: req.body.filename },
          })
        ).id,
      },
    }),
];
