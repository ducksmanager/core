import { Handler } from "express";

import { PrismaClient } from "~prisma_clients/client_coa";

const prisma = new PrismaClient();

export const getPublicationTitlesFromCodes = async (
  publicationCodes: string[]
) => await getPublicationTitles({ in: publicationCodes });

export const get: Handler = async (req, res) => {
  const publicationCodes =
    (req.query as { [key: string]: string }).publicationCodes?.split(",") || "";
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
}) =>
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
