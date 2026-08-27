#!/usr/bin/env node
/**
 * Conservative SEO regression gate.
 * It checks the deployable sitemap and prerendered HTML without claiming
 * external indexation or SERP results.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const publicDir = join(ROOT, "artifacts", "sabaik-almasa", "dist", "public");
const sitemapPath = join(publicDir, "sitemap.xml");
const failures = [];
const warnings = [];

if (!existsSync(sitemapPath)) failures.push("dist/public/sitemap.xml is missing; run the production build first");
else {
  const sitemap = readFileSync(sitemapPath, "utf8");
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  if (!locs.length) failures.push("sitemap has no URLs");
  if (new Set(locs).size !== locs.length) failures.push("sitemap contains duplicate URLs");
  if (locs.some(url => /(^|\/)(container|package|packages)(?:\/|$)/i.test(url))) {
    failures.push("sitemap contains a legacy package/container URL");
  }
  if (locs.some(url => /localhost|127\.0\.0\.1/i.test(url))) failures.push("sitemap contains a local URL");
  const imageLocs = [...sitemap.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map(match => match[1]);
  for (const imageUrl of imageLocs) {
    if (/^https?:\/\//i.test(imageUrl)) {
      try {
        const imagePath = new URL(imageUrl).pathname;
        if (imagePath.startsWith("/images/") && !existsSync(join(publicDir, imagePath))) {
          failures.push(`sitemap image is missing from build: ${imagePath}`);
        }
      } catch {
        failures.push(`sitemap contains an invalid image URL: ${imageUrl}`);
      }
    }
  }
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const htmlFiles = walk(publicDir).filter(file => file.endsWith(".html"));
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const relative = file.slice(publicDir.length).replace(/\\/g, "/");
  const isAdmin = relative.startsWith("/admin/");
  const titleCount = (html.match(/<title\b/gi) || []).length;
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const canonicalCount = (html.match(/<link[^>]+rel=["']canonical["']/gi) || []).length;
  const noindex = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html);
  if (!isAdmin && titleCount !== 1) failures.push(`${relative}: expected one title tag`);
  if (!isAdmin && canonicalCount !== 1) failures.push(`${relative}: expected one canonical link`);
  if (!isAdmin && h1Count !== 1) warnings.push(`${relative}: expected one visible H1 in prerender output`);
  if (!isAdmin && !/(اتصل|تواصل|احجز|اطلب|whatsapp|wa\.me|tel:)/i.test(html)) {
    warnings.push(`${relative}: no obvious CTA found in prerender output`);
  }
  if (!isAdmin) {
    for (const imageSrc of [...html.matchAll(/<(?:img|source)[^>]+(?:src|srcset)=["']([^"']+)/gi)].map(match => match[1].split(",")[0].trim().split(" ")[0])) {
      if (/^\/images\//.test(imageSrc) && !existsSync(join(publicDir, imageSrc))) {
        failures.push(`${relative}: referenced image is missing from build: ${imageSrc}`);
      }
    }
  }
  if (!isAdmin && noindex && existsSync(sitemapPath)) {
    const sitemap = readFileSync(sitemapPath, "utf8");
    if (sitemap.includes(relative.replace(/\/index\.html$/, "") || "/")) {
      failures.push(`${relative}: noindex page is present in sitemap`);
    }
  }
}

console.log(`SEO gate inspected ${htmlFiles.length} prerendered HTML files.`);
warnings.forEach(message => console.warn(`WARNING: ${message}`));
if (failures.length) {
  failures.forEach(message => console.error(`FAIL: ${message}`));
  process.exit(1);
}
console.log("SEO gate passed: no duplicate, legacy, local, or noindex sitemap conflicts found.");