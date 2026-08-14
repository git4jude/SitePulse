import { chromium } from "playwright-core";
import Browserbase from "@browserbasehq/sdk";

const bb = new Browserbase({
  apiKey: process.env.BROWSERBASE_API_KEY,
});

export async function scrapeUrl(url){
  let browser;
  try {
    const session = await bb.sessions.create({browserSettings: {blockAds: true}});
    browser = await chromium.connectOverCDP(session.connectUrl);
    const defaultContext = browser.contexts()[0];
    const page = defaultContext.pages()[0];
    page.setDefaultNavigationTimeout(30000);

    const startTime = Date.now();
    let response;
    try {
      response = await page.goto(url, {waitUntil: "domcontentloaded"})
    } catch (navError) {
      await browser.close().catch(() => {})
      browser = null;
      return { success:false, error:navError.message}
    }

    const loadTime = Date.now() - startTime;
    await page.waitForTimeout(2000)

    //Extract all SEO-relevant data from teh rendered page
    const seoData = await page.evaluate(() => {
      const getMeta = (name) =>
        document.querySelector(`meta[name="${name}"]`)?.content ||
        document.querySelector(`meta[property="${name}"]`)?.content ||
        "";


      const charsetMeta = document.querySelector("meta[charset]")?.getAttribute("charset") || "";

      const metaData = {
        title: document.title || "",
        description: getMeta("description"),
        canonical: document.querySelector('link[rel="canonical"]')?.href || "",
        robots: getMeta("robots"),
        ogTitle: getMeta("og:title"),
        ogDescription: getMeta("og:description"),
        ogImage: getMeta("og:image"),
        twitterCard: getMeta("twitter:card"),
        viewport: getMeta("viewport"),
        charsetMeta,
        charset: charsetMeta || document.characterSet || ""
      };

      const headings = {};
      for (let i = 1; i <= 6; i++) {
        headings[`h${i}`] = document.querySelectorAll(`h${i}`).length;
      }
      headings.h1Texts = Array.from(document.querySelectorAll("h1")).map((el) =>
        el.textContent.trim()
      );

      let internal = 0;
      let external = 0;
      const seenLinks = new Set();
      document.querySelectorAll("a[href]").forEach((a) => {
        const raw = a.getAttribute("href").trim();
        if (!raw || raw.startsWith("#")) return;
        if (/^(mailto|tel|sms|javascript):/i.test(raw)) return;

        let resolved;
        try {
          resolved = new URL(raw, window.location.href);
        } catch (e) {
          return;
        }
        if (resolved.protocol !== "http:" && resolved.protocol !== "https:") return;

        const normalized = resolved.origin + resolved.pathname + resolved.search;
        if (seenLinks.has(normalized)) return;
        seenLinks.add(normalized);

        if (resolved.hostname === window.location.hostname) internal++;
        else external++;
      });
      const totalLinks = internal + external;

      const imgs = Array.from(document.querySelectorAll("img"));
      const missingAlt = imgs.filter(
        (img) => !img.getAttribute("alt") || img.getAttribute("alt").trim() === ""
      ).length;

      const bodyText = document.body ? document.body.innerText : "";
      const wordCount = bodyText.trim().split(/\s+/).filter(Boolean).length;

      return {
        metaData,
        headings,
        links: { internal, external, broken: 0, total: totalLinks },
        images: { total: imgs.length, missingAlt, withAlt: imgs.length - missingAlt },
        wordCount,
        bodyText: bodyText.slice(0, 3000)
      };
    });

    const html = await page.content();
    const pageSize = Buffer.byteLength(html, "utf8");

    await browser.close().catch(() => {});
    browser = null;

    return {
      success: true,
      loadTime,
      pageSize,
      statusCode: response.status(),
      ...seoData
    };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}