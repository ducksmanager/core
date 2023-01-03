import { inducks_person, PrismaClient } from "~prisma_clients/client_coa";
import { ExpressCall } from "~routes/_express-call";
import { Call } from "~types/Call";

const prisma = new PrismaClient();

export type getCall = Call<
  { [personcode: string]: inducks_person[] },
  { partialAuthorName: string }
>;
export const get = async (...[req, res]: ExpressCall<getCall>) => {
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
