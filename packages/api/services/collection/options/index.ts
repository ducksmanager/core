import { UserSocket } from "~/index";

import { userOptionType } from "~prisma-schemas/schemas/dm";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

const optionNameToEnum = (
  optionName:
    | "suggestion_notification_country"
    | "sales_notification_publications"
    | "marketplace_contact_methods",
) => userOptionType[optionName];

export default (socket: UserSocket) => ({
  getOption: async (optionName: Parameters<typeof optionNameToEnum>[0]) =>
    prismaDm.userOption
      .findMany({
        where: {
          userId: socket.data.user!.id,
          optionName: optionNameToEnum(optionName),
        },
      })
      .then((data) => data.map(({ optionValue }) => optionValue)),

  setOption: async (optionName: userOptionType, optionValues: string[]) => {
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
    }
  },
});
