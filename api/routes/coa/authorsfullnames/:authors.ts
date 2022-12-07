import { Handler } from "express";

import { PrismaClient } from "~prisma_clients/client_coa";

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

export const get: Handler = async (req, res) => {
  const authorPersoncodes = [...new Set(req.params.authors.split(","))];

  const authors = await getAuthorFullNames(authorPersoncodes);

  return res.json(authors);
};
