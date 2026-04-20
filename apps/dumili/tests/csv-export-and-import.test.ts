import test, { expect } from "@playwright/test";
import { getCsvEntries, getCsvMetadata } from "../src/composables/useCsvExport";
import csvImport from "./csv-import";
import type { FullIndexation } from "../api/services/indexation";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

import { cwd } from "./csv-import";

test("Export and import CSV file", async ({ page }) => {
  const indexation: FullIndexation = JSON.parse(
    readFileSync(
      path.join(cwd, "tests/fixtures/csv_import_vn_DVBH_56_no_new_story.json"),
      "utf8",
    ),
  );
  const storiesWithDetails = [
    {
      storycode: "Xvn/DVBH  56",
      storyjobs: [
        {
          plotwritartink: "plot",
          personcode: "1",
        },
      ],
    },
  ];
  const csv = getCsvEntries(indexation, storiesWithDetails);
  expect(csv).toBeDefined();

  const csvFile = `temp.csv`;

  writeFileSync(`${cwd}/tests/fixtures/${csvFile}`, csv!);

  await csvImport(
    page,
    getCsvMetadata(indexation),
    csvFile,
    "csv_import_vn_DVBH_56_no_new_story.dbi.txt",
  );
});
