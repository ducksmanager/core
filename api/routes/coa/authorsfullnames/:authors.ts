import { Handler, Response } from "express";

import { Prisma, PrismaClient } from "~prisma_clients/client_coa";

const prisma = new PrismaClient();

export const getAuthorFullNames = async (
  authorPersoncodes: string[]
): Promise<{ [personcode: string]: string }> =>
  (
    await prisma.inducks_person.findMany({
      where: {
        personcode: {
          in: authorPersoncodes,
        },
      },
    })
  ).reduce(
    (acc, value) => ({
      ...acc,
      [value.personcode]: value.fullname,
    }),
    {}
  );

export type getType = Prisma.PromiseReturnType<typeof getAuthorFullNames>;
export const get: Handler = async (req, res: Response<getType>) =>
  res.json(
    await getAuthorFullNames([...new Set(req.params.authors.split(","))])
  );
