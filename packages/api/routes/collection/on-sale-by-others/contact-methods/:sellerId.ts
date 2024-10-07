import { prismaDm } from "~/prisma";
import { userOptionType } from "~prisma-schemas/client_dm";
import { ExpressCall } from "~routes/_express-call";

import { getIssuesForSale } from "..";

export const get = async (
  ...[req, res]: ExpressCall<{
    resBody: {
      [_contactMethod: string]: string | number;
    };
    params: { sellerId: string };
  }>
) => {
  const sellerId = parseInt(req.params.sellerId);
  const issuesForSale = await getIssuesForSale(req.user!.id);
  if (
    !Object.values(issuesForSale).some((publicationSales) =>
      publicationSales.some((issue) => issue.userId === sellerId)
    )
  ) {
    res.writeHead(400, { "Content-Type": "application/text" });
    res.end("Invalid seller ID: " + sellerId);
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
