import type { Socket } from "socket.io";

import { userOptionType } from "~prisma-schemas/schemas/dm";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import type Events from "../types";
const optionNameToEnum = (
  optionName:
    | "suggestion_notification_country"
    | "sales_notification_publications"
    | "marketplace_contact_methods",
) => userOptionType[optionName];

export default (socket: Socket<Events>) => {
  socket.on("getOption", async (optionName, callback) =>
    prismaDm.userOption
      .findMany({
        where: {
          userId: socket.data.user!.id,
          optionName: optionNameToEnum(optionName),
        },
      })
      .then((data) => callback(data.map(({ optionValue }) => optionValue))),
  );

  socket.on("setOption", async (optionName, optionValues, callback) => {
    {
      const userId = socket.data.user!.id;
      await prismaDm.userOption.deleteMany({
        where: {
          userId,
          optionName,
        },
      });

      await prismaDm.$transaction(
        optionValues.map((optionValue: string) =>
          prismaDm.userOption.create({
            data: {
              optionName,
              optionValue,
              userId,
            },
          }),
        ),
      );

      callback();
    }
  });
};
