import { createRequire } from "node:module";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const require = createRequire(join(ROOT, "lib", "db", "package.json"));
const Database = require("better-sqlite3");

const db = new Database(join(ROOT, "data", "sabaik.db"), { readonly: true });

// 1. Audit 50 Keyword Pages (seo_pages)
const seoPages = db.prepare(`
  SELECT id, slug, title, target_keyword, content, excerpt,
         seo_title, seo_description, seo_keywords
  FROM seo_pages
  WHERE status = 'published' AND is_active = 1
  ORDER BY id ASC
`).all();

// 2. Audit Core Services (Money Pages)
const services = db.prepare(`SELECT id, title, seo_slug FROM services WHERE is_active = 1`).all();
const serviceSlugs = new Set(services.map(s => s.seo_slug));

const keywordPagesReport = [];

for (const p of seoPages) {
  const cleanTitle = p.title.replace(/\|.*/, "").trim();
  const text = (p.content || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const kw = p.target_keyword || p.seo_keywords?.split(/[،,]/)[0]?.trim() || cleanTitle;
  
  // Determine Intent
  let intent = "Commercial / Local";
  if (kw.includes("دليل") || kw.includes("نصائح") || kw.includes("طريقة") || kw.includes("كيف")) {
    intent = "Informational";
  } else if (kw.includes("اسعار") || kw.includes("سعر") || kw.includes("باقات") || kw.includes("ارخص")) {
    intent = "Commercial Investigation";
  } else if (kw.includes("شركة") || kw.includes("تنظيف") || kw.includes("غسيل") || kw.includes("جلي") || kw.includes("رش")) {
    intent = "Transactional / Local Service";
  }

  // Check overlap / cannibalization with Core Services
  let primaryOverlap = null;
  let decision = "Keep & Enhance";

  if (kw.includes("فلل") || kw.includes("فيلا")) {
    primaryOverlap = "/services/tanzeef-filal-alryad";
    decision = "Remap Canonical to /services/tanzeef-filal-alryad (Consolidate Authority)";
  } else if (kw.includes("شقق") || kw.includes("شقة")) {
    primaryOverlap = "/services/tanzeef-shaqaq-alryad";
    decision = "Remap Canonical to /services/tanzeef-shaqaq-alryad";
  } else if (kw.includes("مكيف") || kw.includes("مكيفات") || kw.includes("سبلت")) {
    primaryOverlap = "/services/tanzeef-mokeyafat-alryad";
    decision = "Remap Canonical to /services/tanzeef-mokeyafat-alryad";
  } else if (kw.includes("مجالس") || kw.includes("كنب") || kw.includes("سجاد") || kw.includes("بخار")) {
    primaryOverlap = "/services/gaseel-majalis-bukhar-alryad";
    decision = "Remap Canonical to /services/gaseel-majalis-bukhar-alryad";
  } else if (kw.includes("رخام") || kw.includes("جلي")) {
    primaryOverlap = "/services/jaly-rakham-alryad";
    decision = "Remap Canonical to /services/jaly-rakham-alryad";
  } else if (kw.includes("خزان") || kw.includes("خزانات")) {
    primaryOverlap = "/services/tanzeef-khazanat-alryad";
    decision = "Remap Canonical to /services/tanzeef-khazanat-alryad";
  } else if (kw.includes("حشرات") || kw.includes("مبيدات")) {
    primaryOverlap = "/services/mokafahat-hasharat-alryad";
    decision = "Remap Canonical to /services/mokafahat-hasharat-alryad";
  } else if (kw.includes("تشطيب") || kw.includes("بناء")) {
    primaryOverlap = "/services/tanzeef-bad-altashteeb-alryad";
    decision = "Remap Canonical to /services/tanzeef-bad-altashteeb-alryad";
  } else if (kw.includes("واجهات")) {
    primaryOverlap = "/services/tanzeef-wajahat-alryad";
    decision = "Remap Canonical to /services/tanzeef-wajahat-alryad";
  }

  keywordPagesReport.push({
    id: p.id,
    url: `/page/${p.slug}`,
    targetKeyword: kw,
    intent,
    wordCount,
    primaryParentCluster: primaryOverlap || "/services",
    decision
  });
}

fs.writeFileSync("keyword_pages_audit.json", JSON.stringify(keywordPagesReport, null, 2));
console.log(`Audited ${keywordPagesReport.length} keyword pages. Saved to keyword_pages_audit.json`);

db.close();
