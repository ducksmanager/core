import { userOptionType } from "~prisma-schemas/schemas/dm";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import type { UserServices } from "../../../index";

import { ev } from "socket-call-server/valibot";
import * as v from "valibot";

const userOptionTypeValidation = v.union([
  v.literal("suggestion_notification_country"),
  v.literal("sales_notification_publications"),
  v.literal("marketplace_contact_methods"),
]);

const optionNameToEnum = (
  optionName:
    | "suggestion_notification_country"
    | "sales_notification_publications"
    | "marketplace_contact_methods",
) => userOptionType[optionName];

export default ({ _socket }: UserServices) => ({
  getOption: ev(userOptionTypeValidation)(async (optionName) =>
    prismaDm.userOption
      .findMany({
        where: {
          userId: _socket.data.user.id,
          optionName: optionNameToEnum(optionName),
        },
      })
      .then((data) => data.map(({ optionValue }) => optionValue)),
  ),

  setOption: ev(
    userOptionTypeValidation,
    v.array(v.string()),
  )(async (optionName, optionValues) => {
    {
      const userId = _socket.data.user.id;
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
  }),
});
