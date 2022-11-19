import { Handler } from "express";

import { PrismaClient, userOptionType } from "~/dist/prisma/client_dm";
import { getIssuesForSale } from "~/routes/collection/on-sale-by-others";

const prisma = new PrismaClient();
export const get: Handler = async (req, res) => {
  const sellerId = parseInt(req.params.sellerId);
  const issuesForSale = await getIssuesForSale(req.user.id);
  if (
    !Object.values(issuesForSale).some((publicationSales) =>
      publicationSales.some((issue) => issue.userId === sellerId)
    )
  ) {
    res.writeHead(400, { "Content-Type": "application/text" });
    res.end("Invalid seller ID: " + sellerId);
    return;
  }
  const seller = await prisma.user.findUniqueOrThrow({
    select: { email: true, discordId: true },
    where: { id: sellerId },
  });
  const sellerContactMethods = await prisma.userOption.findMany({
    where: {
      userId: sellerId,
      optionName: userOptionType.marketplace_contact_methods,
    },
  });
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify(
      sellerContactMethods.reduce(
        (acc, { optionValue: contactMethod }) => ({
          ...acc,
          [contactMethod]:
            contactMethod === "email" ? seller.email : seller.discordId,
        }),
        {}
      )
    )
  );
};
