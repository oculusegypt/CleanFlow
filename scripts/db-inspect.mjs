import { createRequire } from "node:module";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const require = createRequire(join(ROOT, "lib", "db", "package.json"));
const Database = require("better-sqlite3");

const db = new Database(join(ROOT, "data", "sabaik.db"), { readonly: true });
console.log("=== TABLES ===");
console.log(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name));

console.log("\n=== SITE SETTINGS ===");
const settings = db.prepare("SELECT key, value FROM site_settings").all();
console.log(settings);

console.log("\n=== COUNTS ===");
for (const table of ["services", "containers", "posts", "seo_pages", "reviews", "packages", "testimonials"]) {
  try {
    const res = db.prepare(`SELECT count(1) as c FROM ${table}`).get();
    console.log(`${table}: ${res.c}`);
  } catch (e) {
    console.log(`${table}: table not found or error`);
  }
}
