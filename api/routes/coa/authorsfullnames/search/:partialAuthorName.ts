import { Handler, Response } from "express";

import { inducks_person, PrismaClient } from "~prisma_clients/client_coa";

const prisma = new PrismaClient();

export type getType = { [personcode: string]: inducks_person[] };
export const get: Handler = async (req, res: Response<getType>) => {
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
