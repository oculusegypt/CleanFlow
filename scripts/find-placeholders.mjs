import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve('data/sabaik.db');
const db = new Database(dbPath);

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
