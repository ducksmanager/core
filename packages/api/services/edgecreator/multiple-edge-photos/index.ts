import dayjs from "dayjs";
import type { Socket } from "socket.io";

import EdgePhotoSent from "~/emails/edge-photo-sent";
import { prismaDm, prismaEdgeCreator } from "~prisma-clients";

import type Events from "../types";
export default (socket: Socket<Events>) => {
  socket.on(
    "sendNewEdgePhotoEmail",
    async (shortIssuecode, callback) => {
      const user = await prismaDm.user.findUniqueOrThrow({
        where: { id: socket.data.user!.id },
      });
      const email = new EdgePhotoSent({
        user,
        shortIssuecode,
      });
      const edgeUrl = email.data.ecLink;
      await email.send();

      callback({ url: edgeUrl });
    },
  );
  socket.on("createElementImage", async (hash, fileName, callback) =>
    prismaEdgeCreator.elementImage
      .create({
        select: { id: true },
        data: { hash, fileName },
      })
      .then(({ id }) => ({ photoId: id }))
      .then(callback),
  );

  socket.on("checkTodayLimit", (callback) =>
    prismaEdgeCreator.elementImage
      .findMany({
        select: { fileName: true },
        where: {
          userId: socket.data.user!.id,
          createdAt: {
            gt: dayjs().hour(0).minute(0).toDate(),
            lt: dayjs().add(1, "day").hour(0).minute(0).toDate(),
          },
        },
      })
      .then((data) => ({
        uploadedFilesToday: data.map(({ fileName }) => fileName),
      }))
      .then(callback),
  );
  socket.on("getImageByHash", async (hash, callback) =>
    prismaEdgeCreator.elementImage
      .findFirstOrThrow({
        where: {
          userId: socket.data.user!.id,
          hash,
        },
      })
      .then(callback)
      .catch(() => callback(null)),
  );
};
