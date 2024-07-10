import { exec } from "child_process";
import dotenv from "dotenv";
import { mkdirSync } from "fs";

import { getCacheDir } from "./cache";
import { getAll, truncateQuotations } from "./coa";
import { writeCsvMapping } from "./csv";

const scrapes: Promise<
  {
    name: string;
    scrape: () => Promise<void>;
  }[]
> = Promise.all(
  ["bedetheque", "comicsmania", "seriesam", "gocollect"].map(
    async (scrapeName) => ({
      name: scrapeName,
      scrape: (await import(`./scrapes/${scrapeName}`)).scrape,
    })
  )
);

dotenv.config({ path: ".env.local" });

(async () => {
  await truncateQuotations();
  mkdirSync(getCacheDir(), { recursive: true });

  let hasFailed = false;
  for (const { name, scrape } of await scrapes) {
    try {
      console.log(`Scraping ${name}, start date: ${new Date().toISOString()}`);
      await scrape();
      console.log(`Scrape done, end date: ${new Date().toISOString()}`);
    } catch (e) {
      console.error(`Scrape failed: ${e}`);
      hasFailed = true;
    }
  }

  if (hasFailed) {
    process.exit(1);
  }

  await writeCsvMapping(await getAll());
  exec("sh bump-dump.sh", (error, stdout, stderr) => {
    if (error) {
      console.error(`error: ${error.message}`);
      process.exit(1);
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      process.exit(0);
    }
    console.log(`stdout: ${stdout}`);
    process.exit(0);
  });
})();
