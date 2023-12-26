import { resetDemo } from "~/services/demo";
import { TransactionResults } from "~dm-types/TransactionResults";
import { issue_condition } from "~prisma-clients/client_dm";
import prismaDm from "~prisma-clients/extended/dm.extends";

import { Socket } from "../types";
import { checkPurchaseIdsBelongToUser, conditionToEnum, deleteIssues, handleIsOnSale } from "./util";

export default (socket: Socket) => {
  socket.on("getIssues", async (callback) => {
    if (socket.data.user!.username === "demo") {
      await resetDemo();
    }
    callback(
      await prismaDm.issue.findMany({
        where: {
          userId: socket.data.user!.id,
        },
      })
    );
  })

  socket.on('addOrChangeIssues', async ({ publicationcode, issuenumbers, purchaseId, isOnSale, condition, isToRead }, callback) => {
    const user = socket.data.user!

    let checkedPurchaseId: number | null = null;
    if (typeof purchaseId === "number") {
      checkedPurchaseId = (
        await checkPurchaseIdsBelongToUser([purchaseId], user.id)
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
      await deleteIssues(user.id, publicationcode, issuenumbers);
      return callback({});
    }
    callback(
      await addOrChangeIssues(
        user.id,
        publicationcode,
        issuenumbers,
        condition,
        isOnSale === undefined ? undefined : isOnSale !== false,
        isToRead,
        checkedPurchaseId
      )
    );
  });
  socket.on('addOrChangeCopies', async ({ publicationcode, issuenumber, copies }, callback) => {
    const [country, magazine] = publicationcode.split("/");

    const userId = socket.data.user!.id;

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
      await prismaDm.issue.findMany({
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
    callback(output);
  })
}

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
      return prismaDm.issue.delete({
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
    return prismaDm.issue.upsert({
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
  await prismaDm.$transaction(operations);

  return {
    operations: operations.length,
  };
};
