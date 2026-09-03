import React, { useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { useDocumentSEO } from "@/hooks/useDocumentSEO"
import { ChevronDown, HelpCircle, Phone, MessageCircle, Search } from "lucide-react"
import { useSiteSettings, resolveContactNumbers } from "@/context/SiteSettingsContext"
import { siteUrl } from "@/lib/siteUrl"
import { Link } from "wouter"

interface FAQItem {
  q: string
  a: string
  category: string
}

const FAQS: FAQItem[] = [
  {
    category: "عام",
    q: "كيف يتم تحديد تكلفة خدمة التنظيف؟",
    a: "يعتمد العرض على نوع الخدمة ومساحة المكان وعدد الغرف وحالة العقار والموعد المطلوب. نوضح التفاصيل قبل بدء العمل ولا نعتمد سعراً ثابتاً لا يناسب كل حالة."
  },
  {
    category: "عام",
    q: "ما المناطق التي تغطيها خدماتكم في الرياض؟",
    a: "نخدم مناطق متعددة في شمال وجنوب وشرق وغرب ووسط الرياض. تواصل معنا للتأكد من توفر الفريق في الحي والموعد المطلوب."
  },
  {
    category: "عام",
    q: "هل يمكن حجز موعد مسبق؟",
    a: "نعم، ننسق الموعد المناسب حسب توفر الفريق وموقعك، ويمكن إرسال التفاصيل عبر الهاتف أو واتساب لتأكيد الحجز."
  },
  {
    category: "تنظيف المنازل والفلل",
    q: "هل تقدمون تنظيف الشقق والفلل؟",
    a: "نعم، تشمل الخدمات الشقق والمنازل والفلل والقصور، ويحدد نطاق التنظيف حسب مساحة العقار وحالته والأعمال المطلوبة."
  },
  {
    category: "تنظيف المنازل والفلل",
    q: "هل يمكن طلب تنظيف عميق أو تنظيف بعد البناء؟",
    a: "نعم، ننسق خدمات التنظيف العميق والتنظيف بعد البناء والتشطيب حسب حالة المكان والنتيجة المطلوبة."
  },
  {
    category: "التنظيف المتخصص",
    q: "ما خدمات التنظيف المتخصصة المتاحة؟",
    a: "نقدم غسيل المجالس والكنب بالبخار، تنظيف المكيفات، جلي وتلميع الرخام، تطهير الخزانات، تنظيف المسابح، مكافحة الحشرات وتنظيف الواجهات."
  },
  {
    category: "التنظيف المتخصص",
    q: "هل تستخدمون مواد مناسبة للمفروشات والأسطح؟",
    a: "نختار الأدوات والمواد بحسب نوع السطح والمفروشات، مع اتخاذ احتياطات لحماية الأثاث والأرضيات أثناء التنفيذ."
  },
  {
    category: "المكاتب والمنشآت",
    q: "هل تنظفون المكاتب والمنشآت؟",
    a: "نعم، نقدم حلول تنظيف للمكاتب والمحلات والمنشآت مع تنسيق المواعيد بما يناسب طبيعة النشاط وساعات العمل."
  },
  {
    category: "المكاتب والمنشآت",
    q: "كيف أطلب عرضاً مناسباً لمكان عملي؟",
    a: "أرسل نوع المكان ومساحته وموقعه والخدمة المطلوبة عبر الهاتف أو واتساب، وسيتواصل معك الفريق لتأكيد التفاصيل والموعد."
  }
]

export default function FaqPage() {
  const siteSettings = useSiteSettings()
  const [activeCategory, setActiveCategory] = useState("الكل")
  const [searchQuery, setSearchQuery] = useState("")
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const categories = ["الكل", "عام", "تنظيف المنازل والفلل", "التنظيف المتخصص", "المكاتب والمنشآت"]

  const filteredFaqs = FAQS.filter(item => {
    const matchCat = activeCategory === "الكل" || item.category === activeCategory
    const matchQuery = !searchQuery.trim() ||
      item.q.includes(searchQuery.trim()) ||
      item.a.includes(searchQuery.trim())
    return matchCat && matchQuery
  })

  const { phoneCall, phoneWhatsapp, phones, companyName } = siteSettings
  const resolvedCompany = companyName || ""
  const { call: callNumber, whatsapp: whatsappNumber } = resolveContactNumbers(phoneCall, phoneWhatsapp, phones)

  useDocumentSEO({
    title: companyName ? `الأسئلة الشائعة حول خدمات التنظيف بالرياض | ${companyName}` : "الأسئلة الشائعة حول خدمات التنظيف بالرياض",
    description: "إجابات عملية عن تنظيف المنازل والفلل والمكاتب وخدمات التنظيف المتخصصة في الرياض.",
    canonical: siteUrl("/faq"),
  })

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900" dir="rtl">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary text-white py-16 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-secondary text-sm font-bold mb-4">
            <HelpCircle size={16} /> مركز المساعدة وإجابات استفسارات الباقات التنظيف
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            الأسئلة الأكثر شيوعاً
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto mb-8">
            كل ما تود معرفته عن مقاسات الباقات التنظيف، الأسعار، مدة البقاء، عقود النظافة البلدية، وسرعة التوصيل في الرياض.
          </p>

          {/* Search bar */}
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder="ابحث عن سؤالك هنا (مثال: مقاس 20 ياردة، الأسعار، عقد بلدي، مدة البقاء)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-gray-800 rounded-2xl py-3.5 pr-12 pl-4 text-sm md:text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="container mx-auto max-w-4xl px-4 py-12 flex-1">
        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                activeCategory === cat
                  ? "bg-primary text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQs Accordion */}
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index
              return (
                <div
                  key={index}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full text-right p-5 flex items-center justify-between gap-4 font-bold text-gray-800 hover:text-primary transition-colors"
                  >
                    <span className="flex items-center gap-3 text-base md:text-lg">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                        {index + 1}
                      </span>
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={20}
                      className={`text-gray-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-primary" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-gray-600 text-sm md:text-base leading-relaxed border-t border-gray-50 bg-gray-50/50">
                      <p className="mt-2">{faq.a}</p>
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <HelpCircle className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500 font-bold">لم نجد نتائج مطابقة لبحثك</p>
              <button
                onClick={() => { setActiveCategory("الكل"); setSearchQuery("") }}
                className="mt-3 text-primary text-sm font-bold underline"
              >
                إعادة ضبط البحث
              </button>
            </div>
          )}
        </div>

        {/* CTA Card */}
        <div className="mt-16 bg-gradient-to-br from-primary to-primary/95 text-white rounded-3xl p-8 md:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-right">
            <h3 className="text-2xl font-black">لديك استفسار خاص بمشروعك؟</h3>
            <p className="text-white/80 text-sm md:text-base">
              فريق {resolvedCompany} جاهز للتنسيق وتحديد الخدمة الأنسب وتنفيذها في الموعد المتفق عليه.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            {callNumber && (
              <a
                href={`tel:${callNumber}`}
                className="inline-flex items-center gap-2 bg-secondary text-primary font-black px-6 py-3.5 rounded-xl text-sm shadow hover:scale-105 transition-all"
              >
                <Phone size={18} /> اتصل بالعمليات
              </a>
            )}
            {whatsappNumber && (
              <a
                href={`https://wa.me/966${whatsappNumber.replace(/^0/, "")}?text=${encodeURIComponent("مرحباً، لدي استفسار بخصوص خدمات التنظيف بالرياض")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 text-white font-bold px-6 py-3.5 rounded-xl text-sm shadow hover:bg-green-600 transition-all"
              >
                <MessageCircle size={18} /> واتساب مباشر
              </a>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
