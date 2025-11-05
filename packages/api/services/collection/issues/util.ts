import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

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

export const deleteIssues = async (userId: number, issuecodes: string[]) => {
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
  userId: number
): Promise<(number | null)[]> => {
  const checkedPromiseIds: (number | null)[] = [];
  for (const purchaseId of purchaseIds) {
    checkedPromiseIds.push(
      (await getUserPurchase(purchaseId, userId)) ? purchaseId : null
    );
  }
  return checkedPromiseIds;
};
