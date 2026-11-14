#!/usr/bin/env node
/**
 * Refreshes AUTO_PRODUCTS (auto-products.js) with live Electronics & Home
 * Appliances listings from Amazon's PA-API and Flipkart's Affiliate API.
 *
 * Safe by design:
 *  - Only ever writes auto-products.js. Never touches the hand-curated
 *    BASE_PRODUCTS list inside index.html.
 *  - If a source's credentials aren't set yet (e.g. Amazon PA-API isn't
 *    unlocked until the Associates account gets 3 qualifying sales), that
 *    source is skipped with a clear log line — the run doesn't fail.
 *  - If every source returns nothing this run, the existing auto-products.js
 *    is left untouched rather than being overwritten with an empty file.
 *
 * Run manually to test:
 *   AMAZON_ACCESS_KEY=... AMAZON_SECRET_KEY=... AMAZON_PARTNER_TAG=... \
 *   FLIPKART_AFFILIATE_ID=... FLIPKART_AFFILIATE_TOKEN=... \
 *   node scripts/update-catalog.js
 */

const fs = require('fs');
const path = require('path');

const OUT_FILE = path.join(__dirname, '..', 'auto-products.js');
const ITEM_COUNT_PER_SEARCH = 10;

async function fetchAmazonElectronicsAndAppliances() {
  const { AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, AMAZON_PARTNER_TAG } = process.env;
  if (!AMAZON_ACCESS_KEY || !AMAZON_SECRET_KEY || !AMAZON_PARTNER_TAG) {
    console.log('[amazon] Skipping — AMAZON_ACCESS_KEY / AMAZON_SECRET_KEY / AMAZON_PARTNER_TAG secrets not set yet.');
    console.log('[amazon] (PA-API only unlocks after 3 qualifying sales on the Associates account — see README note.)');
    return [];
  }

  let amazonPaapi;
  try {
    amazonPaapi = require('amazon-paapi');
  } catch (err) {
    console.log('[amazon] Skipping — amazon-paapi package not installed:', err.message);
    return [];
  }

  const commonParameters = {
    AccessKey: AMAZON_ACCESS_KEY,
    SecretKey: AMAZON_SECRET_KEY,
    PartnerTag: AMAZON_PARTNER_TAG,
    PartnerType: 'Associates',
    Marketplace: 'www.amazon.in',
  };

  // One search per target category. Add more keyword/SearchIndex pairs here
  // to broaden coverage later.
  const searches = [
    { SearchIndex: 'Electronics', Keywords: 'electronics gadgets', cat: 'electronics' },
    { SearchIndex: 'Appliances', Keywords: 'home appliances', cat: 'appliances' },
  ];

  const results = [];
  for (const s of searches) {
    try {
      const requestParameters = {
        Keywords: s.Keywords,
        SearchIndex: s.SearchIndex,
        ItemCount: ITEM_COUNT_PER_SEARCH,
        Resources: ['ItemInfo.Title', 'OffersV2.Listings.Price'],
      };
      const data = await amazonPaapi.SearchItemsV2(commonParameters, requestParameters);
      const items = (data && data.SearchResult && data.SearchResult.Items) || [];
      for (const item of items) {
        const title = item.ItemInfo && item.ItemInfo.Title && item.ItemInfo.Title.DisplayValue;
        const listing = item.OffersV2 && item.OffersV2.Listings && item.OffersV2.Listings[0];
        const price = listing && listing.Price && listing.Price.Amount;
        const savings = listing && listing.Price && listing.Price.Savings && listing.Price.Savings.Amount;
        if (!title || !price || !item.ASIN) continue;
        results.push({
          id: `auto-amz-${item.ASIN}`,
          name: title,
          cat: s.cat,
          price: Math.round(price),
          mrp: Math.round(price + (savings || price * 0.2)),
          source: 'amazon',
        });
      }
      console.log(`[amazon] ${s.SearchIndex}: got ${items.length} items.`);
    } catch (err) {
      console.log(`[amazon] ${s.SearchIndex} search failed:`, (err && err.message) || err);
    }
  }
  return results;
}

async function fetchFlipkartElectronicsAndAppliances() {
  const { FLIPKART_AFFILIATE_ID, FLIPKART_AFFILIATE_TOKEN } = process.env;
  if (!FLIPKART_AFFILIATE_ID || !FLIPKART_AFFILIATE_TOKEN) {
    console.log('[flipkart] Skipping — FLIPKART_AFFILIATE_ID / FLIPKART_AFFILIATE_TOKEN secrets not set yet.');
    console.log('[flipkart] (Needs a direct affiliate.flipkart.com account + API token — a 3rd-party network like EarnKaro/INRDeals does not give this.)');
    return [];
  }

  const queries = [
    { q: 'electronics', cat: 'electronics' },
    { q: 'home appliances', cat: 'appliances' },
  ];
  const headers = {
    'Fk-Affiliate-Id': FLIPKART_AFFILIATE_ID,
    'Fk-Affiliate-Token': FLIPKART_AFFILIATE_TOKEN,
  };

  const results = [];
  for (const { q, cat } of queries) {
    try {
      const url = `https://affiliate-api.flipkart.net/affiliate/1.0/search.json?query=${encodeURIComponent(q)}&resultCount=${ITEM_COUNT_PER_SEARCH}`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const products = (data && data.products) || [];
      for (const entry of products) {
        const p = entry.productBaseInfoV1 || {};
        const mrp = p.maximumRetailPrice && p.maximumRetailPrice.amount;
        const special = p.flipkartSpecialPrice && p.flipkartSpecialPrice.amount;
        const selling = p.flipkartSellingPrice && p.flipkartSellingPrice.amount;
        if (!p.title || mrp == null || !p.productId) continue;
        results.push({
          id: `auto-fk-${p.productId}`,
          name: p.title,
          cat,
          price: Math.round(special || selling || mrp),
          mrp: Math.round(mrp),
          source: 'flipkart',
        });
      }
      console.log(`[flipkart] "${q}": got ${products.length} items.`);
    } catch (err) {
      console.log(`[flipkart] "${q}" search failed:`, (err && err.message) || err);
    }
  }
  return results;
}

(async () => {
  const [amazonItems, flipkartItems] = await Promise.all([
    fetchAmazonElectronicsAndAppliances(),
    fetchFlipkartElectronicsAndAppliances(),
  ]);

  const fresh = [...amazonItems, ...flipkartItems];

  if (fresh.length === 0) {
    console.log('No live data from either source this run — leaving auto-products.js untouched.');
    process.exit(0);
  }

  const sources = [...new Set(fresh.map((i) => i.source))].join(', ');
  const banner = `/* AUTO-GENERATED by .github/workflows/update-catalog.yml via scripts/update-catalog.js — do not hand-edit.
   Last refreshed: ${new Date().toISOString()}
   ${fresh.length} live Electronics & Home Appliances items from: ${sources}
*/\n`;
  const content = `${banner}const AUTO_PRODUCTS = ${JSON.stringify(fresh, null, 2)};\n`;
  fs.writeFileSync(OUT_FILE, content, 'utf8');
  console.log(`Wrote ${fresh.length} items to ${OUT_FILE}`);
})();
