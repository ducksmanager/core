import "dotenv/config";

import { firefox } from "playwright-firefox";

import { getScrapeCacheTime, syncScrapeCache } from "~/cache";
import { createQuotations, deleteQuotations } from "~/coa";
import { readCsvMapping } from "~/csv";
import { prismaClient } from "~prisma-schemas/schemas/coa/client";

const MAPPING_FILE = "scrapes/gocollect/coa-mapping.csv";
const ROOT_URL = "https://gocollect.com/app/comics/";

/**
 * DM - CGC mapping:
 *
 * Good condition: 6+ (Fine to Mint)
 * Average condition: 3 to < 6 (Very Good to Fine-)
 * Bad condition: 0.5 to < 3 (Poor to Good+)
 */

const gradingIntervalsForMinEstimation = [0.5, 5.9];
const gradingIntervalsForMaxEstimation = [6, 10];

type CsvIssue = { publicationcode: string; publicationUrl: string };

export async function scrape() {
  const mappedPublications: CsvIssue[] = [];

  await readCsvMapping<CsvIssue>(MAPPING_FILE, (record) =>
    mappedPublications.push(record),
  );

  const browser = await firefox.launch();
  const browserContext = await browser.newContext();
  await browserContext.route(/img.gocollect.com/, (route) => route.abort());
  const page = await browserContext.newPage();

  await page.goto("https://gocollect.com/login");
  await page.fill("#email", process.env.GOCOLLECT_USERNAME!);
  await page.fill("#password", process.env.GOCOLLECT_PASSWORD!);
  const submitButton = await page.$('button[type="submit"]');
  await submitButton!.click();
  console.log("Login done.");

  const issuePage = await browserContext.newPage();

  await deleteQuotations('gocollect');
  for (const { publicationcode, publicationUrl } of mappedPublications) {
    const quotations = [];
    let currentPageForPublication = 1;

    while (true) {
      const url = `${ROOT_URL}${publicationUrl}?page=${currentPageForPublication}`;
      console.info(`Scraping ${url}`);
      await page.goto(url);
      await page.waitForSelector("ul.grid a");
      const issueElementsLocator = page.locator("ul.grid a");
      const issueLinks = await issueElementsLocator.evaluateAll((e) =>
        e.map((el) => (el as HTMLAnchorElement).href),
      );

      for (const issueLinkHref of issueLinks) {
        console.log(`Scraping ${issueLinkHref}`);

        const cacheFileName = `${issueLinkHref!.match(/(?<=\/)[^/+]+$/)![0]}.html`;
        try {
          await syncScrapeCache(
            "gocollect",
            cacheFileName,
            issueLinkHref!,
            async (url) =>
              issuePage.goto(url).then((response) =>
                response!
                  .body()
                  .then((body) => body.toString())
                  .catch((e) => {
                    console.error(`Error while fetching ${url}: ${e}`);
                    throw e;
                  }),
              ),
            (contentsBuffer) => {
              const contents = contentsBuffer.toString();
              issuePage.setContent(contents);
              return contents;
            },
            async (_contents) => {
              if (
                issueLinkHref ===
                "https://gocollect.com/app/comic/uncle-scrooge-116"
              ) {
                await issuePage.pause();
              }
              await issuePage.waitForSelector(
                '[wire\\:key="view-state-company-overview-1"]',
                { timeout: 5000 },
              );
              return _contents;
            },
          );
        } catch (_e) {
          continue;
        }

        const pageTitle = await issuePage.title();
        const issuenumberMatch = pageTitle.match(/(?<=#).+?(?= )/);
        if (!(issuenumberMatch && issuenumberMatch[0])) {
          console.error(`Invalid page title : ${pageTitle}`);
          break;
        }
        const issuenumber = issuenumberMatch[0];
        const issue = await prismaClient.inducks_issue.findFirstOrThrow({
          select: { issuecode: true },
          where: {
            publicationcode,
            issuenumber,
          },
        });

        const issueQuotationRows = await issuePage.$$(
          '[wire\\:key="view-state-company-overview-1"] > .group',
        );

        let estimationMin = [];
        let estimationMax = [];
        for (const issueQuotationRow of issueQuotationRows) {
          const gradingText = await (await issueQuotationRow.$(
            ":nth-child(2)",
          ))!.innerText();
          const grading = parseFloat(gradingText);
          if (isNaN(grading)) {
            console.error(`Grading ${gradingText} is not a number`);
            continue;
          }
          const quotationElement = await issueQuotationRow.$(
            "div.text-sm span:not(.md\\:hidden)",
          );
          if (!quotationElement) {
            continue;
          }
          const quotationText = (await quotationElement.innerText()).replace(
            /^\$|,/g,
            "",
          );
          const quotation = parseInt(quotationText);
          if (isNaN(quotation)) {
            console.error(`Quotation ${quotationText} is not a number`);
            continue;
          }
          console.debug(` Grading ${grading} is worth ${quotation}`);
          if (
            grading >= gradingIntervalsForMinEstimation[0] &&
            grading <= gradingIntervalsForMinEstimation[1]
          ) {
            estimationMin.push(quotation);
          }
          if (
            grading >= gradingIntervalsForMaxEstimation[0] &&
            grading <= gradingIntervalsForMaxEstimation[1]
          ) {
            estimationMax.push(quotation);
          }
        }
        if (!estimationMin.length && !estimationMax.length) {
          continue;
        }
        if (!estimationMin.length && estimationMax.length) {
          estimationMin = estimationMax;
        }
        if (estimationMin.length && !estimationMax.length) {
          estimationMax = estimationMin;
        }
        quotations.push({
          issuecode: issue.issuecode,
          estimationMin: Math.round(
            estimationMin.reduce((acc, value) => acc + value, 0) /
              estimationMin.length,
          ),
          estimationMax: Math.round(
            estimationMax.reduce((acc, value) => acc + value, 0) /
              estimationMax.length,
          ),
          scrapeDate: getScrapeCacheTime("gocollect", cacheFileName),
          source: "gocollect",
        });
      }
      try {
        await page.waitForSelector(
          `[wire\\:key="paginator-page-1-page${++currentPageForPublication}"]`,
          { timeout: 200 },
        );
      } catch (_e) {
        break;
      }
    }
    await createQuotations(quotations);
    console.log(quotations);
    console.log("Done");
  }
  console.log("Done for all");
}
