import { createQuotations } from "~/coa";
import { readCsvMapping } from "~/csv";

const MAPPING_FILE = "scrapes/bdm/coa-mapping.csv";

type CsvIssue = {
  publicationcode: string;
  issuenumber: string;
  estimation: string;
};

export async function scrape() {
  const mappedIssues: CsvIssue[] = [];

  await readCsvMapping<CsvIssue>(MAPPING_FILE, (record) =>
    mappedIssues.push(record)
  );
  await createQuotations(
    mappedIssues.map(({ publicationcode, issuenumber, estimation }) => ({
      publicationcode,
      issuenumber,
      estimationMin: parseFloat(estimation.replace(",", ".")),
      estimationMax: null,
      scrapeDate: null,
      source: "bdm",
    }))
  );
}
