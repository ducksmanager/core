import { prismaCoa } from "~/prisma";
import { inducks_person } from "~prisma-clients/client_coa";
import { ExpressCall } from "~routes/_express-call";

export const get = async (
  ...[req, res]: ExpressCall<{
    resBody: { [_personcode: string]: inducks_person[] };
    params: { partialAuthorName: string };
  }>
) => {
  const partialAuthorName = req.params.partialAuthorName;

  const authors = await prismaCoa.inducks_person.findMany({
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
