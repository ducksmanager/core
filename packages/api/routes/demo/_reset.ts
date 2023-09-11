import { parse } from "csv-parse/sync";
import * as fs from "fs";
import path from "path";

import { prismaDm } from "~/prisma";
import { user } from "~prisma-clients/client_dm";

import { conditionToEnum } from "../collection/issues/_common";

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
    publicationcode: string;
    condition: string;
    purchaseId: string;
    issuenumber: string;
  }

  const csvIssues: CsvIssue[] = parse(
    fs.readFileSync(path.resolve(__dirname, "./demo_issues.csv")),
    { columns: true }
  );
  await prismaDm.$transaction(
    csvIssues.map(({ publicationcode, condition, purchaseId, issuenumber }) => {
      const [country, magazine] = publicationcode.split("/");
      return prismaDm.issue.create({
        data: {
          userId: demoUser.id,
          country,
          magazine,
          issuenumber,
          condition: conditionToEnum(condition),
          purchaseId: parseInt(purchaseId),
          isOnSale: false,
        },
      });
    })
  );

  interface CsvPurchase {
    date: string;
    description: string;
  }

  const csvPurchases: CsvPurchase[] = parse(
    fs.readFileSync(path.resolve(__dirname, "./demo_purchases.csv")),
    { columns: true }
  );
  await prismaDm.$transaction(
    csvPurchases.map(({ date, description }) =>
      prismaDm.purchase.create({
        data: {
          userId: demoUser.id,
          date: new Date(date),
          description,
        },
      })
    )
  );
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
};
