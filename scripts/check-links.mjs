import { createRequire } from "node:module";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const require = createRequire(join(ROOT, "lib", "db", "package.json"));
const Database = require("better-sqlite3");

const dbs = [
  join(ROOT, "data", "sabaik.db"),
  join(ROOT, "data", "sabaik_7dbd.db")
];

let checkedDatabases = 0;
for (const dbPath of dbs) {
  if (!existsSync(dbPath)) {
    console.warn(`TOOL WARNING: optional database is missing, skipping: ${dbPath}`);
    continue;
  }
  const db = new Database(dbPath);
  const postsTable = db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'posts'").get();
  if (!postsTable) {
    console.warn(`TOOL WARNING: optional database has no posts table, skipping: ${dbPath}`);
    db.close();
    continue;
  }
  checkedDatabases++;
  const posts = db.prepare("SELECT id, title, slug, content FROM posts").all();
  console.log(`Checking ${posts.length} posts in ${dbPath}...`);
  let linksCount = 0;
  for (const p of posts) {
    if (p.content && (p.content.includes("/services/") || p.content.includes("/areas/"))) {
      linksCount++;
    }
  }
  console.log(`Posts with contextual internal links: ${linksCount}/${posts.length}`);
  db.close();
}

if (!checkedDatabases) {
  console.error("TOOL ERROR: no database with a posts table was available");
  process.exit(1);
}
