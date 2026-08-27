#!/usr/bin/env node
/**
 * Validate a deployable sitemap before it can be packaged.
 *
 * This intentionally uses no network calls by default: builds must remain
 * deterministic. Pass --check-http when an operator wants to check live
 * response status and redirects as a separate, opt-in step.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CANONICAL_SITE_URL } from "./seo-config.mjs";

const CANONICAL = new URL(CANONICAL_SITE_URL);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BLOCKED_HOST_PATTERNS = [
  /(^|\.)localhost$/i,
  /^127\./i,
  /^\[?::1\]?$/i,
  /(^|\.)replit\.dev$/i,
  /(^|\.)repl\.co$/i,
  /(^|\.)replit\.app$/i,
  /(^|\.)preview/i,
];

const decodeXml = (value) => String(value)
  .replace(/&amp;/g, "&")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'");

function resultFor(sourcePath) {
  return {
    sourcePath,
    errors: [],
    warnings: [],
    info: {
      urlCount: 0,
      imageCount: 0,
      hosts: new Set(),
      paths: new Set(),
    },
  };
}

function validateUrl(value, label, result, seen, { isImage = false } = {}) {
  const raw = decodeXml(value).trim();
  if (!raw) {
    result.errors.push(`${label} is empty`);
    return;
  }

  let url;
  try {
    url = new URL(raw);
  } catch {
    result.errors.push(`${label} is not an absolute URL: ${raw}`);
    return;
  }

  const host = url.hostname.toLowerCase();
  result.info.hosts.add(host);
  result.info.paths.add(url.pathname || "/");

  if (url.protocol !== "https:") {
    result.errors.push(`${label} must use HTTPS: ${raw}`);
  }
  if (host !== CANONICAL.hostname) {
    result.errors.push(`${label} must use host ${CANONICAL.hostname}: ${raw}`);
  }
  if (url.port || url.username || url.password) {
    result.errors.push(`${label} contains a non-canonical origin: ${raw}`);
  }
  if (BLOCKED_HOST_PATTERNS.some((pattern) => pattern.test(host)) || /http:\/?\/?/i.test(raw)) {
    result.errors.push(`${label} contains a local, preview, or malformed URL: ${raw}`);
  }
  if (!isImage && /^\/(?:admin|api)(?:\/|$)/i.test(url.pathname)) {
    result.errors.push(`${label} points to a non-public admin/API path: ${raw}`);
  }

  const normalized = url.toString().replace(/\/$/, url.pathname === "/" ? "/" : "");
  // The primary <loc> must be unique. Image URLs are allowed to repeat because
  // the same brand/service image can legitimately describe many pages.
  if (!isImage && seen.has(normalized)) {
    result.errors.push(`duplicate ${label}: ${raw}`);
  }
  seen.add(normalized);
}

export function validateSitemapXml(xml, sourcePath = "sitemap.xml") {
  const result = resultFor(sourcePath);
  const content = String(xml || "").replace(/^\uFEFF/, "");

  if (!content.trim()) {
    result.errors.push("sitemap is empty");
    return result;
  }
  if (!/^<\?xml\s+version=["']1\.0["'][^?]*\?>/i.test(content.trimStart())) {
    result.errors.push("sitemap is missing the XML declaration");
  }
  if (!/<urlset\b[^>]*>/i.test(content) || !/<\/urlset>\s*$/i.test(content)) {
    result.errors.push("sitemap does not have a complete urlset root");
  }
  if (/<!(?:DOCTYPE|ENTITY)\b/i.test(content)) {
    result.errors.push("sitemap contains a prohibited DOCTYPE or ENTITY declaration");
  }

  const locValues = [...content.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) => match[1]);
  const urlBlocks = [...content.matchAll(/<url\b[^>]*>([\s\S]*?)<\/url>/gi)].map((match) => match[1]);
  const imageValues = [...content.matchAll(/<image:loc>([\s\S]*?)<\/image:loc>/gi)].map((match) => match[1]);
  result.info.urlCount = locValues.length;
  result.info.imageCount = imageValues.length;

  if (!locValues.length) result.errors.push("sitemap has no <loc> URLs");
  if (urlBlocks.length !== locValues.length) {
    result.errors.push(`sitemap has ${urlBlocks.length} <url> blocks but ${locValues.length} <loc> values`);
  }
  if ((content.match(/<loc>/gi) || []).length !== (content.match(/<\/loc>/gi) || []).length) {
    result.errors.push("sitemap contains an unclosed <loc> element");
  }
  if ((content.match(/<url\b/gi) || []).length !== (content.match(/<\/url>/gi) || []).length) {
    result.errors.push("sitemap contains an unclosed <url> element");
  }

  const seenUrls = new Set();
  for (const [index, value] of locValues.entries()) {
    validateUrl(value, `<loc> #${index + 1}`, result, seenUrls);
  }
  const seenImages = new Set();
  for (const [index, value] of imageValues.entries()) {
    validateUrl(value, `<image:loc> #${index + 1}`, result, seenImages, { isImage: true });
  }

  for (const block of urlBlocks) {
    const lastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/i)?.[1]?.trim();
    if (lastmod && !/^\d{4}-\d{2}-\d{2}(?:T[\d:.+-]+Z?)?$/.test(lastmod)) {
      result.warnings.push(`non-standard lastmod value: ${lastmod}`);
    }
  }

  return result;
}

export function validateSitemapFile(filePath) {
  const absolutePath = resolve(ROOT, filePath);
  const result = resultFor(absolutePath);
  if (!existsSync(absolutePath)) {
    result.errors.push(`sitemap file does not exist: ${filePath}`);
    return result;
  }
  return validateSitemapXml(readFileSync(absolutePath, "utf8"), absolutePath);
}

async function checkHttpStatus(urls, result) {
  const queue = [...urls];
  const worker = async () => {
    while (queue.length) {
      const url = queue.shift();
      try {
        const response = await fetch(url, {
          method: "HEAD",
          redirect: "manual",
          signal: AbortSignal.timeout(10000),
        });
        if (response.status >= 300 && response.status < 400) {
          result.warnings.push(`URL redirects (${response.status}): ${url}`);
        } else if (response.status >= 400) {
          result.errors.push(`URL returns HTTP ${response.status}: ${url}`);
        }
      } catch (error) {
        result.warnings.push(`could not check URL ${url}: ${error?.message || "network error"}`);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(6, urls.length) }, worker));
}

async function main() {
  const args = process.argv.slice(2);
  const checkHttp = args.includes("--check-http");
  const filePath = args.find((arg) => !arg.startsWith("--")) || "artifacts/sabaik-almasa/dist/public/sitemap.xml";
  const result = validateSitemapFile(filePath);

  if (checkHttp && result.errors.length === 0) {
    const xml = readFileSync(resolve(ROOT, filePath), "utf8");
    const urls = [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) => decodeXml(match[1]).trim());
    await checkHttpStatus(urls, result);
  }

  console.log(`INFO: inspected ${result.info.urlCount} URLs and ${result.info.imageCount} image URLs from ${filePath}`);
  if (result.info.hosts.size) console.log(`INFO: hosts: ${[...result.info.hosts].join(", ")}`);
  result.warnings.forEach((message) => console.warn(`WARNING: ${message}`));
  result.errors.forEach((message) => console.error(`ERROR: ${message}`));
  if (result.errors.length) process.exitCode = 1;
  else console.log("Sitemap validation passed.");
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  await main();
}