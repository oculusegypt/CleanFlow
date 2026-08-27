export interface ThemePreset {
  id: string
  name: string
  desc: string
  primaryHex: string
  secondaryHex: string
  accentHex: string
  primaryHsl: string
  secondaryHsl: string
  accentHsl: string
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "industrial_amber",
    name: "الرمادي الصناعي والذهبي (الافتراضي)",
    desc: "ألوان المقاولات والباقات التنظيف الإنشائية المعتمدة (كحلي صناعي + ذهبي تحذيري عالي الوضوح)",
    primaryHex: "#0F172A",
    secondaryHex: "#F59E0B",
    accentHex: "#10B981",
    primaryHsl: "222 47% 11%",
    secondaryHsl: "38 92% 50%",
    accentHsl: "158 64% 42%",
  },
  {
    id: "safety_orange",
    name: "البرتقالي الإنشائي ومعدات السلامة",
    desc: "مستوحى من شاحنات ومعدات CAT والأنقاض الثقيلة (فحمي غامق + برتقالي سلامة فاقع)",
    primaryHex: "#18181B",
    secondaryHex: "#F97316",
    accentHex: "#0284C7",
    primaryHsl: "240 6% 10%",
    secondaryHsl: "25 95% 53%",
    accentHsl: "199 89% 48%",
  },
  {
    id: "eco_green",
    name: "الأخضر البيئي والبلدي المعتمد",
    desc: "مخصص لإدارة النفايات وإعادة التدوير ورخص بلدي (كحلي رمادي + أخضر بلدي حيوي)",
    primaryHex: "#1E293B",
    secondaryHex: "#10B981",
    accentHex: "#F59E0B",
    primaryHsl: "217 33% 17%",
    secondaryHsl: "158 64% 42%",
    accentHsl: "38 92% 50%",
  },
  {
    id: "royal_navy_gold",
    name: "الكحلي الملكي والذهبي الفاخر",
    desc: "طابع رسمي راقٍ للشركات والمجمعات الكبرى (كحلي عميق + ذهبي معدني مشرق)",
    primaryHex: "#0A192F",
    secondaryHex: "#EAB308",
    accentHex: "#06B6D4",
    primaryHsl: "217 65% 11%",
    secondaryHsl: "48 96% 48%",
    accentHsl: "189 94% 43%",
  },
  {
    id: "iron_red",
    name: "الحديد الصلب والأحمر التحذيري",
    desc: "طابع هيدروليكي قوي للهدم الشامل والكسارات (أسود حديدي + أحمر تحذيري قوي)",
    primaryHex: "#111827",
    secondaryHex: "#EF4444",
    accentHex: "#F59E0B",
    primaryHsl: "220 39% 11%",
    secondaryHsl: "0 84% 60%",
    accentHsl: "38 92% 50%",
  },
  {
    id: "cleanflow_teal",
    name: "الأزرق المحيطي والتيل",
    desc: "طابع هادئ يجمع بين خدمات النظافة العامة والباقات التنظيف السكنية (أزرق داكن + تيل)",
    primaryHex: "#0E3B68",
    secondaryHex: "#32ADA1",
    accentHex: "#F59E0B",
    primaryHsl: "207 72% 20%",
    secondaryHsl: "174 54% 43%",
    accentHsl: "38 92% 50%",
  },
]

export function applyThemePreset(presetId: string) {
  const preset = THEME_PRESETS.find((p) => p.id === presetId) || THEME_PRESETS[0]
  if (typeof document !== "undefined") {
    const root = document.documentElement
    root.style.setProperty("--primary", preset.primaryHsl)
    root.style.setProperty("--secondary", preset.secondaryHsl)
    root.style.setProperty("--accent", preset.accentHsl)
    root.style.setProperty("--ring", preset.secondaryHsl)
    root.style.setProperty("--sidebar", preset.primaryHsl)
    root.style.setProperty("--sidebar-primary", preset.secondaryHsl)
    root.style.setProperty("--chart-1", preset.primaryHsl)
    root.style.setProperty("--chart-2", preset.secondaryHsl)
    root.style.setProperty("--chart-3", preset.accentHsl)
    // The public site uses the same three brand colors as the admin system.
    // Keep the editorial/home-specific tokens derived from the selected preset
    // so changing the theme updates the entire site, not only shadcn controls.
    root.style.setProperty("--home-ink", preset.primaryHex)
    root.style.setProperty("--home-ink-soft", `color-mix(in srgb, ${preset.primaryHex} 68%, white)`)
    root.style.setProperty("--home-water", preset.accentHex)
    root.style.setProperty("--home-water-soft", `color-mix(in srgb, ${preset.accentHex} 12%, white)`)
    root.style.setProperty("--home-mist", `color-mix(in srgb, ${preset.accentHex} 6%, white)`)
    root.style.setProperty("--home-gold", preset.secondaryHex)
    root.style.setProperty("--home-line", `color-mix(in srgb, ${preset.accentHex} 20%, white)`)
  }
}
