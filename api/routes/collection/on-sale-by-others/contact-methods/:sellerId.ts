import { Handler, Response } from "express";

import { PrismaClient, userOptionType } from "~/dist/prisma/client_dm";

import { getIssuesForSale } from "../index";

const prisma = new PrismaClient();

export type getType = {
  [contactMethod: string]: string | number;
};
export const get: Handler = async (req, res: Response<getType>) => {
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
  return res.json(
    sellerContactMethods.reduce(
      (acc, { optionValue: contactMethod }) => ({
        ...acc,
        [contactMethod]:
          contactMethod === "email" ? seller.email : seller.discordId,
      }),
      {}
    )
  );
};
