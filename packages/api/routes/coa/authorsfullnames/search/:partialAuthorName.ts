import { prismaCoa } from "~/prisma";
import { ExpressCall } from "~routes/_express-call";

export const get = async (
  ...[req, res]: ExpressCall<{
    resBody: { [_personcode: string]: string };
    params: { partialAuthorName: string };
  }>
) => {
  const partialAuthorName = req.params.partialAuthorName;

  const authors = await prismaCoa.inducks_person.findMany({
    where: {
      fullname: {
        startsWith: partialAuthorName,
      },
    },
    take: 10,
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
