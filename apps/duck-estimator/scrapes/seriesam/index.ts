import { firefox } from "playwright-firefox";

import { syncScrapeCache } from "~/cache";
import { createQuotations, getInducksIssuesBetween } from "~/coa";
import { readCsvMapping } from "~/csv";

const MAPPING_FILE = "scrapes/seriesam/coa-mapping.csv";
const ROOT_URL = "https://www.seriesam.com/cgi-bin/guide?s=";
const SEK_TO_EUR_RATE = 0.098;

const quotations: Parameters<typeof createQuotations>[0] = [];

type CsvIssue = {
  publicationcode: string;
  issuenumber: string;
  seriesamQuery: string;
  seriesamTitle: string;
  seriesamYear: string;
};

export async function scrape() {
  const mappedIssues: CsvIssue[] = [];

  await readCsvMapping<CsvIssue>(MAPPING_FILE, (record) =>
    mappedIssues.push(record),
  );
  const seriesUrls = [
    ...new Set(mappedIssues.map(({ seriesamQuery }) => seriesamQuery)),
  ];

  const browser = await firefox.launch();
  const page = await browser.newPage();

  let mappedIssueRowNumber = 0;

  for (const serieUrl of seriesUrls) {
    const url = ROOT_URL + serieUrl;
    console.info(`Scraping ${url}...`);

    const cacheFileName = `${serieUrl.replace(/[/\\?%*:|"<>]/g, "-")}.html`;
    try {
      await syncScrapeCache(
        "seriesam",
        cacheFileName,
        url!,
        async (url) =>
          page.goto(url).then((response) =>
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
          page.setContent(contents);
          return contents;
        },
        (_contents) => _contents,
      );
    } catch (_e) {
      continue;
    }

    const rows = await page.$$(".guidetable tr");

    let seriesamYear;
    for (const row of rows) {
      const {
        seriesamYear: seriesamYearMapping,
        seriesamTitle: seriesamTitleMapping,
        publicationcode,
        issuenumber,
      } = mappedIssues[mappedIssueRowNumber];
      const seriesamYearCell = await row.$("td:nth-child(1)");
      const seriesamTitleCell = await row.$("td:nth-child(2)");
      if (!seriesamYearCell || !seriesamTitleCell) {
        continue;
      }
      if ((await seriesamYearCell.innerText()).includes("Seriesams Guide")) {
        continue;
      }
      const seriesamYearCurrent = (
        await seriesamYearCell.innerText()
      ).trimStart();
      const seriesamTitle = (await seriesamTitleCell.innerText()).trimStart();
      if (seriesamYearCurrent) {
        seriesamYear = seriesamYearCurrent;
      }
      const issuenumbers = await getInducksIssuesBetween(
        publicationcode,
        ...(issuenumber.split(" to ") as [string, string]),
      );
      let hasFoundQuotation = false;
      for (const {
        issuenumber: issuenumberInRange,
        issuecode: issuecodeInRange,
      } of issuenumbers) {
        if (
          seriesamYear === seriesamYearMapping ||
          seriesamTitle === seriesamTitleMapping
        ) {
          let cellNumber = 5;
          let column;
          // eslint-disable-next-line no-constant-condition
          while (true) {
            column = await row.$(`td:nth-child(${cellNumber})`);
            if (column === null) {
              console.warn(
                ` Inducks issue ${publicationcode} ${issuenumberInRange}: No quotation found`,
              );
              break;
            } else {
              const estimation = parseInt(await column.innerText());
              if (isNaN(estimation)) {
                cellNumber++;
              } else {
                console.info(
                  ` Inducks issue ${publicationcode} ${issuenumberInRange}: A quotation was found`,
                );
                const adjustedEstimation =
                  estimation * Math.pow(0.8, cellNumber - 5) * SEK_TO_EUR_RATE;
                quotations.push({
                  issuecode: issuecodeInRange,
                  estimationMin: adjustedEstimation,
                  estimationMax: adjustedEstimation,
                  scrapeDate: null,
                  source: "seriesam",
                });
                hasFoundQuotation = true;
                break;
              }
            }
          }
        }
      }
      if (hasFoundQuotation) {
        mappedIssueRowNumber++;
      }
    }
    console.log("Done");
  }
  await createQuotations(quotations);
  console.log("Done for all");
}
