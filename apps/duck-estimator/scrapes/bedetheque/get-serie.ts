import type { Page } from "playwright-firefox";

import { syncScrapeCache } from "~/cache";

import { fetchPage } from "./fetch-page";

export const getSerie = async (
  page: Page,
  baseUrl: string,
  urlPath: string,
  cacheSubfolder: string,
) => {
  const allAlbumsPath = urlPath.replace(".html", "__10000.html");

  await syncScrapeCache(
    cacheSubfolder,
    allAlbumsPath,
    `${baseUrl}${allAlbumsPath}`,
    async (url) => fetchPage(page, url, ".liste-albums"),
    (contentsBuffer) => {
      const contents = contentsBuffer.toString();
      page.setContent(contents);
      return contents;
    },
    (contents) => contents,
  );

  const albums = await page.evaluate(() => {
    const tomes = document
      .querySelector(".serie-info")
      ?.textContent?.match(/Tomes? :([0-9]+)/);
    const numberOfAlbums = tomes ? parseInt(tomes[1], 10) : 0;

    return [...document.querySelectorAll(".liste-albums > li")].map((el) => {
      const albumNum =
        numberOfAlbums === 1
          ? "One-shot"
          : (el.querySelector(".album-main .titre > span")?.textContent ?? "")
              .split(".", 1)[0]
              .trim();

      const estimationRow = [...el.querySelectorAll(".infos > li")].find(
        (row) =>
          (row.querySelector("label")?.textContent ?? "")
            .replace(" :", "")
            .trim()
            .toLowerCase() === "estimation",
      );
      const estimation = estimationRow?.textContent?.split(":")[1]?.trim();

      const range = estimation?.match(/(\d+) à (\d+)/);
      const upperBound = estimation?.match(/Moins de (\d+)/);

      return {
        albumNum,
        albumTitle:
          el.querySelector(".album-main .titre")?.getAttribute("title") ?? "",
        estimationEuros: range
          ? [parseInt(range[1]), parseInt(range[2])]
          : upperBound
            ? [parseInt(upperBound[1])]
            : [],
      };
    });
  });

  return { albums };
};
