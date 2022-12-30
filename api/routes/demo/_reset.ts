import { parse } from "csv-parse/sync";
import * as fs from "fs";
import path from "path";

import { PrismaClient, user } from "~prisma_clients/client_dm";
import { conditionToEnum } from "~routes/collection/issues";

const prisma = new PrismaClient();

const getHoursFromDate = (date: Date) =>
  parseInt(date.toISOString().match(/(?<=T)[^:]+/)![0]);

const resetBookcaseOptions = async (user: user) => {
  await prisma.user.update({
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
  const demo = (await prisma.demo.findUnique({ where: { id: 1 } }))!;
  if (
    !(
      getHoursFromDate(demo.lastReset) < getHoursFromDate(new Date()) ||
      demo.lastReset.getTime() + 3_600_000 < new Date().getTime()
    )
  ) {
    return;
  }

  demo.lastReset = new Date();
  await prisma.demo.update({
    data: demo,
    where: {
      id: demo.id,
    },
  });

  const demoUser = (await prisma.user.findFirst({
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
  await prisma.$transaction(
    csvIssues.map(({ publicationcode, condition, purchaseId, issuenumber }) => {
      const [country, magazine] = publicationcode.split("/");
      return prisma.issue.create({
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
  await prisma.$transaction(
    csvPurchases.map(({ date, description }) =>
      prisma.purchase.create({
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
  await prisma.issue.deleteMany({ where: { userId: user.id } });

  if (issuesOnly) {
    return;
  }

  await prisma.purchase.deleteMany({ where: { userId: user.id } });
  await prisma.userOption.deleteMany({ where: { userId: user.id } });
  await prisma.authorUser.deleteMany({ where: { userId: user.id } });
};
