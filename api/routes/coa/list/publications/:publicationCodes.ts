import bodyParser from "body-parser";
import { Handler } from "express";

import { PrismaClient } from "~prisma_clients/client_coa";

const prisma = new PrismaClient();

const parseForm = bodyParser.json();

export const get = [
  parseForm,
  (async (req, res) => {
    const publicationcodes = req.params.publicationcodes?.split(",") || "";
    if (/^[a-z]+$/.test(publicationcodes[0])) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify(
          await getPublicationTitlesFromCountry(publicationcodes[0])
        )
      );
    } else {
      if (!publicationcodes.length || publicationcodes.length > 20) {
        res.writeHead(400);
        res.end();
      } else {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify(await getPublicationTitlesFromCodes(publicationcodes))
        );
      }
    }
  }) as Handler,
];

const getPublicationTitlesFromCountry = async (countrycode: string) =>
  await getPublicationTitles({ startsWith: `${countrycode}/` });

export const getPublicationTitlesFromCodes = async (
  publicationcodes: string[]
) => await getPublicationTitles({ in: publicationcodes });

const getPublicationTitles = async (filter: {
  [key: string]: string | string[];
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
