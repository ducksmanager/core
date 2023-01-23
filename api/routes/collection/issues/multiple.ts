import bodyParser from "body-parser";

import {
  issue_condition,
  Prisma,
  PrismaClient,
} from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";
import { Call } from "~types/Call";
import { CollectionUpdateMultipleIssues } from "~types/CollectionUpdate";
import { TransactionResults } from "~types/TransactionResults";

import {
  checkPurchaseIdsBelongToUser,
  conditionToEnum,
  deleteIssues,
} from "./_common";
import PromiseReturnType = Prisma.PromiseReturnType;

const prisma = new PrismaClient();
const parseForm = bodyParser.json();

const addOrChangeIssues = async (
  userId: number,
  publicationcode: string,
  issueNumbers: string[],
  condition: string | undefined,
  isOnSale: boolean | undefined,
  isToRead: boolean | undefined,
  purchaseId: number | null | undefined
): Promise<TransactionResults> => {
  const [country, magazine] = publicationcode.split("/");

  const existingIssues = await prisma.issue.findMany({
    where: {
      country,
      magazine,
      issuenumber: {
        in: issueNumbers,
      },
      userId,
    },
  });

  const updateOperations = existingIssues.map((existingIssue) =>
    prisma.issue.update({
      data: {
        ...existingIssue,
        condition: conditionToEnum(condition),
        isOnSale,
        isToRead,
        purchaseId: purchaseId === null ? -1 : purchaseId,
      },
      where: { id: existingIssue.id },
    })
  );
  await prisma.$transaction(updateOperations);

  const insertOperations = issueNumbers
    .filter(
      (issuenumber) =>
        !existingIssues
          .map(({ issuenumber: existingIssueNumber }) => existingIssueNumber)
          .includes(issuenumber)
    )
    .map((issuenumber) =>
      prisma.issue.create({
        data: {
          country,
          magazine,
          issuenumber,
          condition:
            condition === undefined
              ? issue_condition.indefini
              : conditionToEnum(condition),
          isOnSale: isOnSale || false,
          isToRead: isToRead || false,
          purchaseId: purchaseId === null ? -1 : purchaseId,
          userId,
          creationDate: new Date(),
        },
      })
    );
  await prisma.$transaction(insertOperations);

  return {
    updateOperations: updateOperations.length,
    insertOperations: insertOperations.length,
  };
};

export type postCall = Call<
  PromiseReturnType<typeof addOrChangeIssues>,
  undefined,
  CollectionUpdateMultipleIssues
>;
export const post = [
  parseForm,
  async (...[req, res]: ExpressCall<postCall>) => {
    const user = req.user!;
    const { body }: { body: CollectionUpdateMultipleIssues } = req;
    const { publicationcode, issuenumbers, purchaseId } = body;

    const { isOnSale, condition, isToRead } = body;
    const userId = user.id;

    let checkedPurchaseId: number | null = null;
    if (typeof purchaseId === "number") {
      checkedPurchaseId = (
        await checkPurchaseIdsBelongToUser([purchaseId], userId)
      )[0];
    }

    if (isOnSale === false) {
      const issueIds = (
        await prisma.issue.findMany({
          select: {
            id: true,
          },
          where: {
            userId: user.id,
            country: publicationcode.split("/")[0],
            magazine: publicationcode.split("/")[1],
            issuenumber: {
              in: issuenumbers,
            },
          },
        })
      ).map(({ id }) => id);
      await prisma.requestedIssue.updateMany({
        data: {
          isBooked: false,
        },
        where: {
          issueId: { in: issueIds },
        },
      });
    }

    if (condition === null) {
      await deleteIssues(userId, publicationcode, issuenumbers);
      return res.json({});
    }
    return res.json(
      await addOrChangeIssues(
        userId,
        publicationcode,
        issuenumbers,
        condition,
        isOnSale === undefined ? undefined : isOnSale !== false,
        isToRead,
        checkedPurchaseId
      )
    );
  },
];
