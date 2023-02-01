import { Prisma, PrismaClient } from "~prisma_clients/client_coa";
import { ExpressCall } from "~routes/_express-call";
import { Call } from "~types/Call";

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

export type getCall = Call<
  Prisma.PromiseReturnType<typeof getAuthorFullNames>,
  { authors: string }
>;
export const get = async (...[req, res]: ExpressCall<getCall>) =>
  res.json(
    await getAuthorFullNames([...new Set(req.params.authors.split(","))])
  );
