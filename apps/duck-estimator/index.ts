import { exec } from "child_process";
import dotenv from "dotenv";
import { mkdirSync } from "fs";

import { getCacheDir } from "./cache";
import { getAll } from "./coa";
import { writeCsvMapping } from "./csv";
import { scrape as bdm } from "./scrapes/bdm";
import { scrape as bedetheque } from "./scrapes/bedetheque";
import { scrape as comicsmania } from "./scrapes/comicsmania";
import { scrape as gocollect } from "./scrapes/gocollect";
import { scrape as seriesam } from "./scrapes/seriesam";

export type ConsoleArgs = Parameters<typeof console.error>

const scrapes = [
  { name: "bdm", scrape: bdm },
  { name: "bedetheque", scrape: bedetheque },
  { name: "comicsmania", scrape: comicsmania },
  { name: "seriesam", scrape: seriesam },
  { name: "gocollect", scrape: gocollect },
];

dotenv.config({ path: ".env" });

dotenv.config({
  path: ".env.local",
  override: true,
});

mkdirSync(getCacheDir(), { recursive: true });

const results = await Promise.allSettled(
  scrapes.map(async ({ name, scrape }) => {
    console.log(`Scraping ${name}, start date: ${new Date().toISOString()}`);
    await scrape();
    console.log(`Scrape done, end date: ${new Date().toISOString()}`);
  })
);

const hasFailed = results.some(
  (result) => result.status === "rejected"
);

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

  if (hasFailed) {
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          `Scrape failed for ${scrapes[index].name}: ${result.reason}`
        );
      }
    });
    process.exit(1);
  }
});
