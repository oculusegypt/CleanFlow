import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { PackagesSection } from "@/components/home/PackagesSection"
import { useDocumentSEO } from "@/hooks/useDocumentSEO"
import { useSiteSettings } from "@/context/SiteSettingsContext"
import { siteUrl } from "@/lib/siteUrl"
import { Link, useRoute } from "wouter"
import { ChevronLeft, Sparkles } from "lucide-react"

export default function PackagesPage() {
  const { companyName } = useSiteSettings()
  const [, paramsApartments] = useRoute("/cleaning-packages/apartments")
  const [, paramsVillas] = useRoute("/cleaning-packages/villas")
  const [, paramsMajlis] = useRoute("/cleaning-packages/majlis")
  const [, paramsAc] = useRoute("/cleaning-packages/ac")
  const [, paramsSafety] = useRoute("/cleaning-packages/fire-safety")
  const [, paramsAny] = useRoute("/packages/:category")

  let category = "all"
  if (paramsApartments) category = "apartments"
  else if (paramsVillas) category = "villas"
  else if (paramsMajlis) category = "majlis"
  else if (paramsAc) category = "ac"
  else if (paramsSafety) category = "fire_safety"
  else if (paramsAny?.category) {
    if (paramsAny.category === "debris" || paramsAny.category === "أنقاض" || paramsAny.category === "باقات التنظيف-الأنقاض") category = "apartments"
    else if (paramsAny.category === "waste" || paramsAny.category === "نفايات" || paramsAny.category === "باقات التنظيف-النفايات") category = "villas"
    else if (paramsAny.category === "contract" || paramsAny.category === "contracts" || paramsAny.category === "عقود-النظافة") category = "facilities"
    else if (paramsAny.category === "fire-safety" || paramsAny.category === "fire_safety") category = "fire_safety"
  }

  const brandSuffix = companyName ? ` | ${companyName}` : " | شركة تنظيف بالرياض"

  const META_BY_CAT: Record<string, { title: string; desc: string; keywords: string; heading: string; sub: string; icon: any }> = {
    debris: {
      title: `تنظيف الشقق والمنازل بالرياض${brandSuffix}`,
      desc: "خدمات تنظيف الشقق والمنازل بالرياض مع تنظيف عميق وتطهير شامل ومعاينة سريعة.",
      keywords: "تنظيف شقق بالرياض, تنظيف منازل الرياض, شركة تنظيف بالرياض",
      heading: "باقات تنظيف المنازل والمنشآت بالرياض",
      sub: "خدمات تنظيف متخصصة للمنازل والفلل والمجالس والمكاتب مع معاينة وتأكيد سريع.",
      icon: Sparkles
    },
    waste: {
      title: `تنظيف الفلل والقصور بالرياض${brandSuffix}`,
      desc: "تنظيف الفلل والقصور بالرياض لجميع الأدوار والأحواش والواجهات والأثاث.",
      keywords: "تنظيف فلل بالرياض, تنظيف قصور الرياض, شركة تنظيف فلل",
      heading: "تنظيف الفلل والقصور والمجمعات",
      sub: "تنظيف عميق شامل للأدوار والأحواش والواجهات والأثاث.",
      icon: Sparkles
    },
    contract: {
      title: `غسيل المجالس والكنب بالبخار بالرياض${brandSuffix}`,
      desc: "غسيل المجالس والكنب بالبخار بالرياض مع التعقيم والتجفيف السريع.",
      keywords: "غسيل مجالس بالرياض, تنظيف كنب بالبخار, تنظيف سجاد الرياض",
      heading: "غسيل المجالس والكنب بالبخار",
      sub: "بخار حراري وتعقيم وتجفيف سريع للمجالس والكنب والسجاد.",
      icon: Sparkles
    },
    all: {
      title: `باقات التنظيف بالرياض${brandSuffix}`,
      desc: "استعرض باقات التنظيف المتخصصة للمنازل والفلل والمجالس والمكيفات والمنشآت بالرياض.",
      keywords: "باقات تنظيف بالرياض, أسعار خدمات التنظيف, شركة تنظيف منازل وفلل",
      heading: "جميع باقات وخدمات التنظيف",
      sub: "اختر الخدمة المناسبة لمنزلك أو منشأتك وسنتواصل معك لتأكيد التفاصيل.",
      icon: Sparkles
    },
    fire_safety: {
      title: `باقات السلامة والدفاع المدني بالرياض${brandSuffix}`,
      desc: "باقات تجهيز ملفات السلامة وتركيب أنظمة الحماية والتقارير الفنية والصيانة الدورية بالرياض.",
      keywords: "باقات السلامة بالرياض, الدفاع المدني, شهادة سلامة, أنظمة الحريق",
      heading: "باقات السلامة والدفاع المدني",
      sub: "خمس باقات متخصصة تبدأ من تجهيز الملف والمعاينة حتى التركيب والتقارير والصيانة.",
      icon: Sparkles
    }
  }

  const currentMeta = META_BY_CAT[category] || META_BY_CAT.all
  const IconComp = currentMeta.icon

  useDocumentSEO({
    title: currentMeta.title,
    description: currentMeta.desc,
    keywords: currentMeta.keywords,
    canonical: siteUrl(category === "all" ? "/cleaning-packages" : `/cleaning-packages/${category}`),
  })

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
      <Navbar />

      {/* Hero */}
      <div className="bg-primary text-white pt-28 pb-14 px-4 relative overflow-hidden">
        <div className="container mx-auto relative z-10">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
            <Link href="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <ChevronLeft size={14} />
            <Link href="/cleaning-packages" className="hover:text-white transition-colors">باقات التنظيف</Link>
            {category !== "all" && (
              <>
                <ChevronLeft size={14} />
                <span className="text-secondary font-bold">{currentMeta.heading}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary">
              <IconComp size={22} />
            </div>
            <h1 className="text-2xl md:text-4xl font-black">{currentMeta.heading}</h1>
          </div>
          <p className="text-white/80 mt-2 text-base md:text-lg max-w-2xl leading-relaxed">{currentMeta.sub}</p>
        </div>
      </div>

      <main className="flex-1">
        <PackagesSection initialCategory={category} />
      </main>

      <Footer />
    </div>
  )
}
