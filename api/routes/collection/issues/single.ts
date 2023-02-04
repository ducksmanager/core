import bodyParser from "body-parser";

import { PrismaClient } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";
import { CollectionUpdateSingleIssue } from "~types/CollectionUpdate";
import { TransactionResults } from "~types/TransactionResults";

import {
  checkPurchaseIdsBelongToUser,
  conditionToEnum,
  handleIsOnSale,
} from "./_common";

const prisma = new PrismaClient();
const parseForm = bodyParser.json();

const addOrChangeCopies = async (
  userId: number,
  publicationcode: string,
  issuenumber: string,
  issueIds: (number | null)[],
  conditions: (string | null)[],
  areOnSale: (boolean | undefined)[],
  areToRead: (boolean | undefined)[],
  purchaseIds: (number | null)[]
): Promise<TransactionResults> => {
  const [country, magazine] = publicationcode.split("/");

  const operations = issueIds.map((issueId, copyNumber) => {
    if (issueId && conditions[copyNumber] === null) {
      return prisma.issue.delete({
        where: { id: issueId },
      });
    }
    const common = {
      condition: conditionToEnum(conditions[copyNumber]!),
      isOnSale:
        areOnSale[copyNumber] !== undefined
          ? (areOnSale[copyNumber] as boolean)
          : false,
      isToRead:
        areToRead[copyNumber] !== undefined ? areToRead[copyNumber] : false,
      purchaseId: purchaseIds[copyNumber] || -2,
    };
    return prisma.issue.upsert({
      create: {
        ...common,
        country,
        magazine,
        issuenumber,
        userId,
        creationDate: new Date(),
      },
      update: common,
      where: {
        id: issueId || 0,
      },
    });
  });
  await prisma.$transaction(operations);

  return {
    operations: operations.length,
  };
};

export const post = [
  parseForm,
  async (
    ...[req, res]: ExpressCall<
      TransactionResults,
      undefined,
      CollectionUpdateSingleIssue
    >
  ) => {
    const user = req.user!;
    const { body }: { body: CollectionUpdateSingleIssue } = req;
    const { publicationcode, issuenumber, copies } = body;
    const [country, magazine] = publicationcode.split("/");

    const userId = user.id;

    const checkedPurchaseIds = await checkPurchaseIdsBelongToUser(
      copies
        .map(({ purchaseId }) => purchaseId)
        .filter((purchaseId) => !!purchaseId) as number[],
      userId
    );

    const output = await addOrChangeCopies(
      userId,
      publicationcode,
      issuenumber,
      copies.map(({ id }) => id),
      copies.map(({ condition }) => condition),
      copies.map(({ isOnSale }) =>
        isOnSale === undefined ? undefined : isOnSale !== false
      ),
      copies.map(({ isToRead }) => isToRead),
      checkedPurchaseIds
    );

    const currentCopyIds = (
      await prisma.issue.findMany({
        select: {
          id: true,
        },
        where: {
          country,
          magazine,
          issuenumber,
          userId: userId,
        },
      })
    ).map(({ id }) => id);

    for (const issueId of currentCopyIds) {
      const idx = currentCopyIds.indexOf(issueId);
      if (copies[idx]) {
        await handleIsOnSale(issueId, copies[idx].isOnSale);
      }
    }
    return res.json(output);
  },
];
