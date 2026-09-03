/**
 * Runtime counterpart of scripts/seo-page-policy.mjs.
 * Keep the two lists aligned: the build and the hydrated page must agree on
 * whether a standalone SEO page is indexable.
 */

const SEO_PAGE_MIN_CONTENT_CHARS = 900

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
]

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
]

function visibleText(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

export function isSeoPageIndexable(page: {
  title?: string
  targetKeyword?: string
  content?: string
}) {
  const topic = `${page.title || ""} ${page.targetKeyword || ""}`
  if (UNSUPPORTED_TOPIC_PATTERNS.some(pattern => pattern.test(topic))) return false
  if (!CLEANING_TOPIC_PATTERNS.some(pattern => pattern.test(topic))) return false
  return visibleText(page.content || "").length >= SEO_PAGE_MIN_CONTENT_CHARS
}
