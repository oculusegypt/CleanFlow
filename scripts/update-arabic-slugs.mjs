import { createRequire } from "node:module";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const require = createRequire(join(ROOT, "lib", "db", "package.json"));
const Database = require("better-sqlite3");

const dbPaths = [
  join(ROOT, "data/sabaik.db"),
  join(ROOT, "build_php/data/sabaik.db")
];

const serviceSlugMap = {
  1: "تنظيف-شقق-بالرياض",
  2: "تنظيف-فلل-وقصور-بالرياض",
  3: "غسيل-مجالس-بالبخار-بالرياض",
  4: "تنظيف-وغسيل-مكيفات-بالرياض",
  5: "مكافحة-حشرات-بالرياض",
  6: "تنظيف-وتطهير-خزانات-بالرياض",
  7: "تنظيف-وتطهير-مسابح-بالرياض",
  8: "جلي-وتلميع-رخام-بالرياض",
  9: "تنظيف-واجهات-مباني-بالرياض",
  10: "تنظيف-بعد-البناء-والتشطيب-بالرياض",
  11: "اصدار-شهادة-سلامة-بالرياض",
  12: "تركيب-ادوات-وقاية-وحماية-من-الحريق-بالرياض",
  13: "اعداد-تقرير-فني-فوري-بالرياض",
  14: "اعداد-تقرير-فني-مجدول-بالرياض",
  15: "عقد-صيانة-انظمة-سلامة-دفاع-مدني-بالرياض"
};

const packageSlugMap = {
  1: "باقة-تنظيف-شقق-سكنية",
  2: "باقة-تنظيف-فلل-شاملة",
  3: "باقة-تنظيف-قصور-ومجمعات",
  4: "باقة-تنظيف-قبل-وبعد-النقل-والترميم",
  5: "باقة-غسيل-مجالس-وكنب-بالبخار",
  6: "باقة-جلي-وتلميع-رخام-وسيراميك",
  7: "باقة-تنظيف-وتطهير-خزانات-مياه",
  8: "باقة-غسيل-وتنظيف-مكيفات-هواء",
  9: "باقة-مكافحة-وابادة-حشرات",
  10: "باقة-تنظيف-بعد-البناء-والتشطيب",
  11: "باقة-تنظيف-واجهات-مباني",
  12: "باقة-تنظيف-وتطهير-مساجد-ومدارس",
  13: "باقة-شهادة-سلامة-وتجهيز-ملف-المنشاة",
  14: "باقة-تركيب-وتجهيز-انظمة-حماية-من-الحريق",
  15: "باقة-تقرير-فني-فوري",
  16: "باقة-تقرير-فني-مجدول",
  17: "باقة-عقد-صيانة-انظمة-سلامة-دفاع-مدني"
};

for (const p of dbPaths) {
  try {
    const db = new Database(p);
    const updateService = db.prepare("UPDATE services SET seo_slug = ? WHERE id = ?");
    for (const [id, slug] of Object.entries(serviceSlugMap)) {
      updateService.run(slug, Number(id));
    }

    const updatePackage = db.prepare("UPDATE packages SET seo_slug = ? WHERE id = ?");
    for (const [id, slug] of Object.entries(packageSlugMap)) {
      updatePackage.run(slug, Number(id));
    }
    db.close();
    console.log("✅ Updated DB at:", p);
  } catch (err) {
    console.warn("Skipping or failed:", p, err.message);
  }
}
