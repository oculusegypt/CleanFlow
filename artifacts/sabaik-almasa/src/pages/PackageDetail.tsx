import { useEffect, useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { useDocumentSEO } from "@/hooks/useDocumentSEO"
import { Link, useRoute } from "wouter"
import { ChevronLeft, Check, Phone, MessageCircle, Package } from "lucide-react"
import { useGetPackages } from "@workspace/api-client-react"
import type { CleaningPackage } from "@workspace/api-client-react"
import { ServiceRequestForm } from "@/components/home/ServiceRequestForm"
import { useServiceRequest } from "@/context/ServiceRequestContext"
import { resolveServiceTypeFromCleaningPackage, getCleaningPackageImage, ARABIC_CATEGORY_NAMES } from "@/components/home/packages/PackageCard"
import { siteUrl } from "@/lib/siteUrl"
import { getPackageRouteSlug } from "@/lib/packageRoute"
import { resolveContactNumbers, useSiteSettings } from "@/context/SiteSettingsContext"

/** Convert container name+size to a URL slug (mirrors the old site's pattern) */
function toSlug(text: string): string {
  return text
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, "")
}

/** Find a container by URL slug — tries multiple matching strategies */
function findCleaningPackage(containers: CleaningPackage[], slug: string): CleaningPackage | undefined {
  const s = decodeURIComponent(slug).toLowerCase()
  return containers.find(c => {
    const namePart  = toSlug(c.name).toLowerCase()
    const sizePart  = c.size ? toSlug(c.size).toLowerCase() : ""
    const combined  = toSlug(`${c.name}-${c.size}`).toLowerCase()
    const seoSlug   = String((c as CleaningPackage & { seoSlug?: string }).seoSlug || "").toLowerCase()
    const routeSlug = getPackageRouteSlug(c).toLowerCase()
    return (
      s === namePart ||
      s === sizePart ||
      s === combined ||
      s === seoSlug ||
      s === routeSlug ||
      // partial match: slug contains a number from the size (e.g. "20" in "باقات التنظيف-20-ياردة")
      (sizePart && s.replace(/-/g, "").includes(sizePart.replace(/-/g, "")))
    )
  })
}

function sanitizePackageText(value: string): string {
  return value
    .replace(/(?:تبدأ|يبدأ)\s+من\s+[\d,]+\s*(?:ر\.س|ريال)/g, "يُحدد بعد مراجعة تفاصيل الموقع")
    .replace(/\d{1,3}\s*(?:—|-|إلى)\s*\d{1,3}\s*دقيقة/g, "حسب الموعد والتوفر")
    .replace(/\d{1,3}\s*دقيقة/g, "حسب الموعد والتوفر")
    .replace(/(?:معاينة|عرض سعر|عروض أسعار)\s+(?:ميدانية\s+)?(?:ال)?مجاني(?:ة)?/g, "معاينة أو عرض حسب تفاصيل الطلب")
    .replace(/ضمان(?:اً|ا)?\s+(?:كامل|شامل|معتمد)(?:اً|ا)?(?:\s+100%)?/g, "وفق نطاق العمل المتفق عليه")
    .replace(/(?:أحدث|العالمية)\s+(?:المعدات|الأجهزة|ماكينات)/g, "الأدوات المناسبة")
    .replace(/(?:مصرحة|معتمدة|مطابقة للاشتراطات الصحية)/g, "مناسبة للاستخدام")
    .replace(/\b(?:140°|150 بار|3000 واط)\b/g, "حسب نوع الخدمة")
}

export default function PackageDetail() {
  const [, cleaningPackageParams] = useRoute("/cleaning-packages/:slug")
  const [, containerParams] = useRoute("/container/:slug")
  const slug = cleaningPackageParams?.slug || containerParams?.slug || ""
  const { data: apiCleaningPackages } = useGetPackages()
  const [container, setCleaningPackage] = useState<CleaningPackage | null>(null)
  const { openModal } = useServiceRequest()
  const { phoneCall, phoneWhatsapp, phones, companyName } = useSiteSettings()

  useEffect(() => {
    if (!apiCleaningPackages?.length) return
    const found = findCleaningPackage(apiCleaningPackages, slug)
    setCleaningPackage(found ?? null)
  }, [apiCleaningPackages, slug])

  const { call: callNumber, whatsapp: whatsappNumber } = resolveContactNumbers(phoneCall, phoneWhatsapp, phones)
  const packageCanonical = siteUrl(`/cleaning-packages/${slug}`)
  const packageDescription = container?.description
    ? sanitizePackageText(container.description)
    : "تفاصيل باقات تنظيف المنازل والفلل بالرياض حسب نوع العقار ونطاق العمل."
  const waHref = container && whatsappNumber
    ? `https://wa.me/966${whatsappNumber.replace(/^0/, "")}?text=${encodeURIComponent(`أريد الاستفسار عن ${container.name}`)}`
    : "#"

  useDocumentSEO({
    title: container
      ? `${container.name}${container.size ? ` ${container.size}` : ""}${companyName ? ` | ${companyName}` : ""}`
      : "تفاصيل الباقة — خدمات التنظيف",
    description: packageDescription,
    canonical: packageCanonical,
  })

  useEffect(() => {
    if (!container) return
    const id = "cleaning-package-schema"
    document.getElementById(id)?.remove()
    const script = document.createElement("script")
    script.id = id
    script.type = "application/ld+json"
    script.textContent = JSON.stringify([
      {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": container.name,
        "description": packageDescription,
        "url": packageCanonical,
        "inLanguage": "ar",
        "serviceType": (container.category && ARABIC_CATEGORY_NAMES[container.category]) || "خدمات تنظيف",
        "provider": {
          "@type": "LocalBusiness",
          "name": companyName || "خدمات التنظيف بالرياض",
          ...(callNumber ? { "telephone": `+966${callNumber.replace(/[^\d]/g, "").replace(/^0/, "")}` } : {}),
        },
        "areaServed": { "@type": "City", "name": "الرياض" },
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "الرئيسية", "item": siteUrl("/") },
          { "@type": "ListItem", "position": 2, "name": "باقات التنظيف", "item": siteUrl("/cleaning-packages") },
          { "@type": "ListItem", "position": 3, "name": container.name, "item": packageCanonical },
        ],
      },
    ])
    document.head.appendChild(script)
    return () => document.getElementById(id)?.remove()
  }, [container, packageCanonical, packageDescription, companyName, callNumber])

  if (!container && apiCleaningPackages) {
    // Not found — redirect to container listing
    return (
      <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-center px-4 py-20">
          <div>
            <p className="text-gray-500 text-lg mb-4">الباقة غير موجودة</p>
            <Link href="/cleaning-packages" className="text-primary font-bold hover:underline">← عرض جميع باقات التنظيف</Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
      <Navbar />

      {/* Hero */}
      <div className="bg-primary text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
            <Link href="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <ChevronLeft size={14} />
            <Link href="/cleaning-packages" className="hover:text-white transition-colors">باقات التنظيف</Link>
            <ChevronLeft size={14} />
            <span className="text-white">{container?.name ?? "..."}</span>
          </div>
          {container?.category && (
            <div className="mb-2">
              <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-bold">
                {ARABIC_CATEGORY_NAMES[container.category] || container.category}
              </span>
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-black">
            {container ? `${container.name}${container.size ? ` — ${container.size}` : ""}` : "جارٍ التحميل..."}
          </h1>
          {container?.suitableFor && (
            <p className="text-white/70 mt-2 text-lg">مناسبة لـ: {container.suitableFor}</p>
          )}
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-12">
        {container && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
            {/* Image */}
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white aspect-video">
              <img
                src={getCleaningPackageImage(container)}
                alt={container.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Pricing depends on the actual size, quantity and requested scope. */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
                <p className="text-sm text-gray-500 mb-1">تفاصيل العرض</p>
                <p className="text-xl font-black text-primary">يُحدد بعد مراجعة تفاصيل الطلب</p>
                <p className="text-sm text-gray-600 mt-1">تواصل معنا لبيان النوع والحجم والكمية وتنسيق العرض المناسب.</p>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                {container.size && (
                  <div className="bg-white border border-gray-100 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">الحجم</p>
                    <p className="font-bold text-gray-800">{container.size}</p>
                  </div>
                )}
                {container.capacity && (
                  <div className="bg-white border border-gray-100 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">السعة</p>
                    <p className="font-bold text-gray-800">{container.capacity}</p>
                  </div>
                )}
                {container.rentalPeriod && (
                  <div className="bg-white border border-gray-100 rounded-xl p-4 col-span-2">
                    <p className="text-xs text-gray-400 mb-1">مدة الإيجار</p>
                    <p className="font-bold text-gray-800">{container.rentalPeriod}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {container.description && (
                <p className="text-gray-600 leading-relaxed">{packageDescription}</p>
              )}

              {/* Features */}
              {Array.isArray(container.features) && container.features.length > 0 && (
                <ul className="space-y-2">
                  {container.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700 text-sm">
                      <Check size={16} className="text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              {/* CTA buttons */}
              <div className="flex gap-3 flex-wrap pt-2">
                <button
                  onClick={() => openModal({
                    serviceType: resolveServiceTypeFromCleaningPackage(container),
                    packageSize: `${container.name}${container.size ? ` - ${container.size}` : ""}`,
                    containerName: container.name,
                  })}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-md"
                >
                  <Package size={18} /> اطلب الخدمة الآن
                </button>
                <a href={waHref} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-md">
                  <MessageCircle size={18} /> واتساب
                </a>
                {callNumber && (
                  <a href={`tel:${callNumber}`}
                    className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-primary px-6 py-3 rounded-xl font-bold transition-colors shadow-sm">
                    <Phone size={18} /> اتصال مباشر
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Request form */}
        <div className="border-t pt-10">
          <h2 className="text-2xl font-bold text-primary mb-6">أو أرسل طلبك مباشرة</h2>
          <ServiceRequestForm />
        </div>
      </main>

      <Footer />
    </div>
  )
}
