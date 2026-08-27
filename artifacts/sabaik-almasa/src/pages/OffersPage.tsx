import { useDocumentSEO } from "@/hooks/useDocumentSEO"
import { siteUrl } from "@/lib/siteUrl"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { OffersSection } from "@/components/home/OffersSection"

export default function OffersPage() {
  useDocumentSEO({
    title: "عروض التنظيف الموسمية بالرياض | السهم كلين",
    description: "اكتشف عروض السهم كلين الموسمية على خدمات وباقات التنظيف بالرياض واحجز عرضك لفترة محدودة.",
    keywords: "عروض تنظيف بالرياض, خصومات تنظيف, عروض موسمية, باقات تنظيف مخفضة",
    canonical: siteUrl("/offers"),
  })
  return <div dir="rtl" className="min-h-screen bg-white"><Navbar /><main className="pt-20"><OffersSection /></main><Footer /></div>
}