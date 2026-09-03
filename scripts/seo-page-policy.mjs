/**
 * Shared build-time policy for standalone SEO landing pages.
 *
 * These pages are retained in the CMS, but only pages with a real cleaning
 * intent and enough visible substance should be offered to search engines.
 * The policy is deliberately conservative so an old campaign page cannot
 * dilute the main service architecture.
 */

const UNSUPPORTED_TOPIC_PATTERNS = [
  /نقل\s*(?:عفش|اثاث|مكيفات)/i,
  /تصليح\s*مكيفات/i,
  /صيانة\s*مكيفات/i,
  /فك\s*وتركيب\s*مكيفات/i,
  /فني\s*مكيفات/i,
 /مكيفات\s*مستعمل/i,
  /غسيل\s*سيارات/i,
  /تسليك\s*مجاري/i,
  /عزل\s*(?:اسطح|خزانات)/i,
  /كشف\s*تسربات/i,
  /تطبيق\s*تنظيف/i,
  /مكيفات[\s\S]{0,30}مستعمل/i,
  /مستعمل[\s\S]{0,30}مكيفات/i,
];

const CLEANING_TOPIC_PATTERNS = [
  /تنظيف/i,
  /نظافة/i,
  /غسيل/i,
  /جلي/i,
  /تلميع/i,
  /تعقيم/i,
  /مكافحة/i,
  /رش\s*مبيدات/i,
  /[إا]بادة/i,
];

export const SEO_PAGE_MIN_CONTENT_CHARS = 900;

function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getSeoPageIndexability(page) {
  const title = String(page?.title || "");
  const targetKeyword = String(page?.targetKeyword ?? page?.target_keyword ?? "");
  const content = stripHtml(page?.content);
  const topic = `${title} ${targetKeyword}`;
  const unsupportedMatch = UNSUPPORTED_TOPIC_PATTERNS.find(pattern => pattern.test(topic));

  if (unsupportedMatch) {
    return { indexable: false, reason: "unsupported-topic", contentChars: content.length };
  }
  if (!CLEANING_TOPIC_PATTERNS.some(pattern => pattern.test(topic))) {
    return { indexable: false, reason: "non-cleaning-topic", contentChars: content.length };
  }
  if (content.length < SEO_PAGE_MIN_CONTENT_CHARS) {
    return { indexable: false, reason: "thin-content", contentChars: content.length };
  }
  return { indexable: true, reason: "approved", contentChars: content.length };
}
