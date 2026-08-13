import { chromium } from "playwright-core";
import Browserbase from "@browserbasehq/sdk";

const bb = new Browserbase({
  apiKey: process.env.BROWSERBASE_API_KEY,
});

const MAX_PAGES = 5;
const RESULTS_PER_PAGE = 10;
const MAX_EXTRACTION_RETRIES = 3;
const MAX_COMPETITORS = 10;

// Search Google for a keyword and find the ranking position of a target domain
export async function rankTracker(keyword, targetDomain) {
  let browser;
  const cleanTarget = targetDomain.replace(/^www\./, "").toLowerCase();
  const competitors = [];
  const seenUrls = new Set();
  let found = null;
  let overallPosition = 0;

  try {
    // 1. Initialize a Browserbase session and connect Playwright to it
    const session = await bb.sessions.create({ browserSettings: { blockAds: true } }, { timeout: 20000 });
    browser = await chromium.connectOverCDP(session.connectUrl, { timeout: 20000 });
    const page = browser.contexts()[0].pages()[0];
    page.setDefaultNavigationTimeout(45000);
    page.setDefaultTimeout(15000);

    // 2. Initial Google visit and consent handling
    await page.goto("https://www.google.com", { waitUntil: "networkidle" });
    try {
      const consentBtn = await page.$('button[id="L2AGLb"], form[action*="consent"] button');
      if (consentBtn) {
        await consentBtn.click();
        await page.waitForTimeout(1000);
      }
    } catch {
      // consent dialog isn't always shown - safe to ignore
    }

    // 3. Search loop: iterate through up to 5 pages of Google results
    for (let pageNum = 1; pageNum <= MAX_PAGES && !found; pageNum++) {
      const start = (pageNum - 1) * RESULTS_PER_PAGE;

      await page.goto(
        `https://www.google.com/search?q=${encodeURIComponent(keyword)}&num=${RESULTS_PER_PAGE}&start=${start}&hl=en&gl=us`,
        { waitUntil: "networkidle" }
      );

      // 4. Page extraction: retry if results haven't rendered yet
      let pageResults = [];
      for (let retry = 0; retry < MAX_EXTRACTION_RETRIES && pageResults.length === 0; retry++) {
        try {
          await page.waitForSelector("h3", { timeout: 8000 });
          pageResults = await page.evaluate(() => {
            const dedupe = new Set();
            return Array.from(document.querySelectorAll("h3"))
              .map((h3) => {
                // Result titles aren't always wrapped directly by their link -
                // walk up a few ancestors to find the anchor that owns it.
                let anchor = h3.closest("a");
                let node = h3;
                for (let i = 0; i < 5 && !anchor && node.parentElement; i++) {
                  node = node.parentElement;
                  anchor = node.querySelector("a[href^='http']");
                }
                if (!anchor) return null;

                const title = h3.textContent.trim();

            
                let snippet = "";
                let container = h3;
                for (let i = 0; i < 6 && container.parentElement; i++) {
                  container = container.parentElement;
                  const text = (container.innerText || "").trim();
                  if (text.length > title.length + 40) {
                    snippet = text.replace(title, "").trim().slice(0, 300);
                    break;
                  }
                }

                return { url: anchor.href, title, snippet };
              })
              .filter((r) => r && !dedupe.has(r.url) && dedupe.add(r.url));
          });
        } catch {
          // selector never appeared on this attempt - fall through and retry
        }
        if (pageResults.length === 0) await page.waitForTimeout(1000);
      }

      // 5. Match results against the target domain
      for (const result of pageResults) {
        if (seenUrls.has(result.url)) continue;
        seenUrls.add(result.url);

        let hostname;
        try {
          hostname = new URL(result.url).hostname.replace(/^www\./, "").toLowerCase();
        } catch {
          continue;
        }

        overallPosition += 1;
        if (competitors.length < MAX_COMPETITORS) {
          competitors.push({
            position: overallPosition,
            url: result.url,
            domain: hostname,
            title: result.title,
            snippet: result.snippet,
          });
        }

        const isMatch = hostname === cleanTarget || hostname.endsWith(`.${cleanTarget}`);
        if (isMatch && !found) {
          found = { position: overallPosition, page: pageNum, url: result.url, title: result.title, snippet: result.snippet };
          break;
        }
      }
    }

    return {
      success: true,
      data: {
        keyword,
        targetDomain,
        position: found?.position ?? null,
        page: found?.page ?? null,
        title: found?.title ?? null,
        snippet: found?.snippet ?? null,
        competitors,
        totalResultsScanned: overallPosition,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: {
        keyword,
        targetDomain,
        position: null,
        page: null,
        title: null,
        snippet: null,
        competitors,
        totalResultsScanned: overallPosition,
      },
    };
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
