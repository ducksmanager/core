import { issue_condition, PrismaClient } from "~prisma_clients/client_dm";

const prisma = new PrismaClient();

export const getUserPurchase = async (id: number | null, userId: number) =>
  id === null
    ? null
    : (
        await prisma.purchase.findMany({
          where: {
            id,
            userId,
          },
        })
      )?.[0];

export const conditionToEnum = (
  condition: string | undefined
): issue_condition | undefined => {
  switch (condition) {
    case undefined:
      return undefined;
    case "mauvais":
    case "moyen":
    case "bon":
      return issue_condition[condition];
    default:
      return issue_condition.indefini;
  }
};

export const deleteIssues = async (
  userId: number,
  publicationcode: string,
  issueNumbers: string[]
) => {
  const [country, magazine] = publicationcode.split("/");
  await prisma.issue.deleteMany({
    where: {
      country,
      magazine,
      issuenumber: {
        in: issueNumbers,
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
      (await getUserPurchase(purchaseId as number, userId))
        ? (purchaseId as number)
        : null
    );
  }
  return checkedPromiseIds;
};
