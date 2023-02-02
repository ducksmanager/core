import { inducks_person, PrismaClient } from "~prisma_clients/client_coa";
import { ExpressCall } from "~routes/_express-call";

const prisma = new PrismaClient();

export const get = async (
  ...[req, res]: ExpressCall<
    { [_personcode: string]: inducks_person[] },
    { partialAuthorName: string }
  >
) => {
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
