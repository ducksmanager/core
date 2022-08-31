import { Handler } from "express";

import { PrismaClient } from "~prisma_clients/client_coa";

const prisma = new PrismaClient();

export const get: Handler = async (req, res) => {
  const authorPersoncodes = [...new Set(req.params.authors.split(","))];

  const authors = await prisma.inducks_person.findMany({
    where: {
      personcode: {
        in: authorPersoncodes,
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
