import { test, expect } from "@playwright/test";
import csvImport from "./csv-import";

test("Upload CSV file to Inducks", async ({ page }) => {
  await expect(
    csvImport(
      page,
      {
        issuecode: "si/MS 2003-12",
        issdate: "2026",
      },
      "csv_import_example.csv",
      "csv_import_example.dbi.txt",
    ),
  ).resolves.toBeTruthy();
});
