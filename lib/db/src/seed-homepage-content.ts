import { db } from "./index";
import { siteSettingsTable } from "./schema/settings";
import { eq } from "drizzle-orm";

export const homepageContent = {
  about: {
    eyebrow: "من نحن",
    title: "شريكك الموثوق في",
    highlight: "خدمات التنظيف",
    description: "نقدم خدمات تنظيف متخصصة للمنازل والفلل والشقق والمكاتب والمنشآت في مدينة الرياض، مع عناية دقيقة بالتفاصيل وتنسيق واضح للموعد.",
    visionTitle: "رؤيتنا",
    visionDescription: "أن نقدم تجربة تنظيف موثوقة ونتيجة واضحة تلائم احتياج كل عميل.",
    missionTitle: "رسالتنا",
    missionDescription: "تنفيذ خدمات تنظيف احترافية بمواد ومعدات مناسبة وبفريق ملتزم.",
    points: [
      "فريق مدرب لتنفيذ أعمال التنظيف باحترافية",
      "معدات ومواد مناسبة لكل نوع من أعمال النظافة",
      "التزام بالمواعيد وتفاصيل الطلب",
      "خيارات تنظيف مرنة للمنازل والمنشآت",
    ],
    imageUrl: "/images/service-villas.jpg",
    statValue: "8+",
    statLabel: "سنوات من الخبرة في خدمات التنظيف",
  },
  why: {
    titlePrefix: "لماذا تختار",
      titleHighlight: "التنظيف بالرياض؟",
    description: "نلتزم بأعلى معايير الجودة والموثوقية، مع توفير خدمات تنظيف مناسبة للمنازل والفلل والمكاتب والمنشآت.",
    points: [
      "سرعة الاستجابة والتوصيل الفوري 24/7",
      "تنظيف متخصص للمنازل والفلل والمكاتب",
      "أدوات ومواد مناسبة لكل سطح ومساحة",
      "مواعيد مرنة واستجابة سريعة",
      "أسعار واضحة بعد فهم احتياج المكان",
      "فريق مدرب وعناية بممتلكات العميل",
      "متابعة جودة الخدمة بعد التنفيذ",
    ],
    imageUrl: "/images/service-facilities.jpg",
    badgeValue: "✓",
    badgeTitle: "شريك معتمد وموثوق",
    badgeDescription: "خدمة 24 ساعة بالرياض",
  },
  how: {
    eyebrow: "طريقة العمل",
    title: "اطلب خدمة التنظيف في 4 خطوات بسيطة",
    description: "عملية حجز واضحة تبدأ بتحديد الخدمة وتنتهي بتنفيذ التنظيف في الموعد المناسب.",
    steps: [
      { number: "01", title: "اختر الخدمة", subtitle: "الخيار المناسب لمكانك", description: "استعرض خدمات التنظيف واختر النوع الأقرب إلى احتياج المنزل أو المنشأة." },
      { number: "02", title: "أرسل التفاصيل", subtitle: "بيانات المكان والطلب", description: "اذكر نوع العقار والمساحة وأي ملاحظات تساعد الفريق على تجهيز الخدمة." },
      { number: "03", title: "نسق الموعد", subtitle: "زيارة في الوقت المناسب", description: "حدد موقع التنفيذ والموعد المناسب، وسيتواصل معك الفريق لتأكيد التفاصيل." },
      { number: "04", title: "تابع النتيجة", subtitle: "من الطلب حتى الإنجاز", description: "نبقى على تواصل معك حتى اكتمال أعمال التنظيف وتسليم المكان." },
    ],
    ctaText: "اطلب خدمة تنظيف الآن",
    footnote: "نخدم المناطق التي تغطيها المؤسسة داخل الرياض.",
  },
  areas: {
    eyebrow: "نطاق التغطية",
    title: "خدمات التنظيف في",
    highlight: "مناطق الرياض",
    description: "تعرّف على المناطق التي تغطيها خدمات التنظيف واختر منطقتك لمعرفة التفاصيل.",
    items: [
      { slug: "north-riyadh", name: "شمال الرياض", description: "الملقا، النرجس، الياسمين، الصحافة، حطين، العارض، القيروان." },
      { slug: "east-riyadh", name: "شرق الرياض", description: "الروضة، النسيم، المونسية، الرمال، القادسية، قرطبة، اليرموك." },
      { slug: "west-riyadh", name: "غرب الرياض", description: "لبن، طويق، ظهرة لبن، السويدي، العريجاء، البديعة." },
      { slug: "south-riyadh", name: "جنوب الرياض", description: "الشفا، بدر، العزيزية، الدار البيضاء، المصانع، نمار." },
      { slug: "central-riyadh", name: "وسط الرياض", description: "الملز، البطحاء، المربع، العليا، السليمانية، الديرة." },
      { slug: "al-diriyah", name: "الدرعية والضواحي", description: "الدرعية، العمارية، صلبوخ، والمناطق المجاورة." }
    ],
    missingText: "هل موقعك خارج هذه القوائم؟",
    phonePrefix: "اتصل بنا مباشرة على",
    phoneSuffix: "لتأكيد التوصيل لموقعك فوراً.",
  },
  sections: {
    services: {
      eyebrow: "خدماتنا المتميزة",
      title: "خدمات متكاملة في",
      highlight: "التنظيف المتخصصة",
      description: "خدمات تنظيف للمنازل والفلل والشقق والمكاتب والمنشآت، تنفذ حسب طبيعة المكان واحتياج العميل.",
      detailsLabel: "تفاصيل الخدمة",
    },
    packages: {
      title: "باقات التنظيف",
      highlight: "المتاحة",
      description: "اختر الباقة المناسبة لنوع المكان ونطاق أعمال النظافة المطلوبة.",
    },
    values: {
      title: "قيمنا وركائزنا",
      description: "مبادئنا الثابتة في الالتزام بالمواعيد والجودة والامتثال لمعايير السلامة والبيئة.",
    },
    testimonials: {
      title: "آراء وتقييمات العملاء",
      description: "ثقة كبرى شركات المقاولات وأصحاب المشاريع والمنشآت في خدماتنا.",
    },
    blog: {
      eyebrow: "المدونة المعرفية",
      title: "دليل ومقالات التنظيف",
      description: "إرشادات عملية ونصائح لاختيار خدمات التنظيف والعناية بالمكان في الرياض.",
      allArticles: "استعراض جميع المقالات",
    },
    contact: {
      title: "هل تحتاج إلى استشارة أو عرض سعر مخصص؟",
      description: "فريقنا متواجد على مدار الساعة للرد على استفساراتك وتلبية طلباتك.",
      whatsappText: "تواصل عبر واتساب (0558606020)",
      callText: "اتصال هاتفي مباشر (0558606020)",
    },
  },
};

const settings = [
  ["site_desc", "مؤسسة السهم كلين لخدمات التنظيف بالرياض: تنظيف المنازل والفلل والشقق والمكاتب، والتنظيف بعد البناء، وغسيل المجالس والسجاد بخبرة وفريق متخصص."],
  ["company_name", "مؤسسة السهم كلين"],
  ["company_phone_call", "0554498403"],
  ["company_phone_whatsapp", "0554498403"],
  ["company_phones", JSON.stringify(["0554498403"])],
  ["company_footer_description", "مؤسسة السهم كلين تقدم خدمات تنظيف للمنازل والفلل والمكاتب والمنشآت في الرياض بعناية ووضوح والتزام بالمواعيد."],
  ["homepage_content", JSON.stringify(homepageContent)],
  ["sections_order", JSON.stringify([
    "hero",
    "stats",
    "services",
    "packages",
    "about",
    "ceo",
    "how_it_works",
    "why_choose_us",
    "areas",
    "values",
    "testimonials",
    "partners",
    "blog",
    "service_request",
    "contact",
  ])],
  ["sections_hidden", "[]"],
] as const;

for (const [key, value] of settings) {
  const existing = db.select().from(siteSettingsTable).where(eq(siteSettingsTable.key, key)).get();
  if (existing) {
    db.update(siteSettingsTable)
      .set({ value, updatedAt: new Date().toISOString() })
      .where(eq(siteSettingsTable.key, key))
      .run();
  } else {
    db.insert(siteSettingsTable).values({ key, value }).run();
  }
}

console.log("Homepage content and section order updated for Taqi Group.");