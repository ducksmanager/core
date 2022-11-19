import bodyParser from "body-parser";
import { Handler } from "express";
import { constants } from "http2";

import { resetDemo } from "~/routes/demo/_reset";
import { issue_condition, PrismaClient } from "~prisma_clients/client_dm";

const prisma = new PrismaClient();
const parseForm = bodyParser.json();

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

export const conditionToEnum = (condition: string | null): issue_condition => {
  switch (condition) {
    case "mauvais":
    case "moyen":
    case "bon":
      return issue_condition[condition];
    default:
      return issue_condition.indefini;
  }
};

const addOrChangeIssues = async (
  userId: number,
  publicationCode: string,
  issueNumbers: string[],
  condition: string | null,
  isOnSale: boolean | null,
  isToRead: boolean | null,
  purchaseId: number | null
): Promise<{ [key: string]: number }> => {
  const [country, magazine] = publicationCode.split("/");

  const conditionNewIssues =
    condition === null ? issue_condition.indefini : conditionToEnum(condition);
  const isOnSaleNewIssues = isOnSale === null ? false : isOnSale;
  const isToReadNewIssues = isToRead === null ? false : isToRead;
  const purchaseIdNewIssues = purchaseId === null ? -2 : purchaseId; // TODO allow NULL

  const existingIssues = await prisma.issue.findMany({
    where: {
      country,
      magazine,
      issueNumber: {
        in: issueNumbers,
      },
      userId,
    },
  });

  const updateOperations = existingIssues.map((existingIssue) =>
    prisma.issue.update({
      data: {
        ...existingIssue,
        ...(condition === null
          ? {}
          : { condition: conditionToEnum(condition) }),
        ...(isOnSale === null ? {} : { isOnSale }),
        ...(isToRead === null ? {} : { isToRead }),
        ...(purchaseId === null ? {} : { purchaseId }),
      },
      where: { id: existingIssue.id },
    })
  );
  await prisma.$transaction(updateOperations);

  const insertOperations = issueNumbers
    .filter(
      (issueNumber) =>
        !existingIssues
          .map(({ issueNumber: existingIssueNumber }) => existingIssueNumber)
          .includes(issueNumber)
    )
    .map((issueNumber) =>
      prisma.issue.create({
        data: {
          country,
          magazine,
          issueNumber,
          condition: conditionNewIssues,
          isOnSale: isOnSaleNewIssues,
          isToRead: isToReadNewIssues,
          purchaseId: purchaseIdNewIssues,
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

const deleteIssues = async (
  userId: number,
  publicationCode: string,
  issueNumbers: string[]
) => {
  const [country, magazine] = publicationCode.split("/");
  await prisma.issue.deleteMany({
    where: {
      country,
      magazine,
      issueNumber: {
        in: issueNumbers,
      },
      userId,
    },
  });
};

const addOrChangeCopies = async (
  userId: number,
  publicationCode: string,
  issueNumber: string,
  conditions: string[],
  areOnSale: boolean[],
  areToRead: boolean[] | string[],
  purchaseIds: number[]
): Promise<{ [key: string]: number }> => {
  await deleteIssues(userId, publicationCode, [issueNumber]);
  const [country, magazine] = publicationCode.split("/");

  const insertOperations = [...new Set(conditions.keys())]
    .filter(
      (copyNumber) =>
        !["missing", "non_possede"].includes(conditions[copyNumber])
    )
    .map((copyNumber) =>
      prisma.issue.create({
        data: {
          country,
          magazine,
          issueNumber,
          condition: conditionToEnum(conditions[copyNumber]),
          isOnSale: areOnSale[copyNumber] || false,
          isToRead:
            areToRead[copyNumber] === "do_not_change"
              ? false
              : (areToRead[copyNumber] as boolean) || false,
          purchaseId: purchaseIds[copyNumber] || -2,
          userId,
          creationDate: new Date(),
        },
      })
    );
  await prisma.$transaction(insertOperations);

  return {
    insertOperations: insertOperations.length,
  };
};

const checkPurchaseIdsBelongToUser = async (
  purchaseIds: number[] | string[],
  userId: number
): Promise<(number | null)[]> => {
  const checkedPromiseIds = [];
  for (const purchaseId of purchaseIds) {
    switch (purchaseId) {
      case "do_not_change":
        checkedPromiseIds.push(-1);
        break;
      case "unlink":
        checkedPromiseIds.push(-2);
        break;
      default:
        checkedPromiseIds.push(
          (await getUserPurchase(purchaseId as number, userId))
            ? (purchaseId as number)
            : null
        );
    }
  }
  return checkedPromiseIds;
};

export const get: Handler = async (req, res) => {
  if (req.user.username === "demo") {
    await resetDemo();
  }
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify(
      await prisma.issue.findMany({
        where: {
          userId: req.user.id,
        },
      })
    )
  );
};

export const post = [
  parseForm,
  (async (req, res) => {
    const { publicationcode, issueNumbers } = req.body;

    const [country, magazine] = publicationcode.split("/");

    let condition = req.body.condition;
    const userId = req.user.id;

    if (typeof condition !== "string" && issueNumbers.length > 1) {
      res.statusCode = constants.HTTP_STATUS_BAD_REQUEST;
      console.error("Can't update copies of multiple issues at once");
      res.end();
    }

    let isOnSale = req.body.isOnSale;
    if (typeof isOnSale === "undefined" || isOnSale === "do_not_change") {
      isOnSale = null;
    } else if (JSON.stringify(isOnSale) === JSON.stringify(["do_not_change"])) {
      isOnSale = [null];
    }
    let isToRead = req.body.isToRead;
    if (typeof isToRead === "undefined" || isToRead === "do_not_change") {
      isToRead = null;
    } else if (JSON.stringify(isToRead) === JSON.stringify(["do_not_change"])) {
      isToRead = [null];
    }

    const purchaseIds =
      typeof req.body.purchaseId === "object"
        ? req.body.purchaseId
        : [req.body.purchaseId];
    const checkedPurchaseIds = await checkPurchaseIdsBelongToUser(
      purchaseIds,
      userId
    );

    let output;
    if (typeof condition !== "string" && condition.length === 1) {
      condition = condition[0];
      isToRead = isToRead[0];
      isOnSale = isOnSale[0];
    }

    let issueIds: number[];
    if (isOnSale !== "do_not_change") {
      issueIds = (
        await prisma.issue.findMany({
          where: {
            userId,
            country,
            magazine,
            issueNumber: { in: issueNumbers },
          },
        })
      ).map(({ id }) => id);
      if (typeof isOnSale === "string") {
        // Marketplace actions
        const [action, buyerId] = isOnSale.split("-");
        const requestedIssues = await prisma.requestedIssue.findMany({
          where: {
            buyerId: parseInt(buyerId),
            issueId: { in: issueIds },
          },
        });
        if (requestedIssues.length !== issueNumbers.length) {
          res.writeHead(400);
          res.end();
          return;
        }
        switch (action) {
          case "transfer":
            const issueCount = await prisma.issue.count({
              where: {
                id: { in: issueIds },
                userId,
              },
            });
            if (issueCount !== issueIds.length) {
              res.writeHead(400);
              res.end();
              return;
            }
            await prisma.issue.updateMany({
              data: {
                purchaseId: -1,
                isOnSale: false,
                isToRead: true,
                isSubscription: 0,
                creationDate: new Date(),
              },
              where: {
                id: { in: issueIds },
              },
            });
            await prisma.requestedIssue.deleteMany({
              where: {
                buyerId: parseInt(buyerId),
                issueId: { in: issueIds },
              },
            });
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ transferred: issueNumbers }));
            break;
          case "setAside":
            await prisma.requestedIssue.updateMany({
              data: {
                isBooked: true,
              },
              where: {
                buyerId: parseInt(buyerId),
                issueId: { in: issueIds },
              },
            });
            isOnSale = true;
            break;
        }
      } else {
        await prisma.requestedIssue.updateMany({
          data: {
            isBooked: false,
          },
          where: {
            issueId: { in: issueIds },
          },
        });
      }
    }
    if (typeof condition !== "string") {
      output = addOrChangeCopies(
        userId,
        publicationcode,
        issueNumbers[0],
        condition ?? [],
        isOnSale ?? [],
        isToRead ?? [],
        purchaseIds ?? []
      );
    } else {
      if (["non_possede", "missing"].includes(condition)) {
        await deleteIssues(userId, publicationcode, issueNumbers);
        res.statusCode = constants.HTTP_STATUS_OK;
        res.end(JSON.stringify({}));
      }
      output = addOrChangeIssues(
        userId,
        publicationcode,
        issueNumbers,
        condition,
        isOnSale,
        isToRead,
        checkedPurchaseIds[0]
      );
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(output));
  }) as Handler,
];
