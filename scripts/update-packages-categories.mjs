import { createRequire } from "node:module";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const require = createRequire(import.meta.url);
const DB = require("better-sqlite3");
const db = new DB(join(ROOT, "data/sabaik.db"));

console.log("🔄 Updating packages categories in data/sabaik.db...");

const updates = [
  { id: 58, category: "residential" },   // باقة تنظيف الشقق السكنية
  { id: 59, category: "residential" },   // باقة تنظيف الفلل الشاملة
  { id: 60, category: "sanitization" },  // باقة غسيل وتنظيف المكيفات
  { id: 61, category: "sanitization" },  // باقة مكافحة الحشرات والرش
  { id: 62, category: "postcon" },       // باقة تنظيف بعد التشطيب والبناء
  { id: 63, category: "steampolish" },    // باقة غسيل المجالس بالبخار
  { id: 64, category: "steampolish" },    // باقة جلي وتلميع الرخام
  { id: 65, category: "sanitization" },  // باقة تنظيف وتطهير الخزانات
];

const stmt = db.prepare("UPDATE containers SET category = ? WHERE id = ?");
for (const u of updates) {
  stmt.run(u.category, u.id);
}

console.log("✅ Packages categories updated in sabaik.db!");
db.close();
