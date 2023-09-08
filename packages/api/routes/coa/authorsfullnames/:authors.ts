import { prismaCoa } from "prisma-clients";

import { ExpressCall } from "~routes/_express-call";

export const getAuthorFullNames = async (
  authorPersoncodes: string[]
): Promise<{ [personcode: string]: string }> =>
  (
    await prismaCoa.inducks_person.findMany({
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
  ...[req, res]: ExpressCall<{
    resBody: { [_personcode: string]: string };
    params: { authors: string };
  }>
) =>
  res.json(
    await getAuthorFullNames([...new Set(req.params.authors.split(","))])
  );
