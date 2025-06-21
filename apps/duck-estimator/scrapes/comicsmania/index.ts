import { firefox } from "playwright-firefox";

import { createQuotations, deleteQuotations, getIssuecode } from "~/coa";
import { readCsvMapping } from "~/csv";

const MAPPING_FILE = "scrapes/comicsmania/coa-mapping.csv";
const REGEX_ISSUENUMBER = /^(?:ΤΕΥΧΟΣ:|\n)?[-\d]+\b(?! ?€)/s;
const REGEX_PRICE = /[\d,]+(?= ?€)/s;
type CsvIssue = {
  publicationcode: string;
  sectionTitle: string;
  issueCellRegex: string;
};
const publicationsWithIssues: CsvIssue[] = [];
const quotations: Parameters<typeof createQuotations>[0] = [];

export async function scrape() {
  const mappedIssues: CsvIssue[] = [];

  await readCsvMapping<CsvIssue>(MAPPING_FILE, (record) =>
    mappedIssues.push(record),
  );

  const browser = await firefox.launch();
  const page = await browser.newPage();
  await page.goto("http://comicsmania.gr/pages/01_mikimaous.htm");

  const pageLinks = await page.$$("css=a");
  let pageNumber = 0;
  for (const pageLink of pageLinks) {
    console.log(`Page ${++pageNumber}`);
    const [subPage] = await Promise.all([
      page.waitForEvent("popup"),
      pageLink.click(),
    ]);

    let currentPublication = null;

    await subPage.waitForLoadState("domcontentloaded");
    const issueCellsLocator = subPage.locator("tr td:nth-child(odd), tr th");
    const issueCells = await issueCellsLocator.all();
    const tagNames = await issueCellsLocator.evaluateAll((e) =>
      e.map((el) => el.tagName),
    );
    const cellTexts = await issueCellsLocator.allInnerTexts();

    let cellIdx = -1;
    for (const issueCell of issueCells) {
      cellIdx++;
      const cellText = cellTexts[cellIdx]
        .replace(/[\n\t ]+/g, " ")
        .replace(/^ /, "");
      if (cellText.replace(/ /g, "") === "") {
        continue;
      }
      switch (tagNames[cellIdx]) {
        case "TH": {
          const publicationSection = mappedIssues.find(
            ({ sectionTitle }) =>
              sectionTitle.replace(/\u00a0/g, " ") ===
              cellText.replace(/\u00a0/g, " "),
          );
          if (publicationSection) {
            currentPublication = publicationSection;
            console.info(
              `Section found for ${currentPublication.publicationcode} : ${cellText}`,
            );
          }
          continue;
        }
        case "TD":
          if (!currentPublication) {
            console.error(
              `No current publication found in page for issue number ${cellText}`,
            );
            continue;
          }
          if (currentPublication.publicationcode === "null") {
            continue;
          }
      }
      if (!cellText) {
        continue;
      }
      const issueTextMatch = cellText.match(REGEX_ISSUENUMBER);
      if (
        !issueTextMatch ||
        (currentPublication!.issueCellRegex &&
          !new RegExp(currentPublication!.issueCellRegex).test(cellText))
      ) {
        continue;
      }
      let issuenumber = issueTextMatch[0].replace("ΤΕΥΧΟΣ:", "");
      const issuenumberParts = issuenumber.split(/[-/]/);
      if (issuenumberParts.length === 2) {
        if (
          parseInt(issuenumberParts[0]) ===
          parseInt(issuenumberParts[1]) - 1
        ) {
          issuenumber = `${issuenumberParts[0]}-${String(issuenumberParts[1]).substring(2)}`;
        }
      }

      try {
        let priceMatch = cellText.match(REGEX_PRICE);
        if (!priceMatch) {
          const priceCell = issueCell
            .locator(
              'xpath=..//..//tr//td[contains(.,"τεύχος")]|following-sibling::td',
            )
            .first();
          const priceText = await priceCell.innerText();
          priceMatch = priceText.match(REGEX_PRICE);
        }

        if (!priceMatch) {
          continue;
        }
        publicationsWithIssues.push(currentPublication!);
        const { publicationcode: currentPublicationCode } = currentPublication!;
        const issuecode = await getIssuecode(
          currentPublicationCode,
          issuenumber,
        );
        if (issuecode) {
          const price = parseFloat(priceMatch[0].replace(",", "."));
          quotations.push({
            issuecode,
            estimationMin: price,
            estimationMax: null,
            scrapeDate: null,
            source: "comicsmania",
          });
          console.log(`Found ${currentPublicationCode} ${issuenumber}`);
        }
      } catch (e) {
        console.error(
          `Error for ${currentPublication!.publicationcode} ${issuenumber}: ${e}`,
        );
      }
    }

    await subPage.close();
  }
  await browser.close();
  const sectionsNotFound = mappedIssues.filter(
    ({ sectionTitle, publicationcode }) =>
      publicationcode !== null &&
      !publicationsWithIssues.some(
        ({ sectionTitle: foundSectionTitle }) =>
          foundSectionTitle === sectionTitle,
      ),
  );
  for (const { sectionTitle } of sectionsNotFound) {
    console.log("Section not found: " + sectionTitle);
  }
  await deleteQuotations("comicsmania");
  await createQuotations(quotations);
}
