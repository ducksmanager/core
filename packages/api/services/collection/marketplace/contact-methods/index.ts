import { userOptionType } from "~prisma-schemas/schemas/dm";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import type { UserServices } from "../../../../index";
import { getIssuesForSale } from "..";

export default ({_socket}: UserServices) => ({
  getContactMethods: async (sellerId: number) => {
    const issuesForSale = await getIssuesForSale(_socket.data.user.id);
    if (!issuesForSale.some((issue) => issue.userId === sellerId)) {
      return { error: "Invalid seller ID", errorDetails: String(sellerId) };
    }
    const seller = await prismaDm.user.findUniqueOrThrow({
      select: { email: true, discordId: true },
      where: { id: sellerId },
    });
    const sellerContactMethods = await prismaDm.userOption.findMany({
      where: {
        userId: sellerId,
        optionName: userOptionType.marketplace_contact_methods,
      },
    });
    return sellerContactMethods.reduce<Record<string, string | number | null>>(
      (acc, { optionValue: contactMethod }) => ({
        ...acc,
        [contactMethod]:
          contactMethod === "email" ? seller.email : seller.discordId,
      }),
      {},
    );
  },
});
