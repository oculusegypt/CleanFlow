import { useEffect } from "react"
import { useSiteSettings } from "@/context/SiteSettingsContext"
import { siteUrl } from "@/lib/siteUrl"
import { useDocumentSEO } from "@/hooks/useDocumentSEO"
import { Phone } from "lucide-react"

export default function CallNowPage() {
  const { companyName, phoneCall, isLoaded } = useSiteSettings()
  const phone = phoneCall || "0554498403"
  const href = `tel:${phone.replace(/[^\d+]/g, "")}`

  useDocumentSEO({
    title: "اتصل الآن | السهم كلين",
    description: "اتصل الآن بالسهم كلين لحجز خدمة تنظيف في الرياض والتحدث مباشرة مع فريق العمليات.",
    keywords: "اتصل الآن شركة تنظيف بالرياض, رقم شركة تنظيف بالرياض, حجز تنظيف",
    canonical: siteUrl("/اتصل-الآن"),
  })

  useEffect(() => {
    if (isLoaded) window.location.href = href
  }, [isLoaded, href])

  return (
    <main className="min-h-screen flex items-center justify-center bg-primary px-6 text-center text-white" dir="rtl">
      <div className="max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
          <Phone size={36} />
        </div>
        <h1 className="text-3xl font-black">جاري تحويلك للاتصال</h1>
        <p className="mt-4 text-white/75">سيتم فتح تطبيق الهاتف للاتصال بـ {companyName || "السهم كلين"}.</p>
        <a href={href} className="mt-8 inline-flex rounded-xl bg-secondary px-8 py-4 font-black text-white">
          اتصل الآن: <span dir="ltr" className="mr-2">{phone}</span>
        </a>
      </div>
    </main>
  )
}