import bodyParser from "body-parser";

import { prismaDm } from "~/prisma";
import { CollectionUpdateMultipleIssues } from "~dm-types/CollectionUpdate";
import { TransactionResults } from "~dm-types/TransactionResults";
import { issue_condition } from "~prisma-clients/client_dm";
import { ExpressCall } from "~routes/_express-call";

import {
  checkPurchaseIdsBelongToUser,
  conditionToEnum,
  deleteIssues,
  handleIsOnSale,
} from "./_common";

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

  const existingIssues = await prismaDm.issue.findMany({
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
    prismaDm.issue.update({
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
  await prismaDm.$transaction(updateOperations);

  const insertOperations = issueNumbers
    .filter(
      (issuenumber) =>
        !existingIssues
          .map(({ issuenumber: existingIssueNumber }) => existingIssueNumber)
          .includes(issuenumber)
    )
    .map((issuenumber) =>
      prismaDm.issue.create({
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
  await prismaDm.$transaction(insertOperations);

  return {
    updateOperations: updateOperations.length,
    insertOperations: insertOperations.length,
  };
};

export const post = [
  parseForm,
  async (
    ...[req, res]: ExpressCall<{
      resBody: TransactionResults;
      reqBody: CollectionUpdateMultipleIssues;
    }>
  ) => {
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

    if (isOnSale !== undefined) {
      const issueIds = (
        await prismaDm.issue.findMany({
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
      for (const issueId of issueIds) {
        await handleIsOnSale(issueId, isOnSale);
      }
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
