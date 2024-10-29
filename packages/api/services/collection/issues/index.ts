import { parse } from "csv-parse/sync";
import { existsSync, readFileSync } from "fs";
import { cwd } from "process";
import type { Socket } from "socket.io";

import { getPublicationTitles } from "~/services/coa/publications";
import { getShownQuotations } from "~/services/coa/quotations";
import type { InducksIssueQuotationSimple } from "~dm-types/InducksIssueQuotationSimple";
import type { TransactionResults } from "~dm-types/TransactionResults";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";
import type { issue, user } from "~prisma-schemas/schemas/dm";
import { issue_condition } from "~prisma-schemas/schemas/dm";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import type Events from "../types";
import {
  checkPurchaseIdsBelongToUser,
  deleteIssues,
  handleIsOnSale,
} from "./util";

const getCoaCountByPublicationcode = (collectionPublicationcodes: string[]) =>
  prismaCoa.inducks_issue
    .groupBy({
      _count: {
        issuenumber: true,
      },
      where: {
        publicationcode: {
          in: collectionPublicationcodes,
        },
      },
      by: ["publicationcode"],
    })
    .then((data) =>
      Object.fromEntries(
        data.map(({ publicationcode, _count }) => [
          publicationcode!,
          _count.issuenumber,
        ]),
      ),
    );

const getCoaCountByCountrycode = (collectionCountrycodes: string[]) =>
  prismaCoa.inducks_issue
    .groupBy({
      _count: {
        issuenumber: true,
      },
      where: {
        OR: collectionCountrycodes.map((countrycode) => ({
          publicationcode: {
            startsWith: `${countrycode}/`,
          },
        })),
      },
      by: ["publicationcode"],
    })
    .then((data) =>
      data.reduce<Record<string, number>>(
        (acc, { publicationcode, _count }) => {
          const countrycode = publicationcode!.split("/")[0];
          acc[countrycode] = _count.issuenumber + (acc[countrycode] || 0);
          return acc;
        },
        {},
      ),
    );

export default (socket: Socket<Events>) => {
  socket.on("getIssues", async (callback) => {
    if (socket.data.user!.username === "demo") {
      await resetDemo();
    }
    prismaDm.issue
      .findMany({
        where: {
          userId: socket.data.user!.id,
          issuecode: {
            not: {
              equals: null,
            },
          },
        },
      })
      .then((issues) =>
        prismaCoa.augmentIssueArrayWithInducksData(
          issues as (issue & { issuecode: string })[],
        ),
      )
      .then(async (issues) => {
        const collectionPublicationcodes = [
          ...new Set(issues.map(({ publicationcode }) => publicationcode!)),
        ];
        const collectionCountrycodes = [
          ...new Set(
            collectionPublicationcodes.map(
              (publicationcode) => publicationcode.split("/")[0],
            ),
          ),
        ];

        return {
          issues,
          countByCountrycode: await getCoaCountByCountrycode(
            collectionCountrycodes,
          ),
          countByPublicationcode: await getCoaCountByPublicationcode(
            collectionPublicationcodes,
          ),
          publicationNames: await getPublicationTitles({
            publicationcode: {
              in: collectionPublicationcodes,
            },
          }),
        };
      })
      .then(callback);
  });

  socket.on(
    "addOrChangeIssues",
    async (
      { issuecodes, purchaseId, isOnSale, condition, isToRead },
      callback,
    ) => {
      const user = socket.data.user!;

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
              issuecode: {
                in: issuecodes,
              },
            },
          })
        ).map(({ id }) => id);
        for (const issueId of issueIds) {
          await handleIsOnSale(issueId, isOnSale);
        }
      }

      if (condition === null) {
        await deleteIssues(user.id, issuecodes);
        return callback({});
      }
      callback(
        await addOrChangeIssues(
          user.id,
          issuecodes,
          condition,
          isOnSale === undefined ? undefined : isOnSale !== false,
          isToRead,
          checkedPurchaseId,
        ),
      );
    },
  );
  socket.on("addOrChangeCopies", async ({ issuecode, copies }, callback) => {
    const userId = socket.data.user!.id;

    const checkedPurchaseIds = await checkPurchaseIdsBelongToUser(
      copies
        .map(({ purchaseId }) => purchaseId)
        .filter((purchaseId) => !!purchaseId) as number[],
      userId,
    );

    const output = await addOrChangeCopies(
      userId,
      issuecode,
      copies.map(({ id }) => id),
      copies.map(({ condition }) => condition),
      copies.map(({ isOnSale }) =>
        isOnSale === undefined ? undefined : isOnSale !== false,
      ),
      copies.map(({ isToRead }) => isToRead),
      checkedPurchaseIds,
    );

    const currentCopyIds = (
      await prismaDm.issue.findMany({
        select: {
          id: true,
        },
        where: {
          issuecode,
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
  });

  socket.on("getCollectionQuotations", async (callback) =>
    prismaDm.$queryRaw<InducksIssueQuotationSimple[]>`
          select
            issuecode,
            round(min(estimationmin))                         AS estimationMin,
            case max(ifnull(estimationmax, 0))
                when 0 then null
                else round(max(ifnull(estimationmax, 0))) end AS estimationMax
          from dm.numeros
            inner join coa.inducks_issuequotation using (issuecode)
          where ID_Utilisateur = ${socket.data.user!.id}
            and estimationmin is not null
          group by numeros.ID;
        `
      .then(getShownQuotations)
      .then((quotations) => callback({ quotations })),
  );
};

const addOrChangeIssues = async (
  userId: number,
  issuecodes: string[],
  condition: issue_condition | undefined,
  isOnSale: boolean | undefined,
  isToRead: boolean | undefined,
  purchaseId: number | null | undefined,
): Promise<TransactionResults> => {
  const existingIssues = await prismaDm.issue.findMany({
    where: {
      issuecode: {
        in: issuecodes,
      },
      userId,
    },
  });

  const updateOperations = existingIssues.map((existingIssue) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, publicationcode, issuecode, ...existingIssueWithoutId } =
      existingIssue;
    return prismaDm.issue.update({
      data: {
        ...existingIssueWithoutId,
        condition,
        isOnSale,
        isToRead,
        purchaseId: purchaseId === null ? -1 : purchaseId,
      },
      where: { id: existingIssue.id },
    });
  });
  await prismaDm.$transaction(updateOperations);

  const insertOperations = issuecodes
    .filter(
      (issuecode) =>
        !existingIssues
          .map(({ issuecode: existingIssuecode }) => existingIssuecode)
          .includes(issuecode),
    )
    .map((issuecode) =>
      prismaDm.issue.create({
        data: {
          country: "",
          magazine: "",
          issuenumber: "",
          issuecode,
          condition: condition || issue_condition.indefini,
          isOnSale: isOnSale || false,
          isToRead: isToRead || false,
          purchaseId: purchaseId === null ? -1 : purchaseId,
          userId,
          creationDate: new Date(),
        },
      }),
    );
  await prismaDm.$transaction(insertOperations);

  return {
    updateOperations: updateOperations.length,
    insertOperations: insertOperations.length,
  };
};

const addOrChangeCopies = async (
  userId: number,
  issuecode: string,
  issueIds: (number | null)[],
  conditions: (issue_condition | null)[],
  areOnSale: (boolean | undefined)[],
  areToRead: (boolean | undefined)[],
  purchaseIds: (number | null)[],
): Promise<TransactionResults> => {
  const operations = issueIds.map((issueId, copyNumber) => {
    if (issueId && conditions[copyNumber] === null) {
      return prismaDm.issue.delete({
        where: { id: issueId },
      });
    }
    const common = {
      condition: conditions[copyNumber]!,
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
        country: "",
        magazine: "",
        issuenumber: "",
        issuecode,
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

export const resetDemo = async () => {
  const demo = (await prismaDm.demo.findUnique({ where: { id: 1 } }))!;
  if (
    !(
      getHoursFromDate(demo.lastReset) < getHoursFromDate(new Date()) ||
      demo.lastReset.getTime() + 3_600_000 < new Date().getTime()
    )
  ) {
    return;
  }

  const csvPath = existsSync("/app/demo_issues.csv")
    ? "/app/"
    : cwd() + "/services/";

  demo.lastReset = new Date();
  await prismaDm.demo.update({
    data: demo,
    where: {
      id: demo.id,
    },
  });

  const demoUser = (await prismaDm.user.findFirst({
    where: { username: "demo" },
  }))!;
  await deleteUserData(demoUser);
  await resetBookcaseOptions(demoUser);

  interface CsvIssue {
    issuecode: string;
    condition: issue_condition;
    purchaseId: string;
  }

  const currentDir = process.cwd();
  console.log(currentDir);

  const csvIssues: CsvIssue[] = parse(
    readFileSync(`${csvPath}demo_issues.csv`),
    { columns: true },
  );
  await prismaDm.issue.createMany({
    data: csvIssues.map(({ issuecode, condition, purchaseId }) => ({
      userId: demoUser.id,
      country: "",
      magazine: "",
      issuenumber: "",
      issuecode,
      condition,
      purchaseId: parseInt(purchaseId),
      isOnSale: false,
    })),
  });

  interface CsvPurchase {
    date: string;
    description: string;
  }

  const csvPurchases: CsvPurchase[] = parse(
    readFileSync(`${csvPath}demo_purchases.csv`),
    { columns: true },
  );
  await prismaDm.purchase.createMany({
    data: csvPurchases.map(({ date, description }) => ({
      userId: demoUser.id,
      date: new Date(date),
      description,
    })),
  });
};

const deleteUserData = async (
  user: user,
  issuesOnly = false,
): Promise<void> => {
  await prismaDm.issue.deleteMany({ where: { userId: user.id } });

  if (issuesOnly) {
    return;
  }

  await prismaDm.purchase.deleteMany({ where: { userId: user.id } });
  await prismaDm.userOption.deleteMany({ where: { userId: user.id } });
  await prismaDm.authorUser.deleteMany({ where: { userId: user.id } });
};

const getHoursFromDate = (date: Date) =>
  parseInt(date.toISOString().match(/(?<=T)[^:]+/)![0]);

const resetBookcaseOptions = async (user: user) => {
  await prismaDm.user.update({
    data: {
      bookcaseTexture1: "bois",
      bookcaseSubTexture1: "HONDURAS MAHOGANY",
      bookcaseTexture2: "bois",
      bookcaseSubTexture2: "KNOTTY PINE",
      showDuplicatesInBookcase: true,
    },
    where: { id: user.id },
  });
};
