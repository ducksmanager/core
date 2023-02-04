import { PrismaClient } from "~prisma_clients/client_coa";
import { ExpressCall } from "~routes/_express-call";

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

export const get = async (
  ...[req, res]: ExpressCall<
    { [_personcode: string]: string },
    { authors: string }
  >
) =>
  res.json(
    await getAuthorFullNames([...new Set(req.params.authors.split(","))])
  );
