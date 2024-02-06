import { Socket } from "socket.io";

import { prismaDm } from "~/prisma";
import { userOptionType } from "~prisma-clients/client_dm";

import Events from "../../types";
import { getIssuesForSale } from "..";

export default (socket: Socket<Events>) => {
  socket.on("getContactMethods", async (sellerId, callback) => {
    const issuesForSale = await getIssuesForSale(socket.data.user!.id);
    if (
      !Object.values(issuesForSale).some((publicationSales) =>
        publicationSales.some((issue) => issue.userId === sellerId)
      )
    ) {
      callback({ error: "Invalid seller ID", errorDetails: String(sellerId) });
      return;
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
    callback(
      sellerContactMethods.reduce(
        (acc, { optionValue: contactMethod }) => ({
          ...acc,
          [contactMethod]:
            contactMethod === "email" ? seller.email : seller.discordId,
        }),
        {}
      )
    );
  });
};
