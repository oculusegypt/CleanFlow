import { createRequire } from "node:module";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const require = createRequire(join(ROOT, "lib", "db", "package.json"));
const Database = require("better-sqlite3");

const dbs = [
  join(ROOT, "data", "sabaik.db"),
  join(ROOT, "data", "sabaik_7dbd.db")
];

for (const dbPath of dbs) {
  const db = new Database(dbPath);
  const posts = db.prepare("SELECT id, title, slug, content FROM posts").all();
  console.log(`Checking ${posts.length} posts in ${dbPath}...`);
  let linksCount = 0;
  for (const p of posts) {
    if (p.content && p.content.includes("/services/") || p.content.includes("/areas/")) {
      linksCount++;
    }
  }
  console.log(`Posts with contextual internal links: ${linksCount}/${posts.length}`);
  db.close();
}
