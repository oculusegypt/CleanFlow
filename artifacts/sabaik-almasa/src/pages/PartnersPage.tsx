import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Partners } from "@/components/home/Partners"
import { Testimonials } from "@/components/home/Testimonials"
import { useDocumentSEO } from "@/hooks/useDocumentSEO"
import { siteUrl } from "@/lib/siteUrl"
import { Link } from "wouter"
import { ChevronLeft } from "lucide-react"

export default function PartnersPage() {
  useDocumentSEO({
    title: "شركاؤنا — شركة التنظيف لخدمات التنظيف",
    description: "شركاء النجاح في شركة التنظيف. نفخر بشراكاتنا مع كبرى المجمعات السكنية والشركات بالرياض لتقديم خدمات تنظيف وتطهير متكاملة.",
    keywords: "شركاء شركة التنظيف, شركاء خدمات التنظيف بالرياض",
    canonical: siteUrl("/partners/"),
  })

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
      <Navbar />

      {/* Hero */}
      <div className="bg-primary text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
            <Link href="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <ChevronLeft size={14} />
            <span className="text-white">شركاؤنا</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black">شركاؤنا</h1>
          <p className="text-white/70 mt-2 text-lg">نفخر بثقة شركائنا وعملائنا</p>
        </div>
      </div>

      <main className="flex-1">
        <Partners />
        <Testimonials />
      </main>

      <Footer />
    </div>
  )
}
