import { createRequire } from "node:module";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const require = createRequire(join(ROOT, "lib", "db", "package.json"));
const Database = require("better-sqlite3");

const db = new Database(join(ROOT, "data", "sabaik.db"), { readonly: true });
const posts = db.prepare("SELECT id, title, slug, category, status FROM posts WHERE is_active = 1").all();
console.log("Active posts count:", posts.length);
for (const p of posts) {
  console.log(`[${p.id}] ${p.title} (${p.slug}) - ${p.category}`);
}
