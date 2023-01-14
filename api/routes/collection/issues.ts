import bodyParser from "body-parser";
import { constants } from "http2";

import {
  issue,
  issue_condition,
  Prisma,
  PrismaClient,
} from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";
import { resetDemo } from "~routes/demo/_reset";
import { Call } from "~types/Call";
import { CollectionUpdate } from "~types/CollectionUpdate";
import { User } from "~types/SessionUser";
import { TransactionResults } from "~types/TransactionResults";
import PromiseReturnType = Prisma.PromiseReturnType;

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
  publicationcode: string,
  issueNumbers: string[],
  condition: string | null,
  isOnSale: boolean | null,
  isToRead: boolean | null,
  purchaseId: number | null
): Promise<TransactionResults> => {
  const [country, magazine] = publicationcode.split("/");

  const conditionNewIssues =
    condition === null ? issue_condition.indefini : conditionToEnum(condition);
  const isOnSaleNewIssues = isOnSale === null ? false : isOnSale;
  const isToReadNewIssues = isToRead === null ? false : isToRead;
  const purchaseIdNewIssues = purchaseId === null ? -2 : purchaseId; // TODO allow NULL

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

const addOrChangeCopies = async (
  userId: number,
  publicationcode: string,
  issuenumber: string,
  conditions: string[],
  areOnSale: boolean[],
  areToRead: boolean[] | string[],
  purchaseIds: number[]
): Promise<TransactionResults> => {
  await deleteIssues(userId, publicationcode, [issuenumber]);
  const [country, magazine] = publicationcode.split("/");

  const insertOperations = [...new Set(conditions.keys())]
    .filter((copyNumber) => !["missing"].includes(conditions[copyNumber]))
    .map((copyNumber) =>
      prisma.issue.create({
        data: {
          country,
          magazine,
          issuenumber,
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

export type getCall = Call<issue[]>;
export const get = async (...[req, res]: ExpressCall<getCall>) => {
  if (req.user.username === "demo") {
    await resetDemo();
  }
  return res.json(
    await prisma.issue.findMany({
      where: {
        userId: req.user.id,
      },
    })
  );
};

export type postCall = Call<
  PromiseReturnType<typeof addOrChangeCopies | typeof addOrChangeIssues>,
  undefined,
  CollectionUpdate
>;
export const post = [
  parseForm,
  async (...[req, res]: ExpressCall<postCall>) => {
    const { body, user }: { body: CollectionUpdate; user: User } = req;
    const { publicationcode, issueIdsByIssuenumber, purchaseId } = body;

    let { isOnSale, condition, isToRead } = body;
    const userId = user.id;

    if (
      typeof condition !== "string" &&
      Object.keys(issueIdsByIssuenumber).length > 1
    ) {
      res.statusCode = constants.HTTP_STATUS_BAD_REQUEST;
      console.error("Can't update copies of multiple issues at once");
      res.end();
    }
    if (typeof isOnSale === "undefined" || isOnSale === "do_not_change") {
      isOnSale = null;
    } else if (JSON.stringify(isOnSale) === JSON.stringify(["do_not_change"])) {
      isOnSale = [null];
    }
    if (typeof isToRead === "undefined" || isToRead === "do_not_change") {
      isToRead = null;
    } else if (JSON.stringify(isToRead) === JSON.stringify(["do_not_change"])) {
      isToRead = [null];
    }

    const purchaseIds =
      typeof purchaseId === "object" ? purchaseId : [purchaseId];
    const checkedPurchaseIds = await checkPurchaseIdsBelongToUser(
      purchaseIds as string[] | number[],
      userId
    );

    let output;
    if (typeof condition !== "string" && condition.length === 1) {
      condition = condition[0];
      isToRead = (isToRead as boolean[])[0];
      isOnSale = (isOnSale as boolean[])[0];
    }

    if (typeof isOnSale !== "string" && isOnSale !== null) {
      const issueIds = Object.values(issueIdsByIssuenumber).reduce(
        (acc, issueIds) => [...acc, ...issueIds],
        []
      );
      await prisma.requestedIssue.updateMany({
        data: {
          isBooked: false,
        },
        where: {
          issueId: { in: issueIds },
        },
      });
    }
    if (typeof condition !== "string") {
      output = await addOrChangeCopies(
        userId,
        publicationcode,
        Object.keys(issueIdsByIssuenumber)[0],
        condition ?? [],
        (isOnSale as boolean[]) ?? [],
        (isToRead as boolean[]) ?? [],
        (purchaseIds as number[]) ?? []
      );
    } else {
      const issueNumbers = Object.keys(issueIdsByIssuenumber);
      if (["missing"].includes(condition)) {
        await deleteIssues(userId, publicationcode, issueNumbers);
        return res.json({});
      }
      output = await addOrChangeIssues(
        userId,
        publicationcode,
        issueNumbers,
        condition,
        isOnSale as boolean | null,
        isToRead as boolean | null,
        checkedPurchaseIds[0]
      );
    }
    return res.json(output);
  },
];
