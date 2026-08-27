import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const replacements = [
  ["/services/tanzeef-filal-alryad", `/services/${encodeURIComponent("تنظيف-فلل-وقصور-بالرياض")}`],
  ["/services/tanzeef-shaqaq-alryad", `/services/${encodeURIComponent("تنظيف-شقق-بالرياض")}`],
  ["/services/tanzeef-bad-altashteeb-alryad", `/services/${encodeURIComponent("تنظيف-بعد-البناء-والتشطيب-بالرياض")}`],
  ["/services/gaseel-majalis-bukhar-alryad", `/services/${encodeURIComponent("غسيل-مجالس-بالبخار-بالرياض")}`],
  ["/services/tanzeef-mokeyafat-alryad", `/services/${encodeURIComponent("تنظيف-وغسيل-مكيفات-بالرياض")}`],
  ["/services/jaly-rakham-alryad", `/services/${encodeURIComponent("جلي-وتلميع-رخام-بالرياض")}`],
  ["/services/tanzeef-khazanat-alryad", `/services/${encodeURIComponent("تنظيف-وتطهير-خزانات-بالرياض")}`],
  ["/services/mokafahat-hasharat-alryad", `/services/${encodeURIComponent("مكافحة-حشرات-بالرياض")}`],
  ["/services/tanzeef-wajahat-alryad", `/services/${encodeURIComponent("تنظيف-واجهات-مباني-بالرياض")}`],
  ["/services/tanzeef-masabeh-alryad", `/services/${encodeURIComponent("تنظيف-وتطهير-مسابح-بالرياض")}`],
];

const targetFiles = [
  join(ROOT, "artifacts/sabaik-almasa/src/pages/NeighborhoodPage.tsx"),
  join(ROOT, "artifacts/sabaik-almasa/src/pages/admin/SEOPanel.tsx"),
  join(ROOT, "artifacts/sabaik-almasa/src/components/layout/Footer.tsx"),
];

for (const tf of targetFiles) {
  try {
    let content = readFileSync(tf, "utf8");
    for (const [from, to] of replacements) {
      content = content.replaceAll(from, to);
    }
    writeFileSync(tf, content, "utf8");
    console.log("✅ Updated links in:", tf);
  } catch (e) {
    console.warn("Failed:", tf, e.message);
  }
}
