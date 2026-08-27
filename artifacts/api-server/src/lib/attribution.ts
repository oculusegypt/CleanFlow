export const SOURCE_LABELS = {
  direct: "مباشر",
  googleOrganic: "بحث Google",
  googleAds: "إعلانات Google",
  social: "شبكات اجتماعية",
  referral: "إحالات أخرى",
} as const;

export interface AttributionRow {
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  gclid?: string | null;
}

export function sourceForRow(row: AttributionRow): string {
  const referrer = (row.referrer || "").toLowerCase();
  const utmSource = (row.utmSource || "").toLowerCase();
  const utmMedium = (row.utmMedium || "").toLowerCase();
  const gclid = (row.gclid || "").trim();

  if (gclid || /(cpc|ppc|paid|ads|display|banner|cpm)/.test(utmMedium)) {
    return SOURCE_LABELS.googleAds;
  }
  if (
    (utmSource === "google" && (!utmMedium || /^(organic|search|seo)$/.test(utmMedium))) ||
    /(^|https?:\/\/|www\.)google\./.test(referrer)
  ) {
    return SOURCE_LABELS.googleOrganic;
  }
  if (/(facebook|instagram|twitter|t\.co|linkedin|youtube|tiktok|snapchat|pinterest)/.test(`${utmSource} ${referrer}`)) {
    return SOURCE_LABELS.social;
  }
  if (!referrer && !utmSource) return SOURCE_LABELS.direct;
  return SOURCE_LABELS.referral;
}