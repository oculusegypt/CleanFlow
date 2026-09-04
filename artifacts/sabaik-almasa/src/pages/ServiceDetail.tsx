import { useEffect, useMemo, useState } from "react"
import { Link, useRoute } from "wouter"
import {
  ChevronLeft,
  MessageCircle,
  Phone,
  Settings,
  ShieldCheck,
  Clock,
  Sparkles,
  Award,
  CheckCircle2,
  HelpCircle,
  MapPin,
  Flame,
  ArrowLeft,
  Zap,
  Box,
  Truck,
  FileText,
  Layers,
} from "lucide-react"
import { useGetServices } from "@workspace/api-client-react"
import type { Service } from "@workspace/api-client-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { ServiceRequestForm } from "@/components/home/ServiceRequestForm"
import { useDocumentSEO } from "@/hooks/useDocumentSEO"
import { siteUrl } from "@/lib/siteUrl"
import { useSiteSettings } from "@/context/SiteSettingsContext"
import { buildLocalBusinessSchema } from "@/lib/structuredData"
import { RIYADH_AREA_GROUPS, AREAS, ARABIC_AREA_SLUGS } from "@/pages/NeighborhoodPage"
import { ServiceReviewsSection } from "@/components/reviews/ServiceReviewsSection"

function normalizeSlug(value: string): string {
  return decodeURIComponent(value).trim().toLowerCase()
}

function parseImages(raw: string | undefined, fallback?: string | null): string[] {
  try {
    const images = JSON.parse(raw || "[]")
    if (Array.isArray(images)) return images.filter((image): image is string => typeof image === "string" && image.length > 0)
  } catch {}
  return fallback ? [fallback] : []
}

function findService(services: Service[], slug: string): Service | undefined {
  const normalized = normalizeSlug(slug)
  if (!normalized) return undefined
  return services.find((service) => {
    const sSlug = normalizeSlug(service.seoSlug || "")
    const sTitle = normalizeSlug(service.title || "")
    const sId = String(service.id)
    return sSlug === normalized || sTitle === normalized || sId === normalized || (normalized.length > 3 && (sSlug.includes(normalized) || normalized.includes(sSlug) || sTitle.includes(normalized) || normalized.includes(sTitle)))
  })
}

function isKeywordSpam(text: string): boolean {
  if (/ , /.test(text)) return true
  const commaCount = (text.match(/,/g) || []).length
  const wordCount = text.split(/\s+/).filter(Boolean).length
  return wordCount > 0 && commaCount / wordCount > 0.25
}

function bodyDescription(service: Service): string {
  const raw = service.description?.trim() || ""
  if (!raw) return "خدمات تنظيف احترافية في الرياض — تواصل معنا لمعرفة التفاصيل."
  const segments = raw.split(/\.\s+/)
  const clean: string[] = []
  for (const seg of segments) {
    const trimmed = seg.replace(/\.$/, "").trim()
    if (!trimmed) continue
    if (isKeywordSpam(trimmed)) break
    clean.push(trimmed)
  }
  const result = clean.join(". ").trim()
  return result.length > 10 ? result : raw.split(/\.\s+/)[0] || raw
}

function metaDescription(service: Service): string {
  const seo = service.seoDescription?.trim()
  if (seo && !isKeywordSpam(seo)) return seo.slice(0, 160)
  return bodyDescription(service).slice(0, 160)
}

function sanitizeServiceText(value: string): string {
  return value
    .replace(/(?:تبدأ|يبدأ)\s+من\s+[\d,]+\s*(?:ر\.س|ريال)(?:\s*\/\s*(?:م²|للمكيف))?/g, "يُحدد بعد مراجعة تفاصيل الموقع")
    .replace(/\d{1,3}\s*(?:—|-|إلى)\s*\d{1,3}\s*دقيقة/g, "حسب الموعد والتوفر")
    .replace(/\d{1,3}\s*دقيقة/g, "حسب الموعد والتوفر")
    .replace(/(?:معاينة|عرض سعر|عروض أسعار)\s+(?:ميدانية\s+)?(?:ال)?مجاني(?:ة)?/g, "معاينة أو عرض حسب تفاصيل الطلب")
    .replace(/ضمان(?:اً|ا)?\s+(?:كامل|شامل|معتمد)(?:اً|ا)?(?:\s+100%)?/g, "وفق نطاق العمل المتفق عليه")
    .replace(/(?:أحدث|العالمية)\s+(?:المعدات|الأجهزة|ماكينات)/g, "الأدوات المناسبة")
    .replace(/ماكينات إيطالية/g, "معدات مناسبة")
    .replace(/(?:مصرحة|معتمدة|مطابقة للاشتراطات الصحية)/g, "مناسبة للاستخدام")
    .replace(/\b(?:140°|150 بار|3000 واط)\b/g, "حسب نوع الخدمة")
    .replace(/(?:تغطية كاملة لكافة|تغطية شاملة لجميع|جميع أحياء)\s+(?:أحياء ومناطق\s+)?الرياض/g, "الأحياء المدرجة في الرياض")
    .replace(/(?:وصول سريع|استجابة فورية|حجز فوري|عرض سعر فوري|اتصال فوري|تسليم فوري|تعقيم فوري|تجفيف فوري)/g, "تنسيق حسب الموعد")
}

// ── بيانات تفصيلية مساعدة لصفحات الخدمات ─────────────────────────────────────
const DEFAULT_SERVICE_INTEL = {
  equipment: ["أدوات تنظيف احترافية", "مواد مناسبة للأسطح المختلفة", "معدات بخار وتعقيم عند الحاجة", "معدات حماية للمفروشات والأرضيات"],
  processSteps: [
    { title: "فهم احتياج المكان", desc: "نراجع نوع العقار والمساحات والخدمة المطلوبة قبل تأكيد الموعد." },
    { title: "تجهيز الأدوات", desc: "يجهز الفريق الأدوات والمواد المناسبة لنوع السطح وحالة المكان." },
    { title: "تنفيذ التنظيف", desc: "ينفذ الفريق العمل بشكل منظم مع عناية بالأثاث والتفاصيل الصغيرة." },
    { title: "المراجعة والتسليم", desc: "نراجع النتيجة مع العميل ونتأكد من اكتمال الخدمة قبل المغادرة." }
  ],
  pricingFactors: [
    { factor: "مساحة المكان", detail: "تحدد المساحة وعدد الغرف والحمامات حجم الفريق والوقت اللازم." },
    { factor: "نوع الخدمة", detail: "يختلف العرض حسب التنظيف العام أو العميق أو البخار أو ما بعد التشطيب." },
    { factor: "حالة العقار", detail: "تساعدنا حالة المكان ووجود الأثاث على إعداد عرض دقيق وواضح." }
  ],
  faqs: [
    { q: "كيف أطلب خدمة تنظيف؟", a: "تواصل معنا عبر الهاتف أو واتساب، واذكر نوع العقار والمساحة والخدمة المطلوبة." },
    { q: "هل يمكن تحديد موعد مسبق؟", a: "نعم، ننسق الموعد المناسب حسب توفر الفريق وموقعك داخل الرياض." },
    { q: "هل تقدمون تنظيفاً للمنازل والمنشآت؟", a: "نخدم الشقق والفلل والمكاتب والمنشآت، ونقترح الباقة الأنسب بعد معرفة التفاصيل." }
  ]
}

const SERVICE_INTEL: Record<string, {
  equipment: string[]
  processSteps: { title: string; desc: string }[]
  pricingFactors: { factor: string; detail: string }[]
  faqs: { q: string; a: string }[]
}> = {}

export default function ServiceDetail({ rootSlug, lookupSlug }: { rootSlug?: string; lookupSlug?: string; params?: unknown } = {}) {
  const [, params] = useRoute("/services/:slug")
  const [, rootParams] = useRoute("/:slug")
  const slug = lookupSlug || rootSlug || (params?.slug ? decodeURIComponent(params.slug) : decodeURIComponent(rootParams?.slug || ""))
  const { data: services, isLoading } = useGetServices()
  const [service, setService] = useState<Service | null>(null)
  const siteSettings = useSiteSettings()
  const { phoneCall, phoneWhatsapp, companyName } = siteSettings

  useEffect(() => {
    if (!services) return
    setService(findService(services.filter((item) => item.isActive), slug) || null)
  }, [services, slug])

  const images = useMemo(
    () => service ? parseImages(service.images, service.imageUrl) : [],
    [service],
  )
  const resolvedCompany = companyName || ""
  const bodyText = service ? sanitizeServiceText(bodyDescription(service)) : (companyName ? `تعرف على خدمات ${companyName} للتنظيف في الرياض.` : "تعرف على خدمات التنظيف الاحترافية في الرياض.")
  const metaText = service ? sanitizeServiceText(metaDescription(service)) : (companyName ? `خدمات تنظيف احترافية في الرياض من ${companyName} للمنازل والفلل والمكاتب.` : "خدمات تنظيف احترافية في الرياض للمنازل والفلل والمكاتب.")
  const title = service ? (companyName ? `${service.seoTitle?.trim() || service.title} | ${companyName}` : (service.seoTitle?.trim() || service.title)) : (companyName ? `خدمات التنظيف بالرياض | ${companyName}` : "خدمات التنظيف بالرياض")
  const canonical = siteUrl(rootSlug
    ? `/${encodeURIComponent(rootSlug)}`
    : `/services/${encodeURIComponent(service?.seoSlug || slug)}`)

  const activeIntel = (service?.seoSlug && SERVICE_INTEL[service.seoSlug]) || DEFAULT_SERVICE_INTEL

  useDocumentSEO({
    title,
    description: metaText,
    keywords: service?.seoKeywords || `${service?.title || "خدمات التنظيف"}, تنظيف بالرياض, شركة تنظيف منازل بالرياض`,
    canonical,
    ogType: "website",
    ogImage: images[0] || "/images/service-apartments.jpg",
  })

  // Schema LD+JSON
  useEffect(() => {
    if (!service) return
    const schemaObj = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Service",
          "name": service.title,
          "description": metaText,
          "provider": buildLocalBusinessSchema(siteSettings, {
            description: metaText,
            areaServed: siteSettings.city
              ? { "@type": "City", name: siteSettings.city }
              : undefined,
          }),
          "areaServed": {
            "@type": "City",
            "name": siteSettings.city || "الرياض"
          }
        },
        {
          "@type": "FAQPage",
          "mainEntity": activeIntel.faqs.map(faq => ({
            "@type": "Question",
            "name": faq.q,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.a
            }
          }))
        }
      ]
    }

    const script = document.createElement("script")
    script.id = `service-schema-${service.id}`
    script.type = "application/ld+json"
    script.textContent = JSON.stringify(schemaObj)
    document.head.appendChild(script)

    return () => {
      document.getElementById(`service-schema-${service.id}`)?.remove()
    }
  }, [service, metaText, resolvedCompany, activeIntel, phoneCall, siteSettings])

  const waHref = `https://wa.me/966${(phoneWhatsapp || "0554498403").replace(/^0/, "")}?text=${encodeURIComponent(`مرحباً، أود الاستفسار عن خدمة ${service?.title || "الباقات التنظيف"}`)}`

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir="rtl">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900" dir="rtl">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-slate-800">الخدمة غير موجودة</h1>
            <p className="text-slate-500">لم يتم العثور على الخدمة المطلوبة أو تم تغيير الرابط.</p>
            <Link href="/" className="inline-block bg-primary text-white px-6 py-2.5 rounded-xl font-bold">
              العودة للرئيسية
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans" dir="rtl">
      <Navbar />

      {/* Hero Header */}
      <div className="pt-28 pb-16 bg-gradient-to-l from-slate-950 via-primary to-slate-900 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-2 text-white/70 text-sm mb-4">
            <Link href="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <ChevronLeft size={14} />
            <Link href="/services" className="hover:text-white transition-colors">الخدمات</Link>
            <ChevronLeft size={14} />
            <span className="text-secondary font-semibold">{service.title}</span>
          </div>

          <div className="max-w-3xl">
            <span className="inline-block bg-secondary/20 text-secondary border border-secondary/30 px-3 py-1 rounded-full text-xs font-bold mb-3">
              خدمة تنظيف في الرياض حسب نطاق التغطية
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight text-white mb-4">
              {service.title}
            </h1>
            <p className="text-slate-200 text-base md:text-lg leading-relaxed mb-6">
              {sanitizeServiceText(service.description || bodyText)}
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href={`tel:${phoneCall || "0554498403"}`}
                className="inline-flex items-center gap-2 bg-white text-slate-950 px-6 py-3 rounded-xl font-bold hover:bg-secondary hover:text-white transition shadow-lg text-sm"
              >
                <Phone size={16} /> اتصل بالعمليات
              </a>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg text-sm"
              >
                <MessageCircle size={16} /> تواصل عبر واتساب
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Main Column */}
            <div className="lg:col-span-2 space-y-10">

              {/* Service Images */}
              {images.length > 0 && (
                <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white">
                  <img
                    src={images[0]}
                    alt={`${service.title} بالرياض`}
                    className="w-full h-80 md:h-96 object-cover"
                  />
                </div>
              )}

              {/* Content Description Card */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 border-b pb-4">
                  تفاصيل خدمة {service.title}
                </h2>
                <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-base">
                  <p>{bodyText}</p>
                </div>

                <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <ShieldCheck className="text-primary" size={24} />
                    <span className="text-xs font-bold text-slate-800">نطاق عمل واضح قبل التنفيذ</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <Clock className="text-secondary" size={24} />
                     <span className="text-xs font-bold text-slate-800">تنسيق الموعد حسب التوفر</span>
                  </div>
                </div>
              </div>

              {/* Process Steps */}
              {activeIntel.processSteps && (
                <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900">
                    خطوات تنفيذ الخدمة
                  </h2>
                  <div className="space-y-4">
                    {activeIntel.processSteps.map((step, idx) => (
                      <div key={idx} className="flex gap-4 items-start p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm mb-1">{step.title}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Equipment & Fleet */}
              {activeIntel.equipment && (
                <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                  <h2 className="text-xl font-bold text-slate-900">
                    المعدات والأسطول المستخدم
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeIntel.equipment.map((eq, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700 p-2.5 rounded-xl bg-slate-50">
                        <CheckCircle2 size={16} className="text-secondary shrink-0" />
                        <span>{eq}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQs */}
              {activeIntel.faqs && (
                <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900">
                    الأسئلة الشائعة حول {service.title}
                  </h2>
                  <div className="space-y-4">
                    {activeIntel.faqs.map((faq, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <HelpCircle size={16} className="text-primary shrink-0" />
                          {faq.q}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed pr-6">
                          {faq.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <ServiceReviewsSection serviceId={service.id} serviceTitle={service.title} />

            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Quick Request Card */}
              <div className="bg-gradient-to-br from-primary to-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
                <h3 className="text-xl font-bold text-white">طلب الخدمة فوراً</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  تواصل معنا هاتفياً أو عبر واتساب لطلب الخدمة أو تحديد موعد المعاينة.
                </p>
                <div className="space-y-2 pt-2">
                  <a
                    href={`tel:${phoneCall || "0554498403"}`}
                    className="w-full py-3 bg-secondary hover:bg-secondary/90 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow"
                  >
                    <Phone size={14} /> اتصل الآن: {phoneCall || "0554498403"}
                  </a>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow"
                  >
                    <MessageCircle size={14} /> تواصل عبر واتساب
                  </a>
                </div>
              </div>

              {/* Other Services */}
              {services && services.length > 1 && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="text-base font-bold text-slate-900 mb-2">خدمات وباقات التنظيف أخرى</h3>
                  <div className="space-y-2">
                    {services.filter(s => s.id !== service.id && s.isActive).map(s => (
                      <Link
                        key={s.id}
                        href={`/services/${encodeURIComponent(s.seoSlug || String(s.id))}`}
                        className="block p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition group"
                      >
                        <h4 className="text-xs font-bold text-slate-800 group-hover:text-primary transition-colors flex items-center justify-between">
                          <span>{s.title}</span>
                          <ChevronLeft size={14} className="text-slate-400 group-hover:text-primary" />
                        </h4>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Areas Served */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-base font-bold text-slate-900 mb-2">تغطية أحياء الرياض</h3>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {Object.entries(AREAS).slice(0, 12).map(([slug, area]) => {
                    const arSlug = ARABIC_AREA_SLUGS[slug] || slug
                    return (
                      <Link
                        key={slug}
                        href={`/areas/${encodeURIComponent(arSlug)}`}
                        className="bg-slate-100 hover:bg-primary hover:text-white text-slate-700 px-2.5 py-1 rounded-lg transition"
                      >
                        {area.name}
                      </Link>
                    )
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Service Request Section */}
      <ServiceRequestForm />

      <Footer />
    </div>
  )
}