import { Scraper } from "bedetheque-scraper";

import { syncScrapeCache } from "~/cache";
import { readCsvMapping } from "~/csv";
import { prismaClient } from "~prisma-schemas/schemas/coa";

import { type CsvIssue, log, warn } from ".";
import { getRevue } from "./get-revue";

const MAPPING_FILE = "scrapes/bedetheque/coa-mapping.csv";

const mappedIssues: CsvIssue[] = [];
await readCsvMapping<CsvIssue>(MAPPING_FILE, (record) =>
  mappedIssues.push(record),
);

const skipNonQuoted = false;

const pageUrl = "revue-Mickey-Le-Journal-De-1934-1944.html";
const inducksPublicationCode = "fr/JMAG";

const baseUrl = "https://www.bedetheque.com";
const cacheSubfolder = "bedetheque";

try {
  const contents = await syncScrapeCache<Awaited<ReturnType<typeof getRevue>>>(
    cacheSubfolder,
    pageUrl + ".json",
    `${baseUrl}/${pageUrl}`,
    async (url) =>
      pageUrl.startsWith("revue-")
        ? await getRevue(baseUrl, pageUrl, cacheSubfolder)
        : await Scraper.getSerie(url),
    (contents) => JSON.parse(contents.toString()),
    (contents) => JSON.stringify(contents),
  );

  for (const { albumNum, albumTitle, estimationEuros } of contents.albums) {
    const storedTitle = albumNum ? "" : albumTitle;
    if (!albumNum || !estimationEuros) {
      warn(pageUrl, ": Missing data on album", albumNum);
      continue;
    } else if (!skipNonQuoted || estimationEuros) {
      const issuecode =
        inducksPublicationCode +
        albumNum.padStart(11 - inducksPublicationCode.length, " ");
      try {
        if (
          !mappedIssues.find(
            (mappedIssue) =>
              mappedIssue.bedetheque_url === pageUrl &&
              mappedIssue.bedetheque_num === albumNum &&
              mappedIssue.bedetheque_title === storedTitle,
          )
        ) {
          await prismaClient.inducks_issue.findFirstOrThrow({
            where: {
              issuecode,
            },
          });
          log(
            [issuecode, pageUrl, albumNum || "", storedTitle].join(","),
          );
        }
      } catch (_e) {
        warn(`Issue ${issuecode} not found`);
        log(
          ["?".repeat(10), pageUrl, albumNum || "", storedTitle].join(","),
        );
      }
    }
  }
} catch (e) {
  warn(e);
}

process.exit(0);
