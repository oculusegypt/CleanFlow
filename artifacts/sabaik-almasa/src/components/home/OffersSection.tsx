import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { CalendarDays, Gift, Sparkles, Tag } from "lucide-react"
import { useServiceRequest } from "@/context/ServiceRequestContext"

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || ""
type Offer = { id: number; title: string; content: string; imageUrl: string; linkUrl: string; buttonText: string; bgColor: string }

export function OffersSection() {
  const [offers, setOffers] = useState<Offer[]>([])
  const { openModal } = useServiceRequest()
  useEffect(() => {
    fetch(`${API_BASE}/api/ads?type=offer`).then(r => r.json()).then(data => setOffers(Array.isArray(data) ? data : [])).catch(() => {})
  }, [])
  if (!offers.length) return null
  return (
    <section id="offers" aria-labelledby="offers-title" className="relative overflow-hidden bg-slate-950 py-16 text-white md:py-20">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
      <div className="container relative mx-auto px-4 md:px-6">
        <div className="mb-10 text-center">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-secondary/15 px-4 py-1.5 text-xs font-black text-secondary"><Gift size={14} /> عروض موسمية</span>
          <h2 id="offers-title" className="text-3xl font-black md:text-4xl">عروض التنظيف الحالية</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/65 md:text-base">استفد من عروضنا الموسمية على خدمات وباقات التنظيف لفترة محدودة.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer, index) => (
            <motion.article key={offer.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .08 }}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[.07] shadow-2xl">
              {offer.imageUrl && <img src={offer.imageUrl} alt={offer.title} loading="lazy" className="h-44 w-full object-cover transition-transform duration-700 group-hover:scale-105" />}
              <div className="p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-black">{offer.title}</h3>
                  <span className="rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-black">لفترة محدودة</span>
                </div>
                <p className="min-h-12 text-sm leading-relaxed text-white/65">{offer.content}</p>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-secondary"><CalendarDays size={14} /> عرض موسمي</span>
                  <button type="button" onClick={() => openModal()} className="rounded-xl bg-secondary px-4 py-2 text-xs font-black text-primary transition hover:bg-white"><Tag size={14} className="ml-1 inline" /> اطلب العرض</button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-white/40"><Sparkles size={13} className="ml-1 inline" /> تطبق الشروط والأحكام حسب تفاصيل كل عرض</p>
      </div>
    </section>
  )
}