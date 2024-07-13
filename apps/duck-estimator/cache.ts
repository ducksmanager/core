import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const args = yargs(hideBin(process.argv)).argv;

export const getCacheDir = () => (args as never)["cache-dir"] || "cache";

export const syncScrapeCache = async <T>(
  scrapeDirName: string,
  fileName: string,
  url: string,
  fetchFn: (url: string) => Promise<T>,
  postGetFromCacheTransformFn: (buffer: Buffer) => T,
  preSetInCacheTransformFn: (output: T) => string | Promise<string>
) => {
  const cacheDirName = `${getCacheDir()}/${scrapeDirName}`;
  const cacheFileName = `${cacheDirName}/${fileName}`;
  let scrapeOutput;
  if (existsSync(cacheFileName)) {
    console.debug(" Data exists in cache");
    scrapeOutput = postGetFromCacheTransformFn(readFileSync(cacheFileName));
  } else {
    if (!existsSync(cacheDirName)) {
      mkdirSync(cacheDirName, { recursive: true });
    }
    try {
      scrapeOutput = await fetchFn(url);
      writeFileSync(
        cacheFileName,
        await preSetInCacheTransformFn(scrapeOutput)
      );
    } catch (e) {
      console.error(`Scraping of ${url} failed: ${e}`);
      throw e
    }
  }
  return scrapeOutput;
};

export const getScrapeCacheTime = (scrapeDirName: string, fileName: string) =>
  statSync(`${getCacheDir()}/${scrapeDirName}/${fileName}`).mtime;
