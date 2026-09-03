import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { AboutSection } from "@/components/home/AboutSection"
import { WhyChooseUs } from "@/components/home/WhyChooseUs"
import { ValuesSection } from "@/components/home/ValuesSection"
import { CEOMessage } from "@/components/home/CEOMessage"
import { useDocumentSEO } from "@/hooks/useDocumentSEO"
import { siteUrl } from "@/lib/siteUrl"
import { Link } from "wouter"
import { ChevronLeft, ShieldCheck, Award, Users, Clock, Phone, MessageCircle } from "lucide-react"
import { useSiteSettings } from "@/context/SiteSettingsContext"

export default function AboutPage() {
  const { companyName, phoneCall, phoneWhatsapp } = useSiteSettings()
  const resolvedCompany = companyName || "خدمات التنظيف"

  useDocumentSEO({
    title: companyName ? `من نحن — ${companyName} لخدمات التنظيف بالرياض` : "من نحن — خدمات التنظيف بالرياض | خبرة وعناية",
    description: `تعرف على مؤسسة تنظيف محلية في الرياض تقدم خدمات العناية بالمنازل والفلل والمكاتب والمنشآت بفريق مدرب واهتمام بالتفاصيل.`,
    keywords: `من نحن, شركة تنظيف بالرياض, تنظيف منازل وفلل, تنظيف مكاتب`,
    canonical: siteUrl("/about"),
  })

  const waHref = `https://wa.me/966${(phoneWhatsapp || "0554498403").replace(/^0/, "")}?text=${encodeURIComponent("مرحباً، أود الاستفسار عن خدمات التنظيف")}`

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans" dir="rtl">
      <Navbar />

      {/* Hero */}
      <div className="pt-28 pb-16 bg-gradient-to-l from-slate-950 via-primary to-slate-900 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-2 text-white/70 text-sm mb-4">
            <Link href="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <ChevronLeft size={14} />
            <span className="text-secondary font-semibold">من نحن</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black leading-tight text-white mb-4">
            عن {resolvedCompany}
          </h1>
          <p className="text-slate-200 text-lg md:text-xl max-w-3xl leading-relaxed">
            نقدم خدمات تنظيف عملية للمنازل والفلل والشقق والمكاتب والمنشآت في الرياض، مع تنسيق واضح وعناية بالمكان من بداية الطلب حتى التسليم.
          </p>
        </div>
      </div>

      <main className="flex-1">
        {/* E-E-A-T Trust Badges */}
        <section className="py-12 bg-white border-b border-slate-200/80">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-1">تنظيف منظم وآمن</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">نرتب خطوات العمل ونستخدم أدوات ومواد مناسبة لطبيعة كل مساحة.</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-amber-400/20 text-amber-600 shrink-0">
                  <Award size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-1">خدمات مرنة</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">ننسق نطاق التنظيف وموعده حسب نوع العقار والمساحة واحتياج العميل.</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600 shrink-0">
                  <Users size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-1">أسطول وسائقون محترفون</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">أسطول شاحنات مجهز بالكامل وسائقون على دراية تامة بكافة مخططات وأحياء الرياض.</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-sky-100 text-sky-600 shrink-0">
                  <Clock size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-1">توصيل فوري 24/7</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">سرعة وصول وسحب خلال ساعتين لجميع أحياء شمال وشرق وغرب وجنوب ووسط الرياض.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <AboutSection />
        <WhyChooseUs />
        <ValuesSection />
        <CEOMessage />

        {/* Contact Strip */}
        <section className="py-16 bg-slate-900 text-white">
          <div className="container mx-auto px-4 md:px-6 text-center space-y-6 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold">هل تحتاج إلى باقة التنظيف لمشروعك في الرياض؟</h2>
            <p className="text-slate-300 text-base">
              تواصل مع فريق {resolvedCompany} لتحديد المقاس الأنسب والتوصيل الفوري لموقعك.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a
                href={`tel:${phoneCall || "0554498403"}`}
                className="inline-flex items-center gap-2 bg-white text-slate-950 px-8 py-3.5 rounded-xl font-bold hover:bg-secondary hover:text-white transition shadow-lg"
              >
                <Phone size={18} /> {phoneCall || "0554498403"}
              </a>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-bold transition shadow-lg"
              >
                <MessageCircle size={18} /> واتساب مباشر
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
