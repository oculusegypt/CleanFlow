import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { ServicesSection } from "@/components/home/ServicesSection"
import { useDocumentSEO } from "@/hooks/useDocumentSEO"
import { siteUrl } from "@/lib/siteUrl"
import { Link } from "wouter"
import { ChevronLeft } from "lucide-react"

export default function ServicesPage() {
  useDocumentSEO({
    title: "خدمات التنظيف بالرياض | السهم كلين",
    description: "استعرض خدمات السهم كلين للتنظيف بالرياض: تنظيف المنازل والفلل والقصور، جلي الرخام، غسيل المكيفات، المجالس بالبخار والخزانات.",
    keywords: "خدمات التنظيف بالرياض, تنظيف منازل, تنظيف فلل, جلي رخام, غسيل مكيفات, تنظيف مجالس",
    canonical: siteUrl("/services"),
  })

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
      <Navbar />
      <div className="bg-primary text-white pt-28 pb-12 px-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
            <Link href="/" className="hover:text-white">الرئيسية</Link>
            <ChevronLeft size={14} />
            <span className="text-white">الخدمات</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black">خدمات التنظيف بالرياض</h1>
          <p className="text-white/75 mt-3 text-lg max-w-3xl leading-relaxed">
            حلول تنظيف متخصصة للمنازل والفلل والمنشآت، ينفذها فريق السهم كلين بمواعيد واضحة وخدمة موثوقة.
          </p>
        </div>
      </div>
      <main className="flex-1">
        <ServicesSection />
      </main>
      <Footer />
    </div>
  )
}