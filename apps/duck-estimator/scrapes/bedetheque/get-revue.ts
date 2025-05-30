import type { Album } from "bedetheque-scraper";
import { firefox } from "playwright-firefox";

import { syncScrapeCache } from "~/cache";

type SimpleAlbum = Pick<Album, "albumNum" | "albumTitle" | "estimationEuros">;

export const getRevue = async (
  baseUrl: string,
  urlPath: string,
  cacheSubfolder: string,
): Promise<{
  albums: SimpleAlbum[];
}> => {
  const browser = await firefox.launch();
  const page = await browser.newPage();
  const allAlbums: SimpleAlbum[] = [];

  try {
    while (true) {
      await syncScrapeCache(
        cacheSubfolder,
        urlPath,
        `${baseUrl}/${urlPath}`,
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
        (contents) => contents,
      );
      await page.waitForSelector(".liste-revues");

      const sections = await page.$$("css=.liste-revues > li");

      const pageAlbums = await Promise.all(
        sections
          .map(
            async (section) =>
              await section.evaluate((el) => {
                debugger;
                const titleSection = el.querySelector(".revue-main .titre");
                if (!titleSection) {
                  return null;
                }

                const albumTitle = Array.from(titleSection.childNodes)
                  .filter(
                    (node) =>
                      node.nodeType === Node.TEXT_NODE &&
                      node.textContent?.trim(),
                  )
                  .map((node) => node.textContent?.trim())
                  .join(" ");

                const albumNum = titleSection
                  .querySelector(".orange")!
                  .textContent!.replace(/[#\. ]/g, "");

                const estimationLabel = Array.from(
                  el.querySelectorAll("label"),
                ).find((label) => label.textContent!.includes("Estimation :"));
                const estimationEuros = [
                  parseInt(
                    estimationLabel!.parentElement!.textContent!.replace(
                      "Estimation :",
                      "",
                    ),
                  ),
                ];

                console.log(albumTitle, albumNum, estimationEuros);

                return { albumTitle, albumNum, estimationEuros };
              }),
          )
          .filter(
            (
              promise,
            ): promise is Promise<NonNullable<Awaited<typeof promise>>> =>
              promise !== null,
          ),
      );

      const validAlbums = (await Promise.all(pageAlbums)).filter(
        (album): album is NonNullable<typeof album> => album !== null,
      );
      allAlbums.push(...validAlbums);

      const nextPageLink = await page.$(".pagination .current + a");
      if (!nextPageLink) {
        break;
      }

      const nextUrlPath = await nextPageLink.getAttribute("href");
      if (!nextUrlPath) {
        break;
      }
      urlPath = nextUrlPath.replace(baseUrl, "");
    }

    return { albums: allAlbums };
  } finally {
    await page.close();
    await browser.close();
  }
};
