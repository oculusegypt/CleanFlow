import { createRequire } from "node:module";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const require = createRequire(import.meta.url);
const Database = require(join(ROOT, "lib/db/node_modules/better-sqlite3"));
const db = new Database(join(ROOT, "data/sabaik.db"));
const now = new Date().toISOString();
const siteNameRow = db.prepare("SELECT value FROM site_settings WHERE key = 'company_name'").get();
const siteName = String(siteNameRow?.value || "").trim() || "الشركة";

db.exec(`
  CREATE TABLE IF NOT EXISTS seo_pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    target_keyword TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    excerpt TEXT NOT NULL DEFAULT '',
    cover_image TEXT DEFAULT '',
    category TEXT NOT NULL DEFAULT 'خدمات التنظيف',
    tags TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'draft',
    published_at TEXT,
    view_count INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL DEFAULT 0,
    seo_title TEXT NOT NULL DEFAULT '',
    seo_description TEXT NOT NULL DEFAULT '',
    seo_keywords TEXT NOT NULL DEFAULT '',
    seo_slug TEXT NOT NULL DEFAULT '',
    og_image TEXT NOT NULL DEFAULT '',
    canonical_url TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

const keywords = [
  "شركة تنظيف بالرياض", "تنظيف مكيفات عمالة فلبينية", "تصليح مكيفات بالخرج",
  "نصائح للحفاظ على التكييف", "شركة نقل مكيفات بالرياض", "فني مكيفات بالرياض",
  "غسيل مكيف سبليت", "تنظيف مكيفات سبليت", "تنظيف منازل بالرياض",
  "شركة صيانة مكيفات سبليت", "تنظيف مكيفات سبليت بالرياض", "شركة فك وتركيب مكيفات",
  "شركة تنظيف المكيفات بالرياض", "شركة تنظيف فلل بالرياض", "شركة غسيل مكيفات بالرياض",
  "شركة نظافة عامة", "اسعار شركة تنظيف بالرياض", "شركة تنظيف مجالس بالرياض",
  "تنظيف مكيفات شرق الرياض", "تصليح مكيفات الرياض", "شركة كشف تسربات المياه",
  "شركة غسيل سيارات", "دينا نقل عفش بالرياض", "شركة مكافحة حشرات بالرياض",
  "شركة مكافحة حشرات بالخرج", "تنظيف المنزل بفعالية", "شركات تنظيف بالرياض",
  "شركة تنظيف فلل بالخرج", "شركات النظافة بالسعودية", "شركة تنظيف منازل بالمزاحمية",
  "شركة تنظيف بالخرج", "تنظيف مجالس بالخرج", "شركة تنظيف موكيت بالرياض",
  "شركة نقل عفش بالرياض", "شركة نقل العفش داخل الرياض", "شركات نقل العفش بالرياض",
  "ارخص شركة نقل اثاث بالرياض", "نقل اثاث شرق الرياض", "شركة نقل عفش بالخرج",
  "نقل عفش بالرياض باكستاني", "نقل عفش شرق الرياض", "تنظيف خزانات شرق الرياض",
  "شركة تنظيف خزانات المياه", "ارخص شركة تنظيف في الرياض", "تنظيف بيوت بالرياض",
  "شركة تنظيف بضرما", "شركة تنظيف بالدرعية", "شركة تنظيف غرب الرياض",
  "خدمات التنظيف بالرياض", "شركة تنظيف شرق الرياض", "شركة تنظيف بعد الحريق",
  "شركة تنظيف شمال الرياض", "ارقام شركة تنظيف بالرياض", "شركة تنظيف عمائر بالرياض",
  "تنظيف منازل بالساعة", "تنظيف بعد التشطيب بالرياض", "تطبيق تنظيف منازل بالرياض",
  "تنظيف واجهات زجاج بالرياض", "شركة تنظيف كنب بالخرج", "تنظيف منازل بالخرج",
  "شركة تنظيف مكيفات بالخرج", "شركة مكافحة النمل الابيض", "شركة تنظيف شقق بالرياض",
  "تنظيف الأرضيات والحوائط", "طرق احترافية لتنظيف المنازل", "شركة تنظيف الحوش بالرياض",
  "شركة تنظيف ثريات", "شركة تعقيم بالرياض", "جلي بلاط بالرياض",
  "شركة غسيل سجاد بالرياض", "شركة تنظيف اثاث", "شركة تسليك مجاري",
  "عمال تنظيف بالساعة", "نصائح تنظيف المنازل", "شركة تنظيف منازل في الرياض",
  "شركة تنظيف قصور بالرياض", "air-conditioner-alkharj", "ونيـت نقل عفش بالرياض",
  "شركة نقل عفش شمال الرياض", "تنظيف مجالس", "شركة تنظيف مفروشات بالرياض",
  "شركة تنظيف مجالس بالبخار", "شركة تنظيف كنب", "شركة تنظيف بالرخار بالرياض",
  "شركة تنظيف مكاتب بالرياض", "شركة تنظيف محلات بالرياض", "شركة تنظيف خزانات شمال الرياض",
  "شركة مكافحة البق بالرياض", "شركة عزل خزانات بالرياض", "مكيفات سبليت مستعمل الرياض",
  "شركة تنظيف بالساعة في الرياض", "شركة رش مبيدات شمال الرياض", "شركة رش مبيدات شرق الرياض",
  "تنظيف شقق شمال الرياض", "شركة القضاء على الحشرات", "شركة تنظيف مدارس بالرياض",
  "شركة تنظيف خيام بالرياض", "تنظيف مسابح بالرياض", "تنظيف محلات بالخرج",
  "شركة عزل اسطح بالرياض", "شركة ابادة حشرات بالرياض",
];

const unsupported = /تصليح|فني مكيفات|نقل مكيفات|فك وتركيب مكيفات|صيانة مكيفات|نقل عفش|نقل اثاث|نقل مخلفات|غسيل سيارات|كشف تسربات|تسليك مجاري|عزل خزانات|عزل اسطح|مستعمل|دينا|وني.?ت|تطبيق|air-conditioner/i;
const serviceRows = db.prepare("SELECT title, description, seo_title, seo_description, seo_keywords FROM services").all();
const packageRows = db.prepare("SELECT name AS title, description, seo_title, seo_description, seo_keywords FROM containers").all();
const postRows = db.prepare("SELECT title, excerpt, seo_title, seo_description, seo_keywords FROM posts").all();
const coveredText = [...serviceRows, ...packageRows, ...postRows]
  .map(row => Object.values(row).join(" ").toLowerCase())
  .join(" ");
const hasExactCoverage = keyword => coveredText.includes(keyword.toLowerCase());

const slugify = value => value
  .toLowerCase()
  .replace(/[\s_]+/g, "-")
  .replace(/[^\u0600-\u06FFa-z0-9-]/g, "")
  .replace(/-+/g, "-")
  .replace(/^-|-$/g, "")
  .slice(0, 90) || `صفحة-seo-${Date.now()}`;

const insert = db.prepare(`
  INSERT INTO seo_pages
    (title, slug, target_keyword, content, excerpt, cover_image, category, tags, status,
     published_at, view_count, is_active, "order", seo_title, seo_description,
     seo_keywords, seo_slug, og_image, canonical_url, created_at, updated_at)
  VALUES
    (@title, @slug, @target_keyword, @content, @excerpt, @cover_image, @category, @tags, @status,
     @published_at, 0, 1, @order, @seo_title, @seo_description,
     @seo_keywords, @seo_slug, @og_image, @canonical_url, @created_at, @updated_at)
`);
const exists = db.prepare("SELECT id FROM seo_pages WHERE target_keyword = ? OR slug = ?");

let created = 0;
let skippedExisting = 0;
let skippedDuplicate = 0;
for (const keyword of keywords) {
  const slug = slugify(keyword);
  if (exists.get(keyword, slug)) {
    skippedDuplicate++;
    continue;
  }
  // Do not create a thin duplicate where an existing service/article already
  // targets the exact phrase. The admin page still supports adding it manually.
  if (hasExactCoverage(keyword)) {
    skippedExisting++;
    continue;
  }

  const isSupported = !unsupported.test(keyword);
  const status = isSupported ? "published" : "draft";
  const title = `${keyword} | ${siteName}`;
  const excerpt = isSupported
    ? `تعرف على خدمة ${keyword} من ${siteName}، مع فريق متخصص وتجهيزات مناسبة لخدمات التنظيف في الرياض والمناطق القريبة. اطلب عرض السعر.`
    : `صفحة بحثية لكلمة "${keyword}". تحقق من نطاق الخدمات المتاحة لدى ${siteName} قبل نشر الصفحة للزوار.`;
  const content = isSupported
    ? `<h2>${keyword} في الرياض</h2><p>تقدم ${siteName} خدمات تنظيف متخصصة للأفراد والمنشآت في الرياض، مع معاينة الاحتياج وتحديد فريق العمل والمعدات المناسبة لكل موقع.</p><h2>ماذا تشمل الخدمة؟</h2><ul><li>تحديد نوع المساحة والأسطح المطلوب تنظيفها.</li><li>استخدام مواد ومعدات مناسبة لطبيعة المكان.</li><li>تنفيذ منظم مع مراجعة النتيجة قبل مغادرة الفريق.</li></ul><h2>اطلب الخدمة</h2><p>أرسل تفاصيل موقعك واحتياجك إلى ${siteName} للحصول على توصية وعرض سعر مناسبين دون التزام.</p>`
    : `<h2>حول البحث عن ${keyword}</h2><p>هذه الصفحة محفوظة كمسودة للمراجعة الداخلية. الكلمة المفتاحية لا تصف خدمة تنظيف أساسية مؤكدة ضمن نطاق ${siteName} الحالي، لذلك لن تُعرض للزوار قبل اعتماد محتوى دقيق من فريق الإدارة.</p>`;
  const keywordsText = `${keyword}، خدمات التنظيف بالرياض، ${siteName}`;
  insert.run({
    title,
    slug,
    target_keyword: keyword,
    content,
    excerpt,
    cover_image: "/images/service-apartments.jpg",
    category: isSupported ? "خدمات التنظيف" : "مراجعة قبل النشر",
    tags: JSON.stringify([keyword, "الرياض", siteName]),
    status,
    published_at: status === "published" ? now : null,
    order: created,
    seo_title: `${keyword} | خدمة موثوقة بالرياض`,
    seo_description: excerpt.slice(0, 160),
    seo_keywords: keywordsText,
    seo_slug: slug,
    og_image: "/images/service-apartments.jpg",
    canonical_url: `/page/${slug}`,
    created_at: now,
    updated_at: now,
  });
  created++;
}

db.close();
console.log(`تم إنشاء ${created} صفحة SEO جديدة، وتجاوز ${skippedExisting} كلمة لها تغطية حالية، وتجاوز ${skippedDuplicate} مكررة.`);