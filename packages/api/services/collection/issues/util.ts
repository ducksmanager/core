import type { SaleState } from "~dm-types/CollectionUpdate";
import { prismaDm } from "~prisma-clients";

export const getUserPurchase = async (id: number | null, userId: number) =>
  id === null
    ? null
    : (
        await prismaDm.purchase.findMany({
          where: {
            id,
            userId,
          },
        })
      )?.[0];

export const deleteIssues = async (
  userId: number,
  publicationcode: string,
  shortIssuenumbers: string[],
) => {
  const [country, magazine] = publicationcode.split("/");
  await prismaDm.issue.deleteMany({
    where: {
      country,
      magazine,
      shortIssuenumber: {
        in: shortIssuenumbers,
      },
      userId,
    },
  });
};

export const checkPurchaseIdsBelongToUser = async (
  purchaseIds: number[],
  userId: number,
): Promise<(number | null)[]> => {
  const checkedPromiseIds: (number | null)[] = [];
  for (const purchaseId of purchaseIds) {
    checkedPromiseIds.push(
      (await getUserPurchase(purchaseId as number, userId))
        ? (purchaseId as number)
        : null,
    );
  }
  return checkedPromiseIds;
};

export const handleIsOnSale = async (issueId: number, isOnSale: SaleState) => {
  if (typeof isOnSale === "object") {
    if ("setAsideFor" in isOnSale) {
      const buyerId = isOnSale.setAsideFor;
      await prismaDm.requestedIssue.update({
        data: {
          isBooked: true,
        },
        where: {
          issueId_buyerId: { issueId, buyerId },
        },
      });
    } else if ("transferTo" in isOnSale) {
      const buyerId = isOnSale.transferTo;
      await prismaDm.issue.update({
        data: {
          userId: buyerId,
          purchaseId: -1,
          isOnSale: false,
          isToRead: false,
          isSubscription: false,
          creationDate: new Date(),
        },
        where: {
          id: issueId,
        },
      });
    }
  }
  if (
    (typeof isOnSale === "object" && "transferTo" in isOnSale) ||
    isOnSale === false
  ) {
    await prismaDm.requestedIssue.deleteMany({
      where: {
        issueId,
      },
    });
  }
};
