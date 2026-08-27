import { createRequire } from "node:module";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const require = createRequire(join(ROOT, "lib", "db", "package.json"));
const Database = require("better-sqlite3");
const db = new Database(join(ROOT, "data", "sabaik.db"));

const rows = db.prepare("SELECT key, value FROM site_settings WHERE key LIKE '%logo%' OR key LIKE '%icon%' OR key LIKE '%image%'").all();
console.log("Settings image keys:", rows);
