import { ev } from "socket-call-server/valibot";
import * as v from "valibot";
import dayjs from "dayjs";

import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";
import { prismaClient as prismaEdgeCreator } from "~prisma-schemas/schemas/edgecreator/client";

import EdgePhotoSent from "../../../emails/edge-photo-sent";
import type { UserServices } from "../../../index";

export const checkTodayLimit = (userId: number) =>
  prismaEdgeCreator.elementImage
    .findMany({
      select: { fileName: true },
      where: {
        userId,
        createdAt: {
          gt: dayjs().hour(0).minute(0).toDate(),
          lt: dayjs().add(1, "day").hour(0).minute(0).toDate(),
        },
      },
    })
    .then((data) => ({
      uploadedFilesToday: data.map(({ fileName }) => fileName),
    }));

export default ({ _socket }: UserServices) => ({
  sendNewEdgePhotoEmail: ev(
    v.config(v.pipe(v.string(), v.nonEmpty()), {
      message: "Invalid issuecode",
    }),
  )(async (issuecode: string) => {
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
  }),
  createElementImage: ev(
    v.string(),
    v.string(),
  )(async (hash, fileName) =>
    prismaEdgeCreator.elementImage
      .create({
        select: { id: true },
        data: { hash, fileName },
      })
      .then(({ id }) => ({ photoId: id })),
  ),

  checkTodayLimit: async () => checkTodayLimit(_socket.data.user.id),

  getImageByHash: ev(v.string())(async (hash) =>
    prismaEdgeCreator.elementImage.findFirst({
      where: {
        hash,
      },
    }),
  ),
});
