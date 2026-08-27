import { createRequire } from "node:module";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const require = createRequire(import.meta.url);
const DB = require("better-sqlite3");
const db = new DB(join(ROOT, "data/sabaik.db"));

db.prepare(`
  UPDATE services
  SET seo_description = 'أفضل شركة تنظيف شقق بالرياض. تنظيف وتعقيم شامل للشقق والمنازل السكنية مع التطهير والتلميع الكامل وحساب التكلفة حسب المساحة والغرف.',
      seo_title = 'شركة تنظيف شقق بالرياض | تنظيف منازل وتعقيم شامل'
  WHERE id = 1
`).run();

db.prepare(`
  UPDATE services
  SET description = 'غسيل وتنظيف مكيفات السبلت والمخفي والمركزية بضغط المياه العالي بدون فك مع جراب الحماية المائي لمنع تناثر المياه.',
      seo_description = 'شركة غسيل وتنظيف مكيفات بالرياض. تنظيف سبلت ومخفي بضغط المياه العالي 150 بار مع جراب الحماية المائي والتطهير الشامل.',
      seo_title = 'شركة تنظيف وغسيل مكيفات بالرياض | غسيل بجراب الحماية المائي'
  WHERE id = 4
`).run();

console.log("✅ Successfully cleaned services table from static prices and freon testing references!");
db.close();
