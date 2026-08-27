import React from "react"
import type { CleaningPackage } from "@workspace/api-client-react"
import { Check, Maximize, Weight, Info, Clock, Phone, MessageCircle, Timer, ArrowUpLeft } from "lucide-react"
import { Link } from "wouter"
import { resolveContactNumbers, useSiteSettings } from "@/context/SiteSettingsContext"
import { resolvePackageImageUrl } from "@/lib/packageImage"

export interface PackageCardProps {
  container: CleaningPackage
  index?: number
  companyName?: string
  onRequest: () => void
}

export const ARABIC_CATEGORY_NAMES: Record<string, string> = {
  apartments: "تنظيف شقق",
  villas: "تنظيف فلل",
  palaces: "تنظيف قصور",
  move_clean: "قبل وبعد النقل",
  majlis: "غسيل مجالس",
  marble: "جلي وتلميع",
  tanks: "تطهير خزانات",
  ac: "غسيل مكيفات",
  pest: "مكافحة حشرات",
  postcon: "بعد البناء",
  facades: "واجهات ومكاتب",
  facilities: "منشآت",
  fire_safety: "سلامة ودفاع مدني",
}

function parseImages(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      }
    } catch {}
  }
  return []
}

export function getCleaningPackageImage(container: CleaningPackage): string {
  const firstSavedImage = parseImages(container.images)[0]
  if (container.imageUrl && container.imageUrl.trim()) return resolvePackageImageUrl(container.imageUrl)
  if (firstSavedImage) return resolvePackageImageUrl(firstSavedImage)
  return "/images/service-apartments.jpg"
}

function parseFeatures(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[]
  if (typeof raw === "string") {
    try { return JSON.parse(raw) } catch { return [] }
  }
  return []
}

function PhoneRow({ callNumber, whatsappNumber, name }: { callNumber: string; whatsappNumber: string; name: string }) {
  if (!callNumber && !whatsappNumber) return null
  const waMsg = encodeURIComponent(`أريد الاستفسار عن ${name}`)
  const waHref = whatsappNumber
    ? `https://wa.me/966${whatsappNumber.replace(/^0/, "")}?text=${waMsg}`
    : ""
  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {callNumber && (
        <a href={`tel:${callNumber}`}
          className="flex items-center justify-center gap-1.5 border-2 border-slate-200 hover:border-slate-800 text-slate-800 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-slate-50">
          <Phone size={13} className="text-secondary" /> اتصل فوري
        </a>
      )}
      {waHref && (
        <a href={waHref} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md">
          <MessageCircle size={13} /> واتساب
        </a>
      )}
    </div>
  )
}

export function resolveServiceTypeFromCleaningPackage(c: { category?: any; name?: any; id?: any }): string {
  if (!c) return "تنظيف الشقق السكنية"
  const services: Record<string, string> = {
    apartments: "تنظيف الشقق السكنية",
    villas: "تنظيف الفلل والقصور",
    palaces: "تنظيف الفلل والقصور",
    move_clean: "تنظيف قبل وبعد النقل والترميم",
    majlis: "غسيل المجالس والكنب بالبخار",
    marble: "جلي وتلميع الرخام والبلاط",
    tanks: "تنظيف وتطهير خزانات المياه",
    ac: "تنظيف وغسيل المكيفات",
    pest: "مكافحة وإبادة الحشرات",
    postcon: "تنظيف بعد البناء والتشطيب",
    facades: "تنظيف واجهات المباني والشركات",
    facilities: "تنظيف المساجد والمدارس",
    fire_safety: "خدمات السلامة والدفاع المدني",
  }
  return services[String(c.category || "").toLowerCase()] || "طلب خدمة تنظيف مخصصة"
}

export function PackageCard({ container: c, onRequest }: PackageCardProps) {
  const feats = parseFeatures(c.features)
  const { phoneWhatsapp, phoneCall, phones } = useSiteSettings()
  const { call: defaultCall, whatsapp: defaultWa } = resolveContactNumbers(phoneCall, phoneWhatsapp, phones)

  const callNumber = c.contactPhone2 || c.contactPhone1 || defaultCall
  const whatsappNumber = c.contactPhone1 || defaultWa

  const categoryArabic = (c.category && ARABIC_CATEGORY_NAMES[c.category]) || "خدمات التنظيف"
  const raw = c as CleaningPackage & {
    discountPercent?: number
    originalPrice?: number
    salePrice?: number
    salePriceExpiresAt?: string
    discountLabel?: string
  }
  const now = Date.now()
  const hasTimedSale = !!raw.salePriceExpiresAt && new Date(raw.salePriceExpiresAt).getTime() > now
  const discountPercent = Math.min(100, Math.max(0, Number(raw.discountPercent) || 0))
  const basePrice = Number(raw.originalPrice) > 0 ? Number(raw.originalPrice) : Number(c.pricePerDay) || 0
  const calculatedSalePrice = basePrice > 0 && discountPercent > 0
    ? Math.round(basePrice * (1 - discountPercent / 100) * 100) / 100
    : 0
  const currentPrice = hasTimedSale && calculatedSalePrice > 0 ? calculatedSalePrice : Number(c.pricePerDay) || 0
  const hasDiscount = discountPercent > 0 && calculatedSalePrice > 0 && calculatedSalePrice < basePrice &&
    (!raw.salePriceExpiresAt || hasTimedSale)

  return (
    <div className="bg-white border-2 border-slate-100 hover:border-secondary/40 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group transform hover:-translate-y-1">
      <div className="relative h-64 sm:h-72 overflow-hidden bg-slate-100">
        {getCleaningPackageImage(c) ? (
          <img
            src={getCleaningPackageImage(c)}
            alt={c.name}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
            loading="lazy"
            onError={(e) => { e.currentTarget.src = "/images/packages/package-01.webp" }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center text-white font-bold text-lg">
            {c.name}
          </div>
        )}
        {categoryArabic && (
          <div className={`absolute top-3.5 right-3.5 backdrop-blur-md font-black text-xs px-3 py-1.5 rounded-xl shadow-md border ${
            c.category === 'waste'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : c.category === 'contract'
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-secondary text-slate-950 border-amber-400'
          }`}>
            {categoryArabic}
          </div>
        )}
        {hasDiscount ? (
          <div className="absolute bottom-3.5 right-3.5 rounded-2xl border border-white/20 bg-slate-950/90 px-3.5 py-2 text-white shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-black text-white">
                 {raw.discountLabel || `خصم ${Math.round(discountPercent)}%`}
              </span>
              <div className="text-right">
                {basePrice > currentPrice && <span className="block text-[10px] text-white/55 line-through">{basePrice} ر.س</span>}
                <span className="block text-sm font-black text-amber-400">{currentPrice} ر.س</span>
              </div>
            </div>
          </div>
        ) : c.priceText ? (
          <div className="absolute bottom-3.5 right-3.5 bg-slate-950/90 backdrop-blur-md text-amber-400 font-extrabold text-xs px-3.5 py-1.5 rounded-xl border border-amber-400/30 shadow-lg">
            {c.priceText}
          </div>
        ) : null}
      </div>

      <div className="p-6 flex-1 flex flex-col gap-3.5">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 leading-snug group-hover:text-primary transition-colors">{c.name}</h3>
          {(c.size || c.capacity) && (
            <div className="flex flex-wrap gap-2.5 mt-2 text-xs">
              {c.size && (
                <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-200/60 px-2.5 py-1 rounded-lg font-bold">
                  <Maximize size={13} className="text-amber-600" />
                  <span>{c.size}</span>
                </div>
              )}
              {c.capacity && (
                <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-bold">
                  <Weight size={13} className="text-slate-500" />
                  <span>{c.capacity}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">{c.description}</p>

        {feats.length > 0 && (
          <div className="space-y-2 pt-1">
            {feats.slice(0, 4).map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-xs font-medium text-slate-700">
                <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                  <Check size={11} className="stroke-[3]" />
                </div>
                <span>{f}</span>
              </div>
            ))}
          </div>
        )}

        {c.suitableFor && (
          <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 rounded-xl p-2.5 border border-slate-100">
            <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
            <span><strong className="text-slate-800">مناسب لـ:</strong> {c.suitableFor}</span>
          </div>
        )}

        {c.rentalPeriod && (
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Clock size={13} className="text-amber-600 shrink-0" />
            <span>{c.rentalPeriod}</span>
          </div>
        )}

        {c.priceNote && (
          <p className="text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-xl px-3 py-2 border border-emerald-200/80">
            ✓ {c.priceNote}
          </p>
        )}

        {hasTimedSale && (
          <SaleCountdown expiresAt={raw.salePriceExpiresAt!} />
        )}

        <div className="pt-3 mt-auto border-t border-slate-100 space-y-2">
          <button
            onClick={onRequest}
            className="w-full text-center bg-primary hover:bg-secondary hover:text-slate-950 text-white font-extrabold py-3 rounded-2xl transition-all duration-300 text-sm shadow-md hover:shadow-xl transform active:scale-98"
          >
            "اطلب هذه الباقة الآن ←"
          </button>
          <Link
            href={`/cleaning-packages/${String((c as CleaningPackage & { seoSlug?: string }).seoSlug || c.name)}`}
            className="flex items-center justify-center gap-1.5 text-sm font-bold text-primary hover:text-secondary transition-colors"
          >
            <span>تفاصيل الباقة</span>
            <ArrowUpLeft size={15} />
          </Link>
          <PhoneRow callNumber={callNumber} whatsappNumber={whatsappNumber} name={c.name} />
        </div>
      </div>
    </div>
  )
}

function SaleCountdown({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = React.useState(() => Math.max(0, new Date(expiresAt).getTime() - Date.now()))
  React.useEffect(() => {
    const id = window.setInterval(() => setRemaining(Math.max(0, new Date(expiresAt).getTime() - Date.now())), 1000)
    return () => window.clearInterval(id)
  }, [expiresAt])
  if (!remaining) return null
  const totalSeconds = Math.floor(remaining / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700">
      <span className="flex items-center gap-1.5 font-bold"><Timer size={14} /> ينتهي العرض خلال</span>
      <span dir="ltr" className="font-black tabular-nums">{days ? `${days}ي ` : ""}{String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</span>
    </div>
  )
}
