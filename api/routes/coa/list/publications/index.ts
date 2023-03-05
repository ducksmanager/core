import { PrismaClient } from "~prisma_clients/client_coa";
import { ExpressCall } from "~routes/_express-call";
import { PublicationTitles } from "~types/PublicationTitles";

const prisma = new PrismaClient();

export const getPublicationTitlesFromCodes = async (
  publicationCodes: string[]
) => await getPublicationTitles({ in: publicationCodes });

export const get = async (
  ...[req, res]: ExpressCall<{
    resBody: PublicationTitles;
    query: { publicationCodes: string };
  }>
) => {
  const publicationCodes = req.query.publicationCodes?.split(",") || "";
  if (publicationCodes.length > 20) {
    res.writeHead(400);
    return res.end();
  } else if (!publicationCodes.length) {
    return res.json(await getAllPublicationTitles());
  } else {
    return res.json(await getPublicationTitlesFromCodes(publicationCodes));
  }
};

const getAllPublicationTitles = async () => await getPublicationTitles({});
export const getPublicationTitles = async (filter: {
  [operator: string]: string | string[];
}): Promise<PublicationTitles> =>
  (
    await prisma.inducks_publication.findMany({
      where: {
        publicationcode: filter,
      },
    })
  ).reduce(
    (acc, value) => ({ ...acc, [value.publicationcode]: value.title }),
    {}
  );
