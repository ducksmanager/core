import bodyParser from "body-parser";
import { PublicationTitles } from "~types/PublicationTitles";

import { prismaCoa } from "~/prisma";
import { ExpressCall } from "~routes/_express-call";

export const getPublicationTitlesFromCodes = async (
  publicationCodes: string[]
) => await getPublicationTitles({ in: publicationCodes });

const parseForm = bodyParser.json();
export const post = [
  parseForm,
  async (
    ...[req, res]: ExpressCall<{
      resBody: PublicationTitles;
      reqBody: { publicationCodes: string[] };
    }>
  ) => {
    const publicationCodes = req.body.publicationCodes || [];
    if (!publicationCodes.length) {
      return res.json(await getAllPublicationTitles());
    } else {
      return res.json(await getPublicationTitlesFromCodes(publicationCodes));
    }
  },
];

const getAllPublicationTitles = async () => await getPublicationTitles({});
export const getPublicationTitles = async (filter: {
  [operator: string]: string | string[];
}): Promise<PublicationTitles> =>
  (
    await prismaCoa.inducks_publication.findMany({
      where: {
        publicationcode: filter,
      },
    })
  ).reduce(
    (acc, value) => ({ ...acc, [value.publicationcode]: value.title }),
    {}
  );
