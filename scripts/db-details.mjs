import { createRequire } from "node:module";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const require = createRequire(join(ROOT, "lib", "db", "package.json"));
const Database = require("better-sqlite3");

const db = new Database(join(ROOT, "data", "sabaik.db"), { readonly: true });

for (const table of ["services", "containers", "posts", "seo_pages", "site_settings"]) {
  console.log(`\n=== COLUMNS FOR ${table} ===`);
  console.log(db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name));
}

console.log("\n=== SERVICES SAMPLE ===");
console.log(db.prepare("SELECT id, title, seo_slug, is_active FROM services").all());

console.log("\n=== CONTAINERS SAMPLE ===");
console.log(db.prepare("SELECT id, name, seo_slug, is_active FROM containers").all());

console.log("\n=== POSTS SAMPLE ===");
console.log(db.prepare("SELECT id, title, slug, status FROM posts LIMIT 5").all());

console.log("\n=== SEO PAGES SAMPLE ===");
console.log(db.prepare("SELECT id, title, slug, status FROM seo_pages LIMIT 5").all());
