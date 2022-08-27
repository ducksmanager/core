import { Handler } from "express";

import { PrismaClient } from "../../../../prisma/generated/client_coa";

const prisma = new PrismaClient();

export const get: Handler = async (req, res) => {
  const partialAuthorName = req.params.partialAuthorName;

  const authors = await prisma.inducks_person.findMany({
    where: {
      fullname: {
        contains: partialAuthorName,
      },
    },
  });

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify(
      authors.reduce(
        (acc, value) => ({
          ...acc,
          [value.personcode]: value.fullname,
        }),
        {}
      )
    )
  );
};
