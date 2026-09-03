#!/usr/bin/env node
/**
 * Compare the prerendered Arabic neighborhood pages without changing them.
 *
 * The report intentionally ignores the English-key aliases emitted by the
 * prerenderer so each neighborhood is counted once.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(new URL(".", import.meta.url).pathname, "..");
const AREAS_DIR = join(ROOT, "artifacts/sabaik-almasa/dist/public/areas");
const REPORT_PATH = join(ROOT, "AREA_SIMILARITY_REPORT.md");

const CLAIM_PATTERNS = [
  /(?:30|35|25)\s*(?:—|-|إلى)?\s*(?:40|45)?\s*دقيقة/g,
  /(?:معاينة|عرض سعر|عروض أسعار)\s+(?:ميدانية\s+)?مجاني(?:ة)?/g,
  /ضمان(?:اً|ا)?\s+(?:كامل|شامل|معتمد)/g,
  /(?:أكثر من\s+50\s+حي|كافة أحياء|جميع أحياء)/g,
];

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function visibleText(html) {
  return decodeEntities(html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(text) {
  return text
    .toLowerCase()
    .replace(/[،؛:,.!?()[\]{}"'«»—–|/\\<>]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !/^\d+$/.test(token));
}

function shingles(words, size = 5) {
  const result = new Set();
  for (let i = 0; i <= words.length - size; i += 1) {
    result.add(words.slice(i, i + size).join(" "));
  }
  return result;
}

function jaccard(a, b) {
  if (!a.size && !b.size) return 1;
  let intersection = 0;
  for (const value of a) if (b.has(value)) intersection += 1;
  return intersection / (a.size + b.size - intersection || 1);
}

if (!existsSync(AREAS_DIR)) {
  console.error(`Neighborhood output not found: ${AREAS_DIR}`);
  process.exit(1);
}

const pages = readdirSync(AREAS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /[\u0600-\u06ff]/u.test(entry.name))
  .map((entry) => {
    const htmlPath = join(AREAS_DIR, entry.name, "index.html");
    const html = readFileSync(htmlPath, "utf8");
    const text = visibleText(html);
    return {
      slug: entry.name,
      words: tokens(text),
      shingles: shingles(tokens(text)),
      characters: text.length,
      claimMatches: CLAIM_PATTERNS.flatMap((pattern) => text.match(pattern) || []),
    };
  })
  .sort((a, b) => a.slug.localeCompare(b.slug, "ar"));

const pairs = [];
for (let i = 0; i < pages.length; i += 1) {
  for (let j = i + 1; j < pages.length; j += 1) {
    pairs.push({
      a: pages[i].slug,
      b: pages[j].slug,
      score: jaccard(pages[i].shingles, pages[j].shingles),
    });
  }
}
pairs.sort((a, b) => b.score - a.score);

const high = pairs.filter((pair) => pair.score >= 0.85);
const medium = pairs.filter((pair) => pair.score >= 0.75 && pair.score < 0.85);
const avg = pairs.length ? pairs.reduce((sum, pair) => sum + pair.score, 0) / pairs.length : 0;
const claimPages = pages.filter((page) => page.claimMatches.length > 0);

const lines = [
  "# تقرير تشابه صفحات الأحياء",
  "",
  `- تاريخ الفحص: ${new Date().toISOString().slice(0, 10)}`,
  `- الصفحات العربية المفحوصة: ${pages.length}`,
  `- متوسط تشابه أزواج الصفحات: ${(avg * 100).toFixed(1)}%`,
  `- أزواج عالية التشابه (≥85%): ${high.length}`,
  `- أزواج تحتاج مراجعة (75–84.9%): ${medium.length}`,
  `- صفحات ما زالت تحتوي على نمط claim قابل للمراجعة: ${claimPages.length}`,
  "",
  "## المنهجية",
  "",
  "تمت مقارنة النص الظاهر في HTML المسبق التوليد بعد إزالة JavaScript وCSS، باستخدام مجموعات n-gram من خمس كلمات. لم تُحتسب مسارات المفاتيح الإنجليزية المكررة، ولم يتم حذف أو دمج أي صفحة تلقائياً.",
  "",
  "## أعلى أزواج التشابه",
  "",
  "| الصفحة الأولى | الصفحة الثانية | التشابه |",
  "|---|---|---:|",
  ...pairs.slice(0, 25).map((pair) => `| ${pair.a} | ${pair.b} | ${(pair.score * 100).toFixed(1)}% |`),
  "",
  "## التوصية",
  "",
  high.length
    ? "الأزواج ذات التشابه المرتفع تحتاج مراجعة تحريرية: أضف معلومات محلية مثبتة ومختلفة فعلاً قبل التفكير في دمج أو إيقاف أي صفحة. لا ينفذ هذا التقرير أي إجراء تلقائي."
    : "لا تظهر أزواج بتشابه مرتفع وفق هذا القياس. تستمر المراجعة التحريرية للصفحات التي لا تقدم معلومات محلية مثبتة.",
  "",
  "## صفحات تحتوي على نمط claim قابل للمراجعة",
  "",
  claimPages.length
    ? claimPages.map((page) => `- ${page.slug}: ${[...new Set(page.claimMatches)].join("، ")}`).join("\n")
    : "- لم يتم العثور على الأنماط المحددة.",
  "",
];

writeFileSync(REPORT_PATH, `${lines.join("\n")}\n`);
console.log(`Wrote ${REPORT_PATH}`);
console.log(`Pages: ${pages.length}; high pairs: ${high.length}; medium pairs: ${medium.length}; average: ${(avg * 100).toFixed(1)}%`);