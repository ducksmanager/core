import { firefox } from "playwright-firefox";

import { getScrapeCacheTime, syncScrapeCache } from "~/cache";
import {
  createQuotations,
  deleteQuotations,
  isInducksIssuecodeExisting,
} from "~/coa";
import { readCsvMapping } from "~/csv";

import { getRevue } from "./get-revue";
import { getSerie } from "./get-serie";
import type { ConsoleArgs } from "~/index";

const MAPPING_FILE = "scrapes/bedetheque/coa-mapping.csv";
const ROOT_URL = "https://www.bedetheque.com/";

export const NAVIGATION_TIMEOUT = 60_000;

// Prevent Cloudflare hard-challenges bursts
const DELAY_BETWEEN_PAGES = 20_000;

export const error = (...args: ConsoleArgs) =>
  console.error(`[bedetheque]`, ...args);
export const warn = (...args: ConsoleArgs) =>
  console.warn(`[bedetheque]`, ...args);
export const log = (...args: ConsoleArgs) =>
  console.log(`[bedetheque]`, ...args);

export type CsvIssue = {
  bedetheque_url: string;
  bedetheque_num: string;
  bedetheque_title: string;
  issuecode: string;
};
const quotations: Parameters<typeof createQuotations>[0] = [];

export async function scrape() {
  const mappedIssues: CsvIssue[] = [];

  await readCsvMapping<CsvIssue>(MAPPING_FILE, (record) =>
    mappedIssues.push(record),
  );
  const seriesUrls = [
    ...new Set(mappedIssues.map(({ bedetheque_url }) => bedetheque_url)),
  ];

  const browser = await firefox.launch();
  const page = await browser.newPage();

  try {
    let isFirstPage = true;
    for (const serieUrl of seriesUrls) {
      if (!isFirstPage) {
        await page.waitForTimeout(DELAY_BETWEEN_PAGES);
      }
      isFirstPage = false;

      let scrapeOutput;
      try {
        scrapeOutput = await syncScrapeCache<
          Awaited<ReturnType<typeof getRevue>>
        >(
          "bedetheque",
          `${serieUrl}.json`,
          ROOT_URL + serieUrl,
          async () =>
            serieUrl.startsWith("revue-")
              ? await getRevue(page, ROOT_URL, serieUrl, "bedetheque")
              : await getSerie(page, ROOT_URL, serieUrl, "bedetheque"),
          (contents) => JSON.parse(contents.toString()),
          (contents) => JSON.stringify(contents),
        );
      } catch (e) {
        error(`Scraping of ${serieUrl} failed: ${e}`);
        continue;
      }
      if (!scrapeOutput) {
        warn(`This page cannot be scraped: ${serieUrl}`);
        continue;
      }
      const mappedIssuesForSeries = mappedIssues.filter(
        ({ bedetheque_url }) => bedetheque_url === serieUrl,
      );
      for (const {
        bedetheque_num,
        bedetheque_title,
        issuecode,
      } of mappedIssuesForSeries) {
        if (await isInducksIssuecodeExisting(issuecode)) {
          const bedethequeAlbum = scrapeOutput.albums.find(
            ({ albumNum, albumTitle }) =>
              !(
                (bedetheque_num !== "" && albumNum !== bedetheque_num) ||
                (bedetheque_title !== "" && albumTitle !== bedetheque_title)
              ),
          );
          if (!bedethequeAlbum) {
            warn(
              ` No issue found in Bedetheque series "${serieUrl}": num=${bedetheque_num}, title=${bedetheque_title}`,
            );
          } else {
            let { estimationEuros } = bedethequeAlbum;
            if (!estimationEuros) {
              estimationEuros = [];
            }
            quotations.push({
              issuecode,
              estimationMin: estimationEuros[0] || null,
              estimationMax: estimationEuros[1] || null,
              scrapeDate: getScrapeCacheTime("bedetheque", `${serieUrl}.json`),
              source: "bedetheque",
            });
          }
        }
      }
      log("Done");
    }
  } finally {
    await page.close();
    await browser.close();
  }

  await deleteQuotations("bedetheque");
  await createQuotations(quotations);
  log("Done for all");
}
