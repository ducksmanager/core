import dayjs from "dayjs";

import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";
import { prismaClient as prismaEdgeCreator } from "~prisma-schemas/schemas/edgecreator/client";

import EdgePhotoSent from "../../../emails/edge-photo-sent";
import type { UserServices } from "../../../index";

export default ({ _socket }: UserServices) => ({
  sendNewEdgePhotoEmail: async (issuecode: string) => {
    const user = await prismaDm.user.findUniqueOrThrow({
      where: { id: _socket.data.user.id },
    });
    const email = new EdgePhotoSent({
      user,
      issuecode,
    });
    const edgeUrl = email.data.ecLink;
    await email.send();

    return { url: edgeUrl };
  },
  createElementImage: async (hash: string, fileName: string) =>
    prismaEdgeCreator.elementImage
      .create({
        select: { id: true },
        data: { hash, fileName },
      })
      .then(({ id }) => ({ photoId: id })),

  checkTodayLimit: () =>
    prismaEdgeCreator.elementImage
      .findMany({
        select: { fileName: true },
        where: {
          userId: _socket.data.user.id,
          createdAt: {
            gt: dayjs().hour(0).minute(0).toDate(),
            lt: dayjs().add(1, "day").hour(0).minute(0).toDate(),
          },
        },
      })
      .then((data) => ({
        uploadedFilesToday: data.map(({ fileName }) => fileName),
      })),

  getImageByHash: async (hash: string) =>
    prismaEdgeCreator.elementImage.findFirst({
      where: {
        hash,
      },
    }),
});
