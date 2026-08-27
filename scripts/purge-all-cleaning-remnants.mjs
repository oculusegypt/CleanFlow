import { readdirSync, rmSync, existsSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const cleaningImages = [
  "hero-riyadh-cleaning.jpg",
  "hero-riyadh-majlis.jpg",
  "hero-riyadh-postconstruction.jpg",
  "service-ac.jpg",
  "service-apartments.jpg",
  "service-facades.jpg",
  "service-facilities.jpg",
  "service-majlis.jpg",
  "service-marble.jpg",
  "service-move.jpg",
  "service-palace.jpg",
  "service-pest.jpg",
  "service-pool.jpg",
  "service-postconstruction.jpg",
  "service-tanks.jpg",
  "service-villas.jpg",
];

const imgDirs = [
  join(ROOT, "artifacts/sabaik-almasa/public/images"),
  join(ROOT, "build_php/images"),
];

for (const dir of imgDirs) {
  if (!existsSync(dir)) continue;
  for (const img of cleaningImages) {
    const p = join(dir, img);
    if (existsSync(p)) {
      rmSync(p, { force: true });
      console.log(`Deleted cleaning image: ${p}`);
    }
  }
  const pkgDir = join(dir, "packages");
  if (existsSync(pkgDir)) {
    rmSync(pkgDir, { recursive: true, force: true });
    console.log(`Deleted packages image dir: ${pkgDir}`);
  }
}

// Clean old cleaning folders in build_php
const buildPhp = join(ROOT, "build_php");
if (existsSync(buildPhp)) {
  const oldServices = [
    "تنظيف-شقق-بالرياض",
    "تنظيف-فلل-وقصور-بالرياض",
    "تنظيف-واجهات-مباني-بالرياض",
    "تنظيف-وتطهير-خزانات-بالرياض",
    "تنظيف-وتطهير-مسابح-بالرياض",
    "تنظيف-وغسيل-مكيفات-بالرياض",
    "جلي-وتلميع-رخام-بالرياض",
    "غسيل-مجالس-بالبخار-بالرياض",
    "مكافحة-حشرات-بالرياض",
    "عقد-صيانة-انظمة-سلامة-دفاع-مدني-بالرياض",
    "اعداد-تقرير-فني-فوري-بالرياض",
    "اعداد-تقرير-فني-مجدول-بالرياض",
    "تركيب-ادوات-وقاية-وحماية-من-الحريق-بالرياض",
  ];
  for (const svc of oldServices) {
    const p = join(buildPhp, "services", svc);
    if (existsSync(p)) {
      rmSync(p, { recursive: true, force: true });
      console.log(`Deleted old service prerender dir: ${p}`);
    }
  }
}

console.log("✅ Cleaning remnants purged successfully.");
