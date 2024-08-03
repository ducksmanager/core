import type { SaleState } from "~dm-types/CollectionUpdate";
import { prismaClient as prismaDm } from "~prisma-clients/schemas/dm/client";

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
  issuecodes: string[],
) => {
  await prismaDm.issue.deleteMany({
    where: {
      issuecode: {
        in: issuecodes,
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
