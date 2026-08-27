import { createRequire } from "node:module";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const require = createRequire(join(ROOT, "lib", "db", "package.json"));
const Database = require("better-sqlite3");

const db = new Database(join(ROOT, "data", "sabaik.db"), { readonly: true });
const services = db.prepare("SELECT id, title, seo_slug, seo_title, seo_description, description FROM services WHERE is_active = 1").all();
console.log("Found active services:", services.length);
for (const s of services) {
  console.log(`\n=== [${s.id}] ${s.title} (${s.seo_slug}) ===`);
  console.log("SEO Title:", s.seo_title);
  console.log("SEO Desc:", s.seo_description);
  console.log("Desc Excerpt:", (s.description || "").slice(0, 150) + "...");
}
