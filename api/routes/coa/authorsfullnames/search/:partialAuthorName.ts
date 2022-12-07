import { Handler } from "express";

import { PrismaClient } from "~prisma_clients/client_coa";

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

  return res.json(
    authors.reduce(
      (acc, value) => ({
        ...acc,
        [value.personcode]: value.fullname,
      }),
      {}
    )
  );
};
