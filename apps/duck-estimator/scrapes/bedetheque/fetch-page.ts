import type { Page } from "playwright-firefox";

import { NAVIGATION_TIMEOUT } from ".";

const CHALLENGE_TITLE = "Just a moment...";

// The first response is often Cloudflare's interstitial rather than the page,
// so the rendered DOM is the only trustworthy source: returning response.body()
// here would cache the challenge instead of the albums.
export const fetchPage = async (
  page: Page,
  url: string,
  contentSelector: string,
) => {
  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: NAVIGATION_TIMEOUT,
  });

  try {
    await page.waitForSelector(contentSelector, {
      timeout: NAVIGATION_TIMEOUT,
    });
  } catch (e) {
    if ((await page.title()) === CHALLENGE_TITLE) {
      throw new Error(`Blocked by the Cloudflare challenge: ${url}`, {
        cause: e,
      });
    }
    throw e;
  }

  return page.content();
};
