import { createRequire } from "node:module";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const require = createRequire(import.meta.url);
const DB = require("better-sqlite3");
const db = new DB(join(ROOT, "data/sabaik.db"));
const siteNameRow = db.prepare("SELECT value FROM site_settings WHERE key = 'company_name'").get();
const siteName = String(siteNameRow?.value || "").trim() || "الشركة";

console.log("🔄 Cleaning up services table and setting 100% valid Arabic SEO slugs...");

// Delete legacy empty duplicate services (IDs > 10)
db.prepare("DELETE FROM services WHERE id > 10 OR seo_slug = '' OR seo_slug IS NULL").run();

// Clean, 10 official services data with high-res photos and full Arabic slugs
const OFFICIAL_SERVICES = [
  {
    id: 1,
    title: "تنظيف الشقق السكنية",
    description: "تنظيف وتطهير شامل لجميع الغرف، الصالونات، المطابخ، والحمامات بالرياض بأحدث المواد والعمالة الفنية المدربة.",
    icon: "Building2",
    image_url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800",
    order: 1,
    is_active: 1,
    seo_enabled: 1,
    seo_title: "تنظيف شقق بالرياض | أفضل شركة تنظيف شقق سكنية",
    seo_description: "أفضل شركة تنظيف شقق بالرياض. تنظيف وتعقيم شامل للشقق السكنية مع التطهير والتلميع وبضمان التسليم الكامل.",
    seo_keywords: "تنظيف شقق بالرياض, شركة تنظيف شقق الرياض, أسعار تنظيف الشقق بالرياض, غسيل شقق بالرياض",
    seo_slug: "تنظيف-شقق-بالرياض"
  },
  {
    id: 2,
    title: "تنظيف الفلل والقصور",
    description: "تنظيف عميق شامل للأدوار، الأجنحة، الأحواش، الدرج، والواجهات الزجاجية للفلل والقصور بالرياض بأحدث الأجهزة.",
    icon: "Home",
    image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
    order: 2,
    is_active: 1,
    seo_enabled: 1,
    seo_title: `تنظيف فلل وقصور بالرياض | ${siteName}`,
    seo_description: "شركة تنظيف فلل وقصور بالرياض. تنظيف عميق لجميع الأدوار والأحواش والدرج بجودة عالية وتسليم كامل جاهز للسكن.",
    seo_keywords: "تنظيف فلل بالرياض, شركة تنظيف قصور بالرياض, تنظيف فلل جديدة بالرياض, غسيل فلل بالرياض",
    seo_slug: "تنظيف-فلل-وقصور-بالرياض"
  },
  {
    id: 3,
    title: "غسيل المجالس والكنب بالبخار",
    description: "تنظيف وتطهير بالبخار الحراري 140° للمجالس والكنب بالسجاد بالرياض لإزالة أصعب البقع والتعقيم والتجفيف في 30 دقيقة.",
    icon: "Sparkles",
    image_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800",
    order: 3,
    is_active: 1,
    seo_enabled: 1,
    seo_title: "غسيل مجالس وكنب بالبخار بالرياض | تجفيف في 30 دقيقة",
    seo_description: "أفضل شركة غسيل مجالس وكنب بالبخار بالرياض. إزالة البقع والروائح والتعقيم الحراري للأثاث والموكيت بدون نقل الأثاث.",
    seo_keywords: "غسيل مجالس بالبخار بالرياض, تنظيف كنب بالبخار بالرياض, غسيل سجاد بالرياض, تعقيم مجالس بالرياض",
    seo_slug: "غسيل-مجالس-وكنب-بالبخار-بالرياض"
  },
  {
    id: 4,
    title: "تنظيف وغسيل المكيفات",
    description: "غسيل وتنظيف مكيفات السبلت والمخفي والمركزية بالضغط العالي بدون فك مع كيس الحماية وفحص غاز الفريون.",
    icon: "Wind",
    image_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800",
    order: 4,
    is_active: 1,
    seo_enabled: 1,
    seo_title: "تنظيف وغسيل مكيفات بالرياض | غسيل سبلت ومخفي بالضغط العالي",
    seo_description: "شركة غسيل وتنظيف مكيفات بالرياض. غسيل سبلت ومخفي بالضغط العالي بدون فك وتطهير الفلاتر وفحص الفريون بضمان.",
    seo_keywords: "تنظيف مكيفات بالرياض, غسيل مكيفات سبلت الرياض, غسيل مكيفات بدون فك, صيانة مكيفات بالرياض",
    seo_slug: "تنظيف-وغسيل-مكيفات-بالرياض"
  },
  {
    id: 5,
    title: "مكافحة وإبادة الحشرات والتعقيم",
    description: "رش وإبادة الصراصير، البق، النمل الأبيض، والقوارض بالجل الألماني والمبيدات المعتمدة بضمان سنة كاملة.",
    icon: "Bug",
    image_url: "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&q=80&w=800",
    order: 5,
    is_active: 1,
    seo_enabled: 1,
    seo_title: "شركة مكافحة حشرات بالرياض | رش مبيدات بضمان سنة",
    seo_description: "إبادة شاملة للصراصير والنمل والبق والقوارض بالرياض. استخدام جل ألماني ومبيدات آمنة بضمان كتابي رسمي لمدة عام.",
    seo_keywords: "شركة مكافحة حشرات بالرياض, رش مبيدات بالرياض, إبادة الصراصير والبق, رش نمل ابيض بالرياض",
    seo_slug: "مكافحة-حشرات-ورش-مبيدات-بالرياض"
  },
  {
    id: 6,
    title: "تنظيف وتطهير خزانات المياه",
    description: "غسيل الخزانات الأرضية والعلوية، شفط الرواسب والرمال، والتطهير بالكلور المعتمد وسد فواصل الترويبة.",
    icon: "Droplets",
    image_url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800",
    order: 6,
    is_active: 1,
    seo_enabled: 1,
    seo_title: "تنظيف وتطهير خزانات المياه بالرياض | تعقيم بالكلور",
    seo_description: "شركة تنظيف خزانات مياه بالرياض. غسيل وتطهير الخزانات الخرسانية والعلوي مع تعقيم الكلور المعتمد وسد التسربات.",
    seo_keywords: "تنظيف خزانات بالرياض, تطهير خزانات المياه الرياض, غسيل خزان أرضي, تعقيم خزانات بالرياض",
    seo_slug: "تنظيف-وتطهير-خزانات-المياه-بالرياض"
  },
  {
    id: 7,
    title: "تنظيف وتعقيم المسابح",
    description: "تفريغ وشفط الرواسب، غسيل جدران المسبح، التصفية بالكلور الصدمي ومكافحة الطحالب وصيانة الفلاتر بالرياض.",
    icon: "Waves",
    image_url: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=800",
    order: 7,
    is_active: 1,
    seo_enabled: 1,
    seo_title: "تنظيف وتعقيم مسابح بالرياض | صيانة فلاتر وكلور صدمي",
    seo_description: "شركة تنظيف وتطهير مسابح بالرياض. غسيل أرضيات وجدران المسابح ومكافحة الطحالب وضبط التوازن الكيميائي للماء.",
    seo_keywords: "تنظيف مسابح بالرياض, تطهير مسابح الرياض, صيانة فلاتر مسابح, تعقيم مسابح بالرياض",
    seo_slug: "تنظيف-وتعقيم-مسابح-بالرياض"
  },
  {
    id: 8,
    title: "جلي وتلميع الرخام والبلاط",
    description: "جلي الأرضيات بالألماس وتلميعها بالكريستال الإيطالي وتعبئة الفواصل بمادة الجولي لإعادة البريق الزجاجي.",
    icon: "Gem",
    image_url: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=800",
    order: 8,
    is_active: 1,
    seo_enabled: 1,
    seo_title: "جلي وتلميع رخام بالرياض | إعادة البريق الزجاجي بالألماس",
    seo_description: "أفضل شركة جلي وتلميع رخام وبلاط بالرياض. جلي بالألماس وتلميع بالكريستال الإيطالي لإعادة البريق للأرضيات.",
    seo_keywords: "جلي رخام بالرياض, تلميع رخام بالرياض, جلي بلاط بالرياض, تلميع سيراميك بالرياض",
    seo_slug: "جلي-وتلميع-رخام-بالرياض"
  },
  {
    id: 9,
    title: "تنظيف واجهات المباني والمكاتب",
    description: "غسيل الواجهات الزجاجية والكلادينج وعقود نظافة دورية للمكاتب والمؤسسات التجارية بالرياض بأسعار تنافسية.",
    icon: "Briefcase",
    image_url: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=800",
    order: 9,
    is_active: 1,
    seo_enabled: 1,
    seo_title: "تنظيف واجهات زجاجية ومكاتب بالرياض | عقود شركات",
    seo_description: "شركة تنظيف واجهات زجاج وكلادينج بالرياض. عمالة مدربة وعقود دورية لنظافة المكاتب والشركات والمؤسسات.",
    seo_keywords: "تنظيف واجهات زجاج بالرياض, تنظيف كلادينج الرياض, عقود نظافة شركات, تنظيف مكاتب بالرياض",
    seo_slug: "تنظيف-واجهات-زجاجية-ومكاتب-بالرياض"
  },
  {
    id: 10,
    title: "تنظيف بعد البناء والتشطيب",
    description: "إزالة بقايا الإسمنت، الدهانات، والترويبة وتلميع كامل للأرضيات والشبابيك لتسليم العقار جاهزاً للسكن الفوري.",
    icon: "HardHat",
    image_url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=800",
    order: 10,
    is_active: 1,
    seo_enabled: 1,
    seo_title: "تنظيف بعد التشطيب والبناء بالرياض | إزالة الإسمنت والدهان",
    seo_description: "شركة تنظيف بعد البناء والتشطيب بالرياض. إزالة الآثار الإنشائية والإسمنت وتلميع المبنى للتسليم السكني.",
    seo_keywords: "تنظيف بعد التشطيب بالرياض, شركة تنظيف بعد البناء الرياض, إزالة الإسمنت من البلاط, تنظيف مباني جديدة",
    seo_slug: "تنظيف-بعد-البناء-والتشطيب-بالرياض"
  }
];

const insertSvc = db.prepare(`
  INSERT INTO services (
    id, title, description, icon, image_url, "order", is_active,
    seo_enabled, seo_title, seo_description, seo_keywords, seo_slug
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?
  ) ON CONFLICT(id) DO UPDATE SET
    title = excluded.title,
    description = excluded.description,
    icon = excluded.icon,
    image_url = excluded.image_url,
    "order" = excluded."order",
    is_active = excluded.is_active,
    seo_enabled = excluded.seo_enabled,
    seo_title = excluded.seo_title,
    seo_description = excluded.seo_description,
    seo_keywords = excluded.seo_keywords,
    seo_slug = excluded.seo_slug
`);

for (const s of OFFICIAL_SERVICES) {
  insertSvc.run(
    s.id, s.title, s.description, s.icon, s.image_url, s.order, s.is_active,
    s.seo_enabled, s.seo_title, s.seo_description, s.seo_keywords, s.seo_slug
  );
}

console.log("✅ Services table cleaned and 10 official services set!");
db.close();
