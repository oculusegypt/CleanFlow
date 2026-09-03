#!/usr/bin/env node
/**
 * Generate the deployable static sitemap from the same SQLite database used by
 * the app. Keeping this in the build makes localhost URLs impossible to ship.
 */
import { createRequire } from "node:module";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CANONICAL_SITE_URL } from "./seo-config.mjs";
import { getSeoPageIndexability } from "./seo-page-policy.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(root, "lib", "db", "package.json"));
const dbPath = join(root, "data", "sabaik.db");
const outputPath = join(root, "artifacts", "sabaik-almasa", "public", "sitemap.xml");

if (!existsSync(dbPath)) throw new Error(`Database not found: ${dbPath}`);
const Database = require("better-sqlite3");
const db = new Database(dbPath, { readonly: true });
const settingRows = db.prepare("SELECT key, value FROM site_settings").all();
const settingMap = Object.fromEntries(settingRows.map(row => [row.key, row.value]));
const siteName = String(settingMap.company_name || "").trim() || "خدمات التنظيف بالرياض";
// A sitemap is a production-facing artifact. Do not let a database setting,
// CI variable, proxy host, or preview URL change its canonical origin.
const baseUrl = CANONICAL_SITE_URL;

const xmlEscape = (value) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&apos;");

const absoluteUrl = (value) => {
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : `${baseUrl}${value.startsWith("/") ? "" : "/"}${value}`;
};

const staticPages = [
  ["/", "1.0", "daily"],
  ["/about", "0.9", "monthly"],
  ["/services", "0.95", "weekly"],
  ["/cleaning-packages", "0.95", "weekly"],
  ["/contact", "0.85", "monthly"],
  ["/partners", "0.75", "monthly"],
  ["/areas", "0.9", "weekly"],
  ["/faq", "0.85", "monthly"],
  ["/terms", "0.6", "monthly"],
  ["/privacy", "0.6", "monthly"],
  ["/chat", "0.7", "monthly"],
  ["/why-us/leadership", "0.8", "monthly"],
  ["/why-us/what-we", "0.8", "monthly"],
  ["/why-us/commitment", "0.8", "monthly"],
  ["/why-us/accumulated-experience", "0.8", "monthly"],
  ["/blog", "0.9", "daily"],
];

const LEGACY_PACKAGE_ROUTE_SLUGS = {
  1: "tanzeef-shaqaq",
  2: "tanzeef-filal",
  3: "tanzeef-qosoor",
  4: "tanzeef-qabl-alnaql",
  5: "gaseel-majalis-bukhar",
  6: "jaly-rakham",
  7: "tanzeef-khazanat",
  8: "gaseel-mokeyafat",
  9: "mokafahat-hasharat",
  10: "tanzeef-bad-albenaa",
  11: "tanzeef-wajahat",
  12: "tanzeef-masajid",
  13: "shahadat-salama",
  14: "tarkeeb-anthimat-wiqaya",
  15: "taqreer-fanni-fawri",
  16: "taqreer-fanni-ghayr-fawri",
  17: "aqd-siyana-difaa-madani",
};

const getPackageRouteSlug = (container) =>
  LEGACY_PACKAGE_ROUTE_SLUGS[container.id] || container.slug || "";

const staticImages = {
  "/": ["/brand-icon.png", "/images/logo.png"],
  "/about": ["/images/service-majlis.jpg"],
  "/cleaning-packages": ["/images/service-apartments.jpg"],
};

const services = db.prepare(`
  SELECT title, seo_slug AS slug, images
  FROM services
  WHERE is_active = 1 AND seo_enabled = 1 AND seo_slug IS NOT NULL AND seo_slug != ''
  ORDER BY "order" ASC
`).all();

const containers = db.prepare(`
  SELECT id, name AS title, seo_slug AS slug, images
  FROM containers
  WHERE is_active = 1 AND seo_enabled = 1 AND seo_slug IS NOT NULL AND seo_slug != ''
  ORDER BY "order" ASC
`).all();

const posts = db.prepare(`
  SELECT title, slug, cover_image AS coverImage, published_at AS publishedAt, updated_at AS updatedAt
  FROM posts
  WHERE status = 'published' AND is_active = 1 AND slug IS NOT NULL AND slug != ''
  ORDER BY published_at DESC
`).all();

const seoPages = db.prepare(`
  SELECT title, slug, target_keyword AS targetKeyword, content,
         cover_image AS coverImage, og_image AS ogImage,
         published_at AS publishedAt, updated_at AS updatedAt
  FROM seo_pages
  WHERE status = 'published' AND is_active = 1
    AND slug IS NOT NULL AND slug != ''
    AND trim(target_keyword) != ''
  ORDER BY published_at DESC, id DESC
`).all().filter(page => getSeoPageIndexability(page).indexable);

const today = new Date().toISOString().slice(0, 10);
const entries = [];
const seenUrls = new Set();

const addEntry = ({ path, priority, changefreq, title, lastmod = today, images = [] }) => {
  const loc = absoluteUrl(path);
  if (!loc || loc.includes("localhost") || seenUrls.has(loc)) return;
  seenUrls.add(loc);
  entries.push([
    "  <url>",
    `    <loc>${xmlEscape(loc)}</loc>`,
    `    <lastmod>${xmlEscape(String(lastmod).slice(0, 10))}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    `    <xhtml:link rel="alternate" hreflang="ar" href="${xmlEscape(loc)}"/>`,
    ...images.filter(Boolean).slice(0, 3).map((image, index) => [
      "    <image:image>",
      `      <image:loc>${xmlEscape(absoluteUrl(image))}</image:loc>`,
      `      <image:title>${xmlEscape(`${title || siteName} — صورة ${index + 1}`)}</image:title>`,
      "    </image:image>",
    ].join("\n")),
    "  </url>",
  ].join("\n"));
};

for (const [path, priority, changefreq] of staticPages) {
  addEntry({ path, priority, changefreq, title: siteName, images: staticImages[path] || [] });
}

const parseImages = (raw) => {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === "string") : [];
  } catch {
    return [];
  }
};

for (const service of services) {
  addEntry({
    path: `/services/${encodeURIComponent(service.slug)}`,
    priority: "0.95",
    changefreq: "weekly",
    title: service.title,
    images: parseImages(service.images),
  });
}

for (const container of containers) {
  addEntry({
    path: `/cleaning-packages/${encodeURIComponent(getPackageRouteSlug(container))}`,
    priority: "0.90",
    changefreq: "weekly",
    title: container.title,
    images: parseImages(container.images),
  });
}

for (const post of posts) {
  addEntry({
    path: `/blog/${encodeURIComponent(post.slug)}`,
    priority: "0.85",
    changefreq: "weekly",
    title: post.title,
    lastmod: post.updatedAt || post.publishedAt || today,
    images: post.coverImage ? [post.coverImage] : [],
  });
}

for (const page of seoPages) {
  addEntry({
    path: `/page/${encodeURIComponent(page.slug)}`,
    priority: "0.88",
    changefreq: "weekly",
    title: page.title,
    lastmod: page.updatedAt || page.publishedAt || today,
    images: [page.ogImage || page.coverImage].filter(Boolean),
  });
}

// صفحات المناطق التي لها صفحات ثابتة مؤلفة في prerender. لا ننشئ صفحات جديدة
// من أسماء الأحياء وحدها، ولا نضيف نسخًا عربية مكررة إلى الخريطة.
const ALL_NEIGHBORHOODS = [
  // مناطق رئيسية
  { slug: "north-riyadh", arabic: "شمال-الرياض", name: "شمال الرياض" },
  { slug: "south-riyadh", arabic: "جنوب-الرياض", name: "جنوب الرياض" },
  { slug: "east-riyadh",  arabic: "شرق-الرياض", name: "شرق الرياض" },
  { slug: "west-riyadh",  arabic: "غرب-الرياض", name: "غرب الرياض" },
  { slug: "central-riyadh", arabic: "وسط-الرياض", name: "وسط الرياض" },
  // شمال الرياض
  { slug: "al-malqa",     arabic: "حي-الملقا", name: "حي الملقا" },
  { slug: "al-yasmin",    arabic: "حي-الياسمين", name: "حي الياسمين" },
  { slug: "al-narjis",    arabic: "حي-النرجس", name: "حي النرجس" },
  { slug: "al-aarid",     arabic: "حي-العارض", name: "حي العارض" },
  { slug: "hittin",       arabic: "حي-حطين", name: "حي حطين" },
  { slug: "al-sahafa",    arabic: "حي-الصحافة", name: "حي الصحافة" },
  { slug: "al-nafal",     arabic: "حي-النفل", name: "حي النفل" },
  { slug: "al-aqiq",      arabic: "حي-العقيق", name: "حي العقيق" },
  { slug: "al-rabi",      arabic: "حي-الربيع", name: "حي الربيع" },
  { slug: "al-ghadeer",   arabic: "حي-الغدير", name: "حي الغدير" },
  { slug: "al-wadi",      arabic: "حي-الوادي", name: "حي الوادي" },
  { slug: "al-nada",      arabic: "حي-الندى", name: "حي الندى" },
  { slug: "al-falah",     arabic: "حي-الفلاح", name: "حي الفلاح" },
  // شرق الرياض
  { slug: "al-qurtubah",  arabic: "حي-قرطبة", name: "حي قرطبة" },
  { slug: "al-munsiyah",  arabic: "حي-المونسية", name: "حي المونسية" },
  { slug: "al-yarmouk",   arabic: "حي-اليرموك", name: "حي اليرموك" },
  { slug: "al-qadesiya",  arabic: "حي-القادسية", name: "حي القادسية" },
  { slug: "al-rawdah",    arabic: "حي-الروضة", name: "حي الروضة" },
  { slug: "al-naseem",    arabic: "حي-النسيم", name: "حي النسيم" },
  { slug: "al-khaleej",   arabic: "حي-الخليج", name: "حي الخليج" },
  { slug: "al-nahdah",    arabic: "حي-النهضة", name: "حي النهضة" },
  { slug: "al-manar",     arabic: "حي-المنار", name: "حي المنار" },
  { slug: "al-hamra",     arabic: "حي-الحمراء", name: "حي الحمراء" },
  { slug: "al-shuhada",   arabic: "حي-الشهداء", name: "حي الشهداء" },
  // غرب الرياض
  { slug: "dhahrat-laban", arabic: "حي-ظهرة-لبن", name: "حي ظهرة لبن" },
  { slug: "al-suwaidi",   arabic: "حي-السويدي", name: "حي السويدي" },
  { slug: "al-uraija",    arabic: "حي-العريجاء", name: "حي العريجاء" },
  { slug: "al-hazm",      arabic: "حي-الحزم", name: "حي الحزم" },
  { slug: "al-badiyah",   arabic: "حي-البديعة", name: "حي البديعة" },
  { slug: "shubra",       arabic: "حي-شبرا", name: "حي شبرا" },
  { slug: "al-awali",     arabic: "حي-العوالي", name: "حي العوالي" },
  // جنوب الرياض
  { slug: "badr",         arabic: "حي-بدر", name: "حي بدر" },
  { slug: "al-shifa",     arabic: "حي-الشفا", name: "حي الشفاء" },
  { slug: "al-aziziyah",  arabic: "حي-العزيزية", name: "حي العزيزية" },
  { slug: "al-dar-al-baida", arabic: "حي-الدار-البيضاء", name: "حي الدار البيضاء" },
  { slug: "al-hair",      arabic: "حي-الحائر", name: "حي الحائر" },
  { slug: "al-manakh",    arabic: "حي-المناخ", name: "حي المناخ" },
  { slug: "al-iskan",     arabic: "حي-الإسكان", name: "حي الإسكان" },
  // وسط الرياض
  { slug: "al-olaya",     arabic: "حي-العليا", name: "حي العليا" },
  { slug: "al-sulaimaniya", arabic: "حي-السليمانية", name: "حي السليمانية" },
  { slug: "al-malaz",     arabic: "حي-الملز", name: "حي الملز" },
  { slug: "al-murabba",   arabic: "حي-المربع", name: "حي المربع" },
  { slug: "al-batha",     arabic: "حي-البطحاء", name: "حي البطحاء" },
  { slug: "al-wizarat",   arabic: "حي-الوزارات", name: "حي الوزارات" },
  { slug: "al-futah",     arabic: "حي-الفوطة", name: "حي الفوطة" },
];

for (const area of ALL_NEIGHBORHOODS) {
  const title = `شركة تنظيف ${area.name} بالرياض`;
  addEntry({
    path: `/areas/${area.slug}`,
    priority: "0.85",
    changefreq: "weekly",
    title,
    images: ["/brand-icon.png"],
  });
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
  '        xmlns:xhtml="http://www.w3.org/1999/xhtml"',
  '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
  "",
  entries.join("\n\n"),
  "",
  "</urlset>",
  "",
].join("\n");

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, xml, "utf8");
db.close();
console.log(`Generated ${entries.length} sitemap URLs at ${outputPath}`);