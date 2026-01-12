import { parse } from "csv-parse/sync";
import { existsSync, readFileSync } from "fs";
import { cwd } from "process";

import type {
  CollectionUpdateMultipleIssues,
  CollectionUpdateSingleIssue,
} from "~dm-types/CollectionUpdate";
import type { InducksIssueQuotationSimple } from "~dm-types/InducksIssueQuotationSimple";
import type { TransactionResults } from "~dm-types/TransactionResults";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa";
import type { user } from "~prisma-schemas/schemas/dm/client/client";
import { issue_condition } from "~prisma-schemas/schemas/dm/client/client";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm";

import type { UserServices } from "../../../index";
import { getShownQuotations } from "../../coa/quotations";
import { checkPurchaseIdsBelongToUser, deleteIssues } from "./util";

export default ({ _socket }: UserServices) => ({
  getIssues: async () => {
    if (_socket.data.user.username === "demo") {
      await resetDemo();
    }
    return prismaDm.issue
      .findMany({
        include: {
          labels: true,
        },
        where: {
          userId: _socket.data.user.id,
          issuecode: {
            not: {
              equals: null,
            },
          },
        },
      })
      .then(<T extends { labels: { labelId: number }[] }>(issues: T[]) =>
        prismaCoa
          .augmentIssueArrayWithInducksData(
            issues as (T & { issuecode: string })[]
          )
          .then((data) => data.filter((issue) => "publicationcode" in issue))
          .then(prismaDm.replaceLabelsWithLabelIds)
      );
  },

  setIssuesAside: async (issueIds: number[], buyerId: number) => {
    await prismaDm.requestedIssue.createMany({
      data: issueIds.map((issueId) => ({
        issueId,
        buyerId,
        isBooked: true,
      })),
    });
  },
  transferIssues: async (issueIds: number[], buyerId: number) => {
    await prismaDm.issue.updateMany({
      data: {
        userId: buyerId,
        purchaseId: -1,
        isSubscription: false,
      },
      where: { id: { in: issueIds } },
    });
    await prismaDm.issueLabel.deleteMany({
      where: {
        issueId: { in: issueIds },
      },
    });
    await prismaDm.requestedIssue.deleteMany({
      where: {
        issueId: { in: issueIds },
        buyerId,
      },
    });
  },

  addOrChangeIssues: async ({
    issuecodes,
    purchaseId,
    condition,
    labelIds,
  }: CollectionUpdateMultipleIssues) => {
    const user = _socket.data.user;

    let checkedPurchaseId: number | null = null;
    if (typeof purchaseId === "number") {
      checkedPurchaseId = (
        await checkPurchaseIdsBelongToUser([purchaseId], user.id)
      )[0];
    }

    if (condition === null) {
      await deleteIssues(user.id, issuecodes);
      return Promise.resolve({});
    }
    return await addOrChangeIssues(
      user.id,
      issuecodes,
      condition,
      checkedPurchaseId,
      labelIds
    );
  },
  addOrChangeCopies: async ({
    issuecode,
    copies,
  }: CollectionUpdateSingleIssue) => {
    const userId = _socket.data.user.id;

    const checkedPurchaseIds = await checkPurchaseIdsBelongToUser(
      copies
        .map(({ purchaseId }) => purchaseId)
        .filter((purchaseId) => !!purchaseId) as number[],
      userId
    );

    const output = await addOrChangeCopies(
      userId,
      issuecode,
      copies.map(({ id }) => id),
      copies.map(({ condition }) => condition),
      checkedPurchaseIds,
      copies.map(({ labelIds }) => labelIds)
    );

    return output;
  },

  getCollectionQuotations: (): Promise<
    Record<string, InducksIssueQuotationSimple>
  > =>
    prismaDm.$queryRaw<InducksIssueQuotationSimple[]>`
          select
            issuecode,
            round(min(estimationmin))                         AS estimationMin,
            case max(ifnull(estimationmax, 0))
                when 0 then null
                else round(max(ifnull(estimationmax, 0))) end AS estimationMax
          from dm.numeros
            inner join coa.inducks_issuequotation using (issuecode)
          where ID_Utilisateur = ${_socket.data.user.id}
            and estimationmin is not null
          group by numeros.ID;
        `.then(getShownQuotations),
});

const addOrChangeIssues = async (
  userId: number,
  issuecodes: string[],
  condition: issue_condition | undefined,
  purchaseId: number | null | undefined,
  _labelIds: number[] | undefined
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
    const {
      id,
      issuecode: _issuecode,
      ...existingIssueWithoutId
    } = existingIssue;
    return prismaDm.issue.update({
      data: {
        ...existingIssueWithoutId,
        condition,
        purchaseId: purchaseId === null ? -1 : purchaseId,
        // TODO handle labels on multiple issues
        // labels: {
        //   deleteMany: {},
        // },
      },
      where: { id },
    });
  });
  await prismaDm.$transaction(updateOperations);

  const insertOperations = issuecodes
    .filter(
      (issuecode) =>
        !existingIssues
          .map(({ issuecode: existingIssuecode }) => existingIssuecode)
          .includes(issuecode)
    )
    .map((issuecode) =>
      prismaDm.issue.create({
        data: {
          issuecode,
          condition: condition || issue_condition.indefini,
          purchaseId: purchaseId === null ? -1 : purchaseId,
          userId,
          creationDate: new Date(),
        },
      })
    );
  await prismaDm.$transaction(insertOperations);
  // TODO handle labels on multiple issues

  // const issueIds = (
  //   await prismaDm.issue.findMany({
  //     where: {
  //       issuecode: {
  //         in: issuecodes,
  //       },
  //       userId,
  //     },
  //   })
  // ).map(({ id }) => id);

  // const newIssueLabelsOperations = issueIds.map((issueId) =>
  //   prismaDm.issueLabel.createMany({
  //     data: labelIds?.map((labelId) => ({ labelId, issueId })) || [],
  //   })
  // );
  // await prismaDm.$transaction(newIssueLabelsOperations);

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
  purchaseIds: (number | null)[],
  labelIds: (number[] | undefined)[]
): Promise<TransactionResults> => {
  let operations = [], deleteOperations = [];
  const previousIssueIds = await prismaDm.issue.findMany({
    where: {
      userId,
      issuecode,
    },
  });
  const deletedIssueIds = previousIssueIds.filter(({ id }) => !issueIds.includes(id));
  if (deletedIssueIds.length) {
    deleteOperations = deletedIssueIds.map(({ id }) => prismaDm.issue.delete({
      where: { id },
    }));
    await prismaDm.$transaction(deleteOperations);
  }
  if (issueIds.length) {
    operations = issueIds.map((issueId, copyNumber) => {
      if (issueId && conditions[copyNumber] === null) {
        return prismaDm.issue.delete({
          where: { id: issueId },
        });
      }

      const common = {
        condition: conditions[copyNumber]!,
        purchaseId: purchaseIds[copyNumber] || -2,
      };

      const createInput = {
        ...common,
        issuecode,
        userId,
        creationDate: new Date(),
      };
      const updateInput = {
        ...common,
        labels: {
          deleteMany: {},
        },
      };
      console.log("upsert", {
        create: createInput,
        update: updateInput,
        where: { id: issueId || 0 },
      });
      return prismaDm.issue.upsert({
        create: createInput,
        update: updateInput,
        where: {
          id: issueId || 0,
        },
      });
    });
    const upsertResults = await prismaDm.$transaction(operations);
    const newIssueLabelsOperations = upsertResults
      .map((result, copyNumber) => ({ result, copyNumber }))
      .filter(({ result }) => "id" in result)
      .map(({ result: { id: issueId }, copyNumber }) =>
        prismaDm.issueLabel.createMany({
          data:
            labelIds[copyNumber]?.map((labelId) => ({
              labelId,
              issueId,
            })) || [],
        })
      );
    await prismaDm.$transaction(newIssueLabelsOperations);
  }

  return {
    operations: operations.length + deleteOperations.length,
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
    : cwd() + "/services/auth/";

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

  const csvIssues = parse<CsvIssue>(readFileSync(`${csvPath}demo_issues.csv`), {
    columns: true,
  });
  await prismaDm.issue.createMany({
    data: csvIssues.map(({ issuecode, condition, purchaseId }) => ({
      userId: demoUser.id,
      issuecode,
      condition,
      purchaseId: parseInt(purchaseId),
    })),
  });

  interface CsvPurchase {
    date: string;
    description: string;
  }

  const csvPurchases = parse<CsvPurchase>(
    readFileSync(`${csvPath}demo_purchases.csv`),
    { columns: true }
  );
  await prismaDm.purchase.createMany({
    data: csvPurchases.map(({ date, description }) => ({
      userId: demoUser.id,
      date: new Date(date),
      description,
    })),
  });

  demo.lastReset = new Date();
  await prismaDm.demo.update({
    data: demo,
    where: {
      id: demo.id,
    },
  });
};

const deleteUserData = async (
  user: user,
  issuesOnly = false
): Promise<void> => {
  await prismaDm.issue.deleteMany({ where: { userId: user.id } });

  if (issuesOnly) {
    return;
  }

  await prismaDm.purchase.deleteMany({ where: { userId: user.id } });
  await prismaDm.userOption.deleteMany({ where: { userId: user.id } });
  await prismaDm.authorUser.deleteMany({ where: { userId: user.id } });
  await prismaDm.label.deleteMany({ where: { userId: user.id } });
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
