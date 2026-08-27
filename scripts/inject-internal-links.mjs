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

const LINK_RULES = [
  {
    pattern: /(تنظيف بعد البناء والتشطيب|تنظيف بعد التشطيب|تنظيف بعد البناء|إزالة بقايا الإسمنت|إزالة الدهانات بعد التشطيب)/i,
    replacement: '<a href="/services/tanzeef-bad-altashteeb-alryad" class="text-primary font-bold hover:underline" title="شركة تنظيف بعد البناء بالرياض">$1</a>'
  },
  {
    pattern: /(تنظيف الفلل والقصور|تنظيف الفلل بالرياض|تنظيف فلل بالرياض|تنظيف منازل بالرياض|تنظيف المنازل بالرياض)/i,
    replacement: '<a href="/services/tanzeef-filal-alryad" class="text-primary font-bold hover:underline" title="شركة تنظيف فلل بالرياض">$1</a>'
  },
  {
    pattern: /(غسيل المجالس والكنب بالبخار|غسيل مجالس بالبخار|غسيل كنب بالبخار|تنظيف مجالس بالبخار|تنظيف كنب بالبخار)/i,
    replacement: '<a href="/services/gaseel-majalis-bukhar-alryad" class="text-primary font-bold hover:underline" title="غسيل مجالس وكنب بالبخار بالرياض">$1</a>'
  },
  {
    pattern: /(تنظيف وغسيل المكيفات|غسيل مكيفات سبليت|تنظيف مكيفات سبليت|غسيل المكيفات بالضغط|تنظيف مكيفات بالرياض)/i,
    replacement: '<a href="/services/tanzeef-mokeyafat-alryad" class="text-primary font-bold hover:underline" title="شركة تنظيف مكيفات بالرياض">$1</a>'
  },
  {
    pattern: /(جلي وتلميع الرخام|جلي الرخام بالألماس|تلميع الرخام بالكريستال|جلي وتلميع رخام|جلي رخام بالرياض)/i,
    replacement: '<a href="/services/jaly-rakham-alryad" class="text-primary font-bold hover:underline" title="شركة جلي وتلميع رخام بالرياض">$1</a>'
  },
  {
    pattern: /(تنظيف وتطهير خزانات المياه|تنظيف خزانات المياه|تعقيم الخزانات بالكلور|غسيل الخزانات الأرضية|تنظيف خزانات بالرياض)/i,
    replacement: '<a href="/services/tanzeef-khazanat-alryad" class="text-primary font-bold hover:underline" title="شركة تنظيف وتطهير خزانات بالرياض">$1</a>'
  },
  {
    pattern: /(مكافحة وإبادة الحشرات|رش مبيدات بضمان|مكافحة حشرات بالرياض|رش مبيدات بالرياض)/i,
    replacement: '<a href="/services/mokafahat-hasharat-alryad" class="text-primary font-bold hover:underline" title="شركة مكافحة حشرات ورش مبيدات بالرياض">$1</a>'
  },
  {
    pattern: /(شمال الرياض)/i,
    replacement: '<a href="/areas/north-riyadh" class="text-primary font-bold hover:underline" title="شركة تنظيف شمال الرياض">$1</a>'
  },
  {
    pattern: /(حي الملقا)/i,
    replacement: '<a href="/areas/al-malqa" class="text-primary font-bold hover:underline" title="شركة تنظيف حي الملقا">$1</a>'
  },
  {
    pattern: /(حي الياسمين)/i,
    replacement: '<a href="/areas/al-yasmin" class="text-primary font-bold hover:underline" title="شركة تنظيف حي الياسمين">$1</a>'
  },
  {
    pattern: /(حي حطين)/i,
    replacement: '<a href="/areas/hittin" class="text-primary font-bold hover:underline" title="شركة تنظيف حي حطين">$1</a>'
  },
  {
    pattern: /(حي النرجس)/i,
    replacement: '<a href="/areas/al-narjis" class="text-primary font-bold hover:underline" title="شركة تنظيف حي النرجس">$1</a>'
  },
  {
    pattern: /(حي الصحافة)/i,
    replacement: '<a href="/areas/al-sahafa" class="text-primary font-bold hover:underline" title="شركة تنظيف حي الصحافة">$1</a>'
  }
];

function injectLinks(html) {
  if (!html) return html;
  let modified = html;

  for (const rule of LINK_RULES) {
    let replaced = false;
    // Replace only the first occurrence that is NOT inside an existing <a> tag or <h1>-<h3> tag
    modified = modified.replace(rule.pattern, (match, p1, offset, fullStr) => {
      if (replaced) return match; // only 1 link per keyword per article
      // Check if inside <a> tag
      const preceding = fullStr.slice(Math.max(0, offset - 150), offset);
      if (/<a\s[^>]*>[^<]*$/i.test(preceding)) return match;
      if (/<h[1-3][^>]*>[^<]*$/i.test(preceding)) return match;
      replaced = true;
      return rule.replacement.replace("$1", match);
    });
  }

  // Add Service Hub Navigation block at the end of article if not already present
  if (!modified.includes('class="article-service-hub"')) {
    const hubBox = `
<div class="article-service-hub" style="margin-top:36px;padding:24px;background:#f8fafc;border-radius:16px;border:1px solid #e2e8f0;">
  <h3 style="font-size:18px;font-weight:800;color:#0f172a;margin-top:0;margin-bottom:12px;">📌 خدمات التنظيف ذات الصلة في الرياض:</h3>
  <ul style="list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;">
    <li><a href="/services/tanzeef-filal-alryad" style="color:#0284c7;font-weight:700;text-decoration:none;">🧹 تنظيف الفلل والقصور بالرياض</a></li>
    <li><a href="/services/tanzeef-bad-altashteeb-alryad" style="color:#0284c7;font-weight:700;text-decoration:none;">🏗️ تنظيف بعد البناء والتشطيب</a></li>
    <li><a href="/services/gaseel-majalis-bukhar-alryad" style="color:#0284c7;font-weight:700;text-decoration:none;">🛋️ غسيل المجالس بالبخار 140°</a></li>
    <li><a href="/services/tanzeef-mokeyafat-alryad" style="color:#0284c7;font-weight:700;text-decoration:none;">❄️ غسيل المكيفات بضغط 150 بار</a></li>
    <li><a href="/services/jaly-rakham-alryad" style="color:#0284c7;font-weight:700;text-decoration:none;">💎 جلي وتلميع الرخام بالألماس</a></li>
    <li><a href="/services/tanzeef-khazanat-alryad" style="color:#0284c7;font-weight:700;text-decoration:none;">💧 تنظيف وتطهير خزانات المياه</a></li>
  </ul>
</div>`;
    modified += hubBox;
  }

  return modified;
}

for (const dbPath of dbs) {
  try {
    const db = new Database(dbPath);
    const posts = db.prepare("SELECT id, content FROM posts").all();
    const updatePost = db.prepare("UPDATE posts SET content = ? WHERE id = ?");
    
    const updateTx = db.transaction((rows) => {
      for (const row of rows) {
        const enriched = injectLinks(row.content);
        updatePost.run(enriched, row.id);
      }
    });

    updateTx(posts);
    console.log(`✅ Injected internal linking structure into ${posts.length} posts in ${dbPath}`);
    db.close();
  } catch (err) {
    console.error(`Error in ${dbPath}:`, err);
  }
}
