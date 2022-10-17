import { Handler } from "express";

import { PrismaClient } from "~prisma_clients/client_coa";

const prisma = new PrismaClient();

export const get: Handler = async (req, res) => {
  const { publicationcode } = req.query as { [key: string]: string };
  if (!publicationcode) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end();
    return;
  }
  const data = await prisma.inducks_issue.findMany({
    select: {
      issuenumber: true,
      title: true,
    },
    where: {
      publicationcode,
    },
  });
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify(
      data.map(
        ({ issuenumber, title }) => ({
          issueNumber: issuenumber!.replace(/ +/g, " "),
          title,
        }),
        {} as { [key: string]: { [key: string]: string } }
      )
    )
  );
};
