import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dbPath = process.env.DB_PATH || path.join(rootDir, "data", "sabaik.db");
const require = createRequire(path.join(rootDir, "lib", "db", "package.json"));
const Database = require("better-sqlite3");
const db = new Database(dbPath);

const packages = [
  {
    name: "باقة التقرير الفني غير الفوري",
    category: "fire_safety",
    size: "دراسة بيانات ومخططات المنشأة",
    capacity: "معاينة مجدولة + تقرير فني شامل",
    description: "إعداد تقرير فني مجدول بعد دراسة بيانات المنشأة ومخططاتها ونطاق الملاحظات المطلوبة، مع تنسيق موعد المعاينة وتسليم التقرير.",
    features: [
      "مراجعة بيانات المنشأة والمخططات قبل المعاينة",
      "تحديد نطاق الملاحظات والمخرجات المطلوبة",
      "تنسيق موعد معاينة مناسب مع فريق العمل",
      "إعداد وتسليم تقرير فني منظم",
    ],
    suitableFor: "المنشآت والمشاريع التي لديها موعد مخطط وتحتاج دراسة دقيقة قبل التسليم",
    priceText: "طلب عرض سعر حسب نطاق التقرير",
    priceNote: "يحدد السعر والمدة بعد مراجعة البيانات ونطاق المعاينة",
    rentalPeriod: "موعد مجدول حسب توفر الفريق",
    imageUrl: "/api/uploads/1786852497754-e23a365fc223.webp",
    order: 16,
    seoTitle: "إعداد تقرير فني غير فوري بالرياض | تقرير سلامة مجدول",
    seoDescription: "إعداد تقرير فني غير فوري للمنشآت بالرياض بعد دراسة البيانات والمخططات وتنسيق موعد المعاينة وتسليم التقرير.",
    seoKeywords: "تقرير فني غير فوري بالرياض, تقرير سلامة منشأة, تقرير فني مجدول, تقرير دفاع مدني",
    seoSlug: "taqreer-fanni-ghayr-fawri-riyadh",
  },
  {
    name: "باقة عقد صيانة أنظمة السلامة مع تفعيل دفاع مدني",
    category: "fire_safety",
    size: "شهري / ربع سنوي / سنوي",
    capacity: "زيارات دورية + تقارير صيانة + متابعة التفعيل",
    description: "عقود صيانة دورية لأنظمة الوقاية والحماية من الحريق مع متابعة الزيارات والتقارير وطلب تفعيل خدمة دفاع مدني حسب أهلية المنشأة والإجراءات الرسمية.",
    features: [
      "جدولة زيارات صيانة دورية لأنظمة السلامة",
      "فحص تشغيلي وتوثيق حالة الأنظمة",
      "إصدار تقارير الزيارات والملاحظات",
      "متابعة طلب تفعيل خدمة دفاع مدني حسب الأهلية والإجراءات الرسمية",
    ],
    suitableFor: "المكاتب والمطاعم والمصانع والمستودعات والمجمعات والمدارس والمنشآت التجارية",
    priceText: "طلب عرض عقد بعد المعاينة",
    priceNote: "تحدد الخطة والتكلفة حسب نوع المنشأة وأنظمتها وعدد الزيارات",
    rentalPeriod: "عقد دوري حسب احتياج المنشأة",
    imageUrl: "/api/uploads/1786852526916-f43fb6a35802.webp",
    order: 17,
    seoTitle: "عقد صيانة أنظمة السلامة بالرياض | تفعيل دفاع مدني",
    seoDescription: "عقد صيانة دوري لأنظمة الوقاية والحماية من الحريق بالرياض مع زيارات وتقارير ومتابعة طلب تفعيل دفاع مدني حسب أهلية المنشأة.",
    seoKeywords: "عقد صيانة دفاع مدني بالرياض, صيانة أنظمة الحريق, عقد صيانة السلامة, تفعيل دفاع مدني",
    seoSlug: "aqd-siyana-difaa-madani-riyadh",
  },
];

const insert = db.prepare(`
  INSERT INTO packages (
    name, category, size, capacity, description, features, suitable_for,
    price_text, price_note, rental_period, contact_phone1, contact_phone2,
    price_per_day, discount_percent, original_price, sale_price,
    sale_price_expires_at, discount_label, image_url, images, "order", is_active,
    seo_enabled, seo_title, seo_description, seo_keywords, seo_slug
  ) VALUES (
    @name, @category, @size, @capacity, @description, @features, @suitableFor,
    @priceText, @priceNote, @rentalPeriod, @contactPhone1, @contactPhone2,
    0, 0, 0, 0, '', '', @imageUrl, @images, @order, 1,
    1, @seoTitle, @seoDescription, @seoKeywords, @seoSlug
  )
`);

const update = db.prepare(`
  UPDATE packages SET
    name = @name,
    category = @category,
    size = @size,
    capacity = @capacity,
    description = @description,
    features = @features,
    suitable_for = @suitableFor,
    price_text = @priceText,
    price_note = @priceNote,
    rental_period = @rentalPeriod,
    contact_phone1 = @contactPhone1,
    contact_phone2 = @contactPhone2,
    price_per_day = 0,
    discount_percent = 0,
    original_price = 0,
    sale_price = 0,
    sale_price_expires_at = '',
    discount_label = '',
    image_url = @imageUrl,
    images = @images,
    "order" = @order,
    is_active = 1,
    seo_enabled = 1,
    seo_title = @seoTitle,
    seo_description = @seoDescription,
    seo_keywords = @seoKeywords,
    seo_slug = @seoSlug
  WHERE seo_slug = @seoSlug
`);

const save = db.transaction(() => {
  for (const item of packages) {
    const params = {
      ...item,
      features: JSON.stringify(item.features),
      images: JSON.stringify([item.imageUrl]),
      contactPhone1: "0555888767",
      contactPhone2: "0580595555",
    };
    if (update.run(params).changes === 0) insert.run(params);
  }
});

save();

const saved = db.prepare(`
  SELECT id, name, category, "order", seo_slug
  FROM packages
  WHERE seo_slug IN (?, ?)
  ORDER BY "order"
`).all(...packages.map((item) => item.seoSlug));

console.log(`Saved ${saved.length} fire-safety packages in ${dbPath}`);
console.log(JSON.stringify(saved, null, 2));
db.close();