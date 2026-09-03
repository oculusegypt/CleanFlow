import { createRequire } from 'node:module';
import path from 'node:path';

const root = path.resolve(new URL('.', import.meta.url).pathname, '..');
const require = createRequire(path.join(root, 'lib', 'db', 'package.json'));
const Database = require('better-sqlite3');
const dbPath = path.join(root, 'data', 'sabaik.db');
const db = new Database(dbPath, { readonly: true });

const rows = db.prepare(`
  SELECT id, title, slug, excerpt, content, target_keyword, status, is_active
  FROM seo_pages
  WHERE content LIKE '%مسودة%'
     OR excerpt LIKE '%مسودة%'
     OR content LIKE '%نطاق%'
     OR excerpt LIKE '%نطاق%'
     OR content LIKE '%فريق الإدارة%'
     OR content LIKE '%مراجعة داخلية%'
     OR content LIKE '%فضيحة%'
     OR content LIKE '%محفوظة كمسودة%'
`).all();

console.log(`Found ${rows.length} placeholder pages with internal review text.`);
for (const r of rows) {
  console.log(`- ID: ${r.id} | Title: "${r.title}" | Slug: "${r.slug}" | Status: ${r.status}`);
}
