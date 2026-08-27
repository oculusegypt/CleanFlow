import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X, Send, Bot, CheckCircle, MapPin,
  Package, Sparkles, Navigation, Loader2, AlertCircle,
  Headphones, Lock, Pencil, Phone, User, Search,
  CalendarClock, Clock, FileText, Zap,
  Plus, Minus, CheckSquare, Square,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LiveSupportChat } from "./LiveSupportChat"
import { getHighAccuracyPosition } from "@/lib/reverseGeocode"
import { DraggableMapPicker } from "@/components/ui/DraggableMapPicker"
import { useSiteSettings } from "@/context/SiteSettingsContext"

// ─── Types ─────────────────────────────────────────────────────────────────

interface FlowState {
  step: string
  data: {
    serviceType?: string
    packageSize?: string
    containerPrice?: number
    containerCategory?: string
    isQuoteRequest?: boolean
    activityType?: string
    monthlyEvacuations?: string
    appointmentType?: "immediate" | "scheduled"
    scheduledAt?: string
    duration?: string
    notes?: string
    location?: string
    name?: string
    phone?: string
    propertyDetails?: Record<string, unknown>
    packageDetailsText?: string
  }
}

type MessageType = "text" | "options" | "service_cards" | "container_cards" | "package_detail" | "package_form" | "date_input" | "order_confirm" | "success"

interface OptionItem  { label: string; value: string; emoji?: string }
interface ServiceCard { id: string; title: string; description: string; image: string; emoji: string; category?: string }
interface CleaningPackageCard {
  id: string; category: string; categoryTitle: string; name: string; size: string; capacity: string
  description: string
  price?: number; priceNote: string; priceType: "fixed" | "quote"
  priceText?: string  // نص السعر المعروض من قاعدة البيانات
  image: string; features: string[]; bestFor: string
}

interface BotMessage {
  id: string
  isUser: boolean
  text: string
  type: MessageType
  options?: OptionItem[]
  cards?: ServiceCard[] | CleaningPackageCard[]
  packageData?: CleaningPackageCard
  packageForm?: { category: string; serviceType: string }
  orderData?: Record<string, unknown>
  timestamp: Date
  locked?: boolean       // locked once user responds
  selectedLabel?: string // what user picked from this message
}

// ─── API ──────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || ""

async function sendToBot(message: string, flowState: FlowState, conversationId: number | null) {
  const res = await fetch(`${API_BASE}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, flowState, conversationId }),
  })
  return res.json()
}

function loadAiConversationId(): number | null {
  try {
    const saved = Number(localStorage.getItem("sabaik_ai_chat_id"))
    return Number.isInteger(saved) && saved > 0 ? saved : null
  } catch {
    return null
  }
}

function saveAiConversationId(id: number | null) {
  try {
    if (id) localStorage.setItem("sabaik_ai_chat_id", String(id))
    else localStorage.removeItem("sabaik_ai_chat_id")
  } catch {}
}

async function getWelcome() {
  const res = await fetch(`${API_BASE}/api/ai/chat/welcome`)
  return res.json()
}

async function fetchSettings() {
  try {
    const res = await fetch(`${API_BASE}/api/settings`)
    return await res.json()
  } catch {
    return { requests_locked: "false", support_status: "unavailable", requests_locked_message: "" }
  }
}

// ─── Typing Indicator ─────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="flex items-center gap-1.5 bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm">
        {[0, 0.2, 0.4].map((delay, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary/40"
            animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 0.8, delay }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Options Grid ─────────────────────────────────────────────────────────

function OptionsGrid({
  options, onSelect, locked,
}: {
  options: OptionItem[]
  onSelect: (v: string, l: string) => void
  locked?: boolean
}) {
  if (locked) return null
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map((opt) => (
        <motion.button
          key={opt.value}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(opt.value, opt.label)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-primary/25 bg-white hover:bg-primary hover:text-white hover:border-primary text-primary text-xs font-semibold transition-all shadow-sm hover:shadow-md"
        >
          {opt.emoji && <span>{opt.emoji}</span>}
          {opt.label}
        </motion.button>
      ))}
    </div>
  )
}

// ─── Service Card Grid ────────────────────────────────────────────────────

function ServiceCardGrid({
  cards, onSelect, locked,
}: {
  cards: ServiceCard[]
  onSelect: (v: string, l: string) => void
  locked?: boolean
}) {
  if (locked) return null
  return (
    <div className="grid grid-cols-3 gap-2 mt-2">
      {cards.map((card) => (
        <motion.button
          key={card.id}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onSelect(card.id, card.title)}
          className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm text-right hover:border-primary/50 hover:shadow-lg transition-all flex flex-col"
        >
          <div className="h-16 overflow-hidden shrink-0 bg-gray-50">
            <img
              src={card.image}
              alt={card.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.currentTarget.style.display = "none" }}
            />
          </div>
          <div className="p-2 flex-1">
            <p className="text-gray-900 font-bold text-[11px] leading-snug">{card.emoji} {card.title}</p>
            <p className="text-gray-400 text-[9px] leading-tight mt-0.5 line-clamp-2">{card.description}</p>
          </div>
        </motion.button>
      ))}
    </div>
  )
}

// ─── CleaningPackage Card List ──────────────────────────────────────────────────

function CleaningPackageCardList({
  cards, onSelect, locked,
}: {
  cards: CleaningPackageCard[]
  onSelect: (v: string, l: string) => void
  locked?: boolean
}) {
  if (locked) return null
  const groupedCards = cards.reduce<Array<{ category: string; title: string; cards: CleaningPackageCard[] }>>(
    (groups, card) => {
      const existing = groups.find((group) => group.category === card.category)
      if (existing) {
        existing.cards.push(card)
      } else {
        groups.push({ category: card.category, title: card.categoryTitle, cards: [card] })
      }
      return groups
    },
    [],
  )

  return (
    <div className="space-y-4 mt-2">
      {groupedCards.map((group) => (
        <section key={group.category} className="space-y-2">
          {groupedCards.length > 1 && (
            <div className="flex items-center justify-between px-1">
              <h4 className="text-[11px] font-black text-primary">{group.title}</h4>
              <span className="text-[9px] text-gray-400">{group.cards.length} باقات</span>
            </div>
          )}
          <div className="space-y-2">
            {group.cards.map((card) => (
              <motion.button
                key={card.id}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
                onClick={() => onSelect(card.id, `${card.name}${card.size ? ` — ${card.size}` : ""}`)}
                className="w-full flex gap-3 rounded-xl border border-gray-100 bg-white shadow-sm text-right hover:border-primary/40 hover:shadow-md transition-all overflow-hidden"
              >
                <div className="w-20 h-20 shrink-0 overflow-hidden bg-gray-100">
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = "none" }}
                  />
                </div>
                <div className="flex-1 py-2.5 pl-2 pr-1 text-right">
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <p className="font-bold text-xs text-gray-900">{card.name}</p>
                      {(card.size || card.capacity) && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {[card.size, card.capacity].filter(Boolean).join(" — ")}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      {card.priceText ? (
                        <span className="text-primary font-black text-[10px] leading-tight block max-w-[80px] text-right">{card.priceText}</span>
                      ) : card.priceType === "fixed" && card.price != null ? (
                        <span className="text-primary font-black text-xs">{card.price} ﷼</span>
                      ) : (
                        <span className="text-[9px] bg-amber-50 text-amber-600 font-bold px-2 py-0.5 rounded-full border border-amber-200 whitespace-nowrap">عرض سعر</span>
                      )}
                    </div>
                  </div>
                  {card.priceNote && (
                    <p className="text-[9px] text-gray-400 mt-1 line-clamp-1">{card.priceNote}</p>
                  )}
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {card.features.slice(0, 2).map((f) => (
                      <span key={f} className="text-[9px] bg-primary/5 text-primary px-1.5 py-0.5 rounded-full border border-primary/10">{f}</span>
                    ))}
                  </div>
                  {card.bestFor && <p className="text-[9px] text-secondary font-semibold mt-1">✓ {card.bestFor}</p>}
                </div>
              </motion.button>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function PackageDetailCard({ card }: { card: CleaningPackageCard }) {
  return (
    <div className="mt-2 overflow-hidden rounded-2xl border border-primary/15 bg-white shadow-sm">
      <div className="h-28 overflow-hidden bg-gray-100">
        <img
          src={card.image}
          alt={card.name}
          className="h-full w-full object-cover"
          onError={(e) => { e.currentTarget.style.display = "none" }}
        />
      </div>
      <div className="space-y-2.5 p-3.5 text-right">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-black text-gray-900">{card.name}</p>
            {(card.size || card.capacity) && (
              <p className="mt-0.5 text-[10px] text-gray-400">
                {[card.size, card.capacity].filter(Boolean).join(" — ")}
              </p>
            )}
          </div>
          <span className="shrink-0 rounded-full border border-primary/15 bg-primary/5 px-2 py-1 text-[9px] font-bold text-primary">
            {card.categoryTitle}
          </span>
        </div>
        {card.description && (
          <p className="text-[11px] leading-relaxed text-gray-500">{card.description}</p>
        )}
        {card.features.length > 0 && (
          <div className="space-y-1 rounded-xl bg-gray-50 p-2.5">
            {card.features.slice(0, 4).map((feature) => (
              <p key={feature} className="flex items-start gap-1.5 text-[10px] text-gray-600">
                <CheckCircle size={11} className="mt-0.5 shrink-0 text-secondary" />
                <span>{feature}</span>
              </p>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-2">
          <span className="text-[10px] font-semibold text-gray-500">
            {card.bestFor ? `مناسب لـ: ${card.bestFor}` : "مناسب لمشروعك"}
          </span>
          <span className="text-[11px] font-black text-primary">
            {card.priceText || (card.price != null ? `${card.price} ريال` : "اطلب عرض سعر")}
          </span>
        </div>
      </div>
    </div>
  )
}

type PackageDetailsPayload = {
  details: Record<string, unknown>
  addOns: string[]
  summary: string
}

function ChatCounter({
  label, value, onChange, min = 0, suffix,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  suffix?: string
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] text-gray-600">{label}</span>
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="flex h-6 w-6 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600">
          <Minus size={10} />
        </button>
        <span className="min-w-10 text-center text-[11px] font-bold text-gray-800">{value}{suffix ? ` ${suffix}` : ""}</span>
        <button type="button" onClick={() => onChange(value + 1)} className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-white">
          <Plus size={10} />
        </button>
      </div>
    </div>
  )
}

function ChatChoices({ options, value, onChange }: { options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {options.map((option) => (
        <button
          type="button"
          key={option}
          onClick={() => onChange(option)}
          className={`rounded-lg border px-2 py-1.5 text-[10px] font-semibold transition-colors ${value === option ? "border-primary bg-primary text-white" : "border-gray-200 bg-white text-gray-700 hover:border-primary/40"}`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

function ChatMultiChoices({ options, values, onToggle }: { options: string[]; values: string[]; onToggle: (value: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {options.map((option) => {
        const selected = values.includes(option)
        return (
          <button
            type="button"
            key={option}
            onClick={() => onToggle(option)}
            className={`flex items-center gap-1 rounded-lg border px-2 py-1.5 text-right text-[10px] font-semibold transition-colors ${selected ? "border-primary bg-primary text-white" : "border-gray-200 bg-white text-gray-700 hover:border-primary/40"}`}
          >
            {selected ? <CheckSquare size={10} /> : <Square size={10} />}
            {option}
          </button>
        )
      })}
    </div>
  )
}

function PackageDetailsForm({
  category, serviceType, onSubmit, locked,
}: {
  category: string
  serviceType: string
  onSubmit: (payload: PackageDetailsPayload) => void
  locked?: boolean
}) {
  const [rooms, setRooms] = useState(3)
  const [bathrooms, setBathrooms] = useState(2)
  const [kitchens, setKitchens] = useState(1)
  const [salons, setSalons] = useState(1)
  const [floors, setFloors] = useState(2)
  const [yard, setYard] = useState(50)
  const [propertyType, setPropertyType] = useState("فيلا صغيرة")
  const [moveStatus, setMoveStatus] = useState("قبل الانتقال والسكن")
  const [splitAc, setSplitAc] = useState(4)
  const [windowAc, setWindowAc] = useState(0)
  const [concealedAc, setConcealedAc] = useState(0)
  const [majlisSets, setMajlisSets] = useState(1)
  const [sofaSets, setSofaSets] = useState(1)
  const [carpetMeters, setCarpetMeters] = useState(20)
  const [furniture, setFurniture] = useState(["مجالس عربية", "كنب"])
  const [fabric, setFabric] = useState("قماش")
  const [marbleMeters, setMarbleMeters] = useState(100)
  const [marbleMaterial, setMarbleMaterial] = useState("رخام")
  const [tankType, setTankType] = useState("خزان أرضي + علوي")
  const [pestTypes, setPestTypes] = useState(["صراصير"])
  const [pestWarranty, setPestWarranty] = useState("ضمان 12 شهراً ورش مجاني")
  const [postconMeters, setPostconMeters] = useState(250)
  const [postconTasks, setPostconTasks] = useState(["إزالة بقايا الإسمنت", "إزالة الدهانات"])
  const [facadeMaterial, setFacadeMaterial] = useState("زجاج")
  const [facadeFloors, setFacadeFloors] = useState(3)
  const [facilityType, setFacilityType] = useState("مسجد / مصلى جامع")
  const [facilityArea, setFacilityArea] = useState(200)
  const [facilityCarpet, setFacilityCarpet] = useState(100)
  const [prayerHalls, setPrayerHalls] = useState(1)
  const [ablutionUnits, setAblutionUnits] = useState(4)
  const [facilityBathrooms, setFacilityBathrooms] = useState(2)
  const [facilityCourtyard, setFacilityCourtyard] = useState(50)
  const [facilityScope, setFacilityScope] = useState("تنظيف شامل للمصلى والمرافق")
  const [schoolBuildings, setSchoolBuildings] = useState(1)
  const [schoolClassrooms, setSchoolClassrooms] = useState(10)
  const [schoolBathrooms, setSchoolBathrooms] = useState(4)
  const [schoolCourtyard, setSchoolCourtyard] = useState(100)
  const [schoolScope, setSchoolScope] = useState("تنظيف الفصول والممرات")
  const [officeFloors, setOfficeFloors] = useState(1)
  const [officeRooms, setOfficeRooms] = useState(8)
  const [meetingRooms, setMeetingRooms] = useState(1)
  const [officeBathrooms, setOfficeBathrooms] = useState(2)
  const [officeFrequency, setOfficeFrequency] = useState("تنظيف شامل لمرة واحدة")
  const [addOns, setAddOns] = useState<string[]>([])
  const [addonAcSplit, setAddonAcSplit] = useState(2)
  const [addonAcWindow, setAddonAcWindow] = useState(0)
  const [addonAcConcealed, setAddonAcConcealed] = useState(0)
  const [addonMajlisSets, setAddonMajlisSets] = useState(1)
  const [addonSofaSets, setAddonSofaSets] = useState(1)
  const [addonCarpetMeters, setAddonCarpetMeters] = useState(15)
  const [addonTankType, setAddonTankType] = useState("خزان أرضي + علوي")
  const [addonPoolSize, setAddonPoolSize] = useState("مسبح فيلا متوسط")
  const [addonPestTypes, setAddonPestTypes] = useState(["صراصير"])
  const [addonPestWarranty, setAddonPestWarranty] = useState("ضمان 12 شهراً")
  const [addonMarbleMeters, setAddonMarbleMeters] = useState(50)
  const [addonMarbleMaterial, setAddonMarbleMaterial] = useState("رخام")
  const [submitted, setSubmitted] = useState(false)

  const is = (value: string) => category === value
  const toggle = (value: string) => setAddOns((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
  const toggleValue = (values: string[], value: string, setter: (next: string[]) => void) =>
    setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value])

  const submit = () => {
    const details: Record<string, unknown> = {}
    if (is("apartments")) Object.assign(details, { "عدد الغرف السكنية": rooms, "عدد الحمامات": bathrooms, "عدد المطابخ": kitchens, "عدد الصالونات / غرف المعيشة": salons })
    if (is("villas") || is("palaces")) Object.assign(details, { "نوع العقار": propertyType, "عدد الأدوار والطوابق": floors, "عدد الغرف السكنية": rooms, "عدد الحمامات": bathrooms, "عدد المطابخ": kitchens, "عدد الصالونات": salons, "مساحة الحوش التقريبية": `${yard} م²` })
    if (is("move_clean")) Object.assign(details, { "حالة العقار": moveStatus, "عدد الغرف السكنية": rooms, "عدد الحمامات": bathrooms, "عدد المطابخ": kitchens })
    if (is("ac")) Object.assign(details, { "مكيفات سبلت": splitAc, "مكيفات شباك": windowAc, "مكيفات مخفي / مركزي": concealedAc })
    if (is("majlis")) Object.assign(details, { "أطقم المجالس": majlisSets, "أطقم الكنب": sofaSets, "مساحة السجاد والموكيت": `${carpetMeters} م²`, "أنواع الأثاث": furniture, "نوع القماش": fabric })
    if (is("marble")) Object.assign(details, { "نوع الأرضية": marbleMaterial, "المساحة": `${marbleMeters} م²` })
    if (is("tanks")) details["نوع الخزان"] = tankType
    if (is("pest")) Object.assign(details, { "أنواع الحشرات المستهدفة": pestTypes, "الضمان": pestWarranty })
    if (is("postcon")) Object.assign(details, { "المساحة": `${postconMeters} م²`, "الأعمال المطلوبة": postconTasks })
    if (is("facades")) Object.assign(details, { "نوع الواجهة": facadeMaterial, "عدد الأدوار": facadeFloors })
    if (is("facilities")) {
      Object.assign(details, { "نوع المنشأة": facilityType, "مساحة المنشأة": `${facilityArea} م²` })
      if (facilityType === "مسجد / مصلى جامع") Object.assign(details, {
        "مساحة موكيت المصلى / السجاد": `${facilityCarpet} م²`,
        "عدد المصليات / قاعات الصلاة": prayerHalls,
        "عدد وحدات الوضوء": ablutionUnits,
        "عدد دورات المياه": facilityBathrooms,
        "مساحة الساحات الخارجية": `${facilityCourtyard} م²`,
        "نطاق الخدمة": facilityScope,
      })
      if (facilityType === "مدرسة") Object.assign(details, {
        "مساحة السجاد والموكيت": `${facilityCarpet} م²`,
        "عدد المباني": schoolBuildings,
        "عدد الفصول": schoolClassrooms,
        "عدد دورات المياه": schoolBathrooms,
        "مساحة الملاعب / الساحات": `${schoolCourtyard} م²`,
        "نطاق الخدمة": schoolScope,
      })
      if (facilityType === "مكتب / منشأة") Object.assign(details, {
        "مساحة السجاد والموكيت": `${facilityCarpet} م²`,
        "عدد الأدوار": officeFloors,
        "عدد المكاتب والغرف": officeRooms,
        "عدد غرف الاجتماعات": meetingRooms,
        "عدد دورات المياه": officeBathrooms,
        "دورية التنظيف": officeFrequency,
      })
    }
    if (addOns.length) {
      details["تفاصيل الإضافات"] = {
        ...(addOns.includes("غسيل وتنظيف مكيفات الهواء") ? { "المكيفات الإضافية": { سبلت: addonAcSplit, شباك: addonAcWindow, "مخفي / مركزي": addonAcConcealed } } : {}),
        ...(addOns.includes("غسيل وتطهير مجالس وكنب بالبخار") ? { "المجالس الإضافية": { مجالس: addonMajlisSets, كنب: addonSofaSets, "سجاد وموكيت": `${addonCarpetMeters} م²` } } : {}),
        ...(addOns.includes("تنظيف وتطهير خزان المياه الأرضي والعلوي") ? { "الخزان الإضافي": addonTankType } : {}),
        ...(addOns.includes("رش مبيدات ومكافحة الحشرات بضمان") ? { "مكافحة الحشرات الإضافية": { الأنواع: addonPestTypes, الضمان: addonPestWarranty } } : {}),
        ...(addOns.includes("جلي وتلميع رخام وسيراميك بالألماس") ? { "الجلي الإضافي": { النوع: addonMarbleMaterial, المساحة: `${addonMarbleMeters} م²` } } : {}),
        ...(addOns.includes("تنظيف وتطهير المسبح والفلتر") ? { "المسبح": addonPoolSize } : {}),
      }
    }
    const displayValue = (value: unknown): string => {
      if (Array.isArray(value)) return value.join("، ")
      if (value && typeof value === "object") {
        return Object.entries(value as Record<string, unknown>)
          .map(([label, nested]) => `${label}: ${displayValue(nested)}`)
          .join("، ")
      }
      return String(value)
    }
    const summary = [
      ...Object.entries(details).map(([label, value]) => `${label}: ${displayValue(value)}`),
      ...(addOns.length ? [`الخدمات الإضافية: ${addOns.join("، ")}`] : []),
    ].join("\n")
    setSubmitted(true)
    onSubmit({ details, addOns, summary })
  }

  const addons = [
    "غسيل وتطهير مجالس وكنب بالبخار",
    "جلي وتلميع رخام وسيراميك بالألماس",
    "تنظيف وتطهير خزان المياه الأرضي والعلوي",
    "غسيل وتنظيف مكيفات الهواء",
    "رش مبيدات ومكافحة الحشرات بضمان",
    "تنظيف وتطهير المسبح والفلتر",
    "تعقيم بالبخار الحراري 140°",
  ]

  if (submitted || locked) return null
  return (
    <div className="mt-2 space-y-3 rounded-2xl border border-primary/15 bg-white p-3 text-right shadow-sm">
      {serviceType && <p className="rounded-xl bg-primary/5 px-3 py-2 text-[11px] font-bold text-primary">{serviceType}</p>}
      {(is("apartments") || is("villas") || is("palaces") || is("move_clean")) && (
        <div className="space-y-2 rounded-xl bg-gray-50 p-3">
          <p className="text-[11px] font-bold text-gray-700">{is("move_clean") ? "حالة العقار ومكوناته" : "تفاصيل مكونات العقار"}</p>
          {(is("villas") || is("palaces")) && <ChatChoices options={["فيلا صغيرة", "فيلا دوبلكس 2 دور", "قصر ومجمع فخم"]} value={propertyType} onChange={setPropertyType} />}
          {is("move_clean") && <ChatChoices options={["قبل الانتقال والسكن", "بعد الانتقال والرحيل", "بعد الترميم"]} value={moveStatus} onChange={setMoveStatus} />}
          {(is("villas") || is("palaces")) && <ChatCounter label="عدد الأدوار والطوابق" value={floors} min={1} onChange={setFloors} />}
          <ChatCounter label="عدد الغرف السكنية" value={rooms} min={1} onChange={setRooms} />
          <ChatCounter label="عدد الحمامات" value={bathrooms} min={1} onChange={setBathrooms} />
          <ChatCounter label="عدد المطابخ" value={kitchens} min={1} onChange={setKitchens} />
          <ChatCounter label="عدد الصالونات / غرف المعيشة" value={salons} min={0} onChange={setSalons} />
          {(is("villas") || is("palaces")) && <ChatCounter label="مساحة الحوش التقريبية" value={yard} suffix="م²" onChange={setYard} />}
        </div>
      )}
      {is("ac") && <div className="space-y-2 rounded-xl bg-cyan-50/70 p-3"><p className="text-[11px] font-bold text-cyan-900">عدد أجهزة المكيفات</p><ChatCounter label="مكيفات سبلت" value={splitAc} onChange={setSplitAc} /><ChatCounter label="مكيفات شباك" value={windowAc} onChange={setWindowAc} /><ChatCounter label="مكيفات مخفي / مركزي" value={concealedAc} onChange={setConcealedAc} /></div>}
      {is("majlis") && <div className="space-y-2 rounded-xl bg-purple-50/70 p-3"><p className="text-[11px] font-bold text-purple-900">تفاصيل الأثاث المطلوب غسيله</p><ChatMultiChoices options={["مجالس عربية", "كنب", "سجاد", "ستائر"]} values={furniture} onToggle={(value) => toggleValue(furniture, value, setFurniture)} /><ChatCounter label="أطقم المجالس" value={majlisSets} min={0} onChange={setMajlisSets} /><ChatCounter label="أطقم الكنب" value={sofaSets} min={0} onChange={setSofaSets} /><ChatCounter label="مساحة السجاد والموكيت" value={carpetMeters} suffix="م²" onChange={setCarpetMeters} /><ChatChoices options={["قماش", "مخمل", "جلد", "متنوع"]} value={fabric} onChange={setFabric} /></div>}
      {is("marble") && <div className="space-y-2 rounded-xl bg-yellow-50/70 p-3"><p className="text-[11px] font-bold text-yellow-900">تفاصيل الأرضية</p><ChatChoices options={["رخام", "سيراميك", "بلاط"]} value={marbleMaterial} onChange={setMarbleMaterial} /><ChatCounter label="المساحة المطلوب جليها" value={marbleMeters} suffix="م²" onChange={setMarbleMeters} /></div>}
      {is("tanks") && <div className="space-y-2 rounded-xl bg-teal-50/70 p-3"><p className="text-[11px] font-bold text-teal-900">نوع الخزان</p><ChatChoices options={["خزان أرضي + علوي", "خزان أرضي فقط", "خزان علوي فقط"]} value={tankType} onChange={setTankType} /></div>}
      {is("pest") && <div className="space-y-2 rounded-xl bg-rose-50/70 p-3"><p className="text-[11px] font-bold text-rose-900">الحشرات المستهدفة والضمان</p><ChatMultiChoices options={["صراصير", "نمل زاحف", "بق الفراش", "العتة", "نمل أبيض (رمة)", "قوارض وفئران"]} values={pestTypes} onToggle={(value) => toggleValue(pestTypes, value, setPestTypes)} /><ChatChoices options={["ضمان 12 شهراً ورش مجاني", "ضمان 6 أشهر", "أحتاج توصية الفريق"]} value={pestWarranty} onChange={setPestWarranty} /></div>}
      {is("postcon") && <div className="space-y-2 rounded-xl bg-orange-50/70 p-3"><p className="text-[11px] font-bold text-orange-900">تفاصيل ما بعد البناء والتشطيب</p><ChatCounter label="مساحة العقار" value={postconMeters} suffix="م²" onChange={setPostconMeters} /><ChatMultiChoices options={["إزالة بقايا الإسمنت", "إزالة الدهانات", "إزالة الترويبة", "تلميع البلاط والشبابيك"]} values={postconTasks} onToggle={(value) => toggleValue(postconTasks, value, setPostconTasks)} /></div>}
      {is("facades") && <div className="space-y-2 rounded-xl bg-blue-50/70 p-3"><p className="text-[11px] font-bold text-blue-900">تفاصيل الواجهة</p><ChatChoices options={["زجاج", "كلادينج", "حجر"]} value={facadeMaterial} onChange={setFacadeMaterial} /><ChatCounter label="عدد الأدوار" value={facadeFloors} min={1} onChange={setFacadeFloors} /></div>}
      {is("facilities") && <div className="space-y-2 rounded-xl bg-emerald-50/70 p-3">
        <p className="text-[11px] font-bold text-emerald-900">تفاصيل المنشأة</p>
        <ChatChoices options={["مسجد / مصلى جامع", "مدرسة", "مكتب / منشأة"]} value={facilityType} onChange={setFacilityType} />
        <ChatCounter label="مساحة المنشأة" value={facilityArea} suffix="م²" onChange={setFacilityArea} />
        {facilityType === "مسجد / مصلى جامع" && <><ChatCounter label="مساحة موكيت المصلى / السجاد" value={facilityCarpet} suffix="م²" onChange={setFacilityCarpet} /><ChatCounter label="عدد المصليات / قاعات الصلاة" value={prayerHalls} min={1} onChange={setPrayerHalls} /><ChatCounter label="عدد وحدات الوضوء" value={ablutionUnits} onChange={setAblutionUnits} /><ChatCounter label="عدد دورات المياه" value={facilityBathrooms} onChange={setFacilityBathrooms} /><ChatCounter label="مساحة الساحات الخارجية" value={facilityCourtyard} suffix="م²" onChange={setFacilityCourtyard} /><ChatChoices options={["تنظيف شامل للمصلى والمرافق", "غسيل موكيت وتعقيم فقط", "تنظيف دوري للمرافق"]} value={facilityScope} onChange={setFacilityScope} /></>}
        {facilityType === "مدرسة" && <><ChatCounter label="مساحة السجاد والموكيت" value={facilityCarpet} suffix="م²" onChange={setFacilityCarpet} /><ChatCounter label="عدد المباني" value={schoolBuildings} min={1} onChange={setSchoolBuildings} /><ChatCounter label="عدد الفصول" value={schoolClassrooms} onChange={setSchoolClassrooms} /><ChatCounter label="عدد دورات المياه" value={schoolBathrooms} onChange={setSchoolBathrooms} /><ChatCounter label="مساحة الملاعب / الساحات" value={schoolCourtyard} suffix="م²" onChange={setSchoolCourtyard} /><ChatChoices options={["تنظيف الفصول والممرات", "تنظيف شامل مع التعقيم", "تنظيف الساحات والمرافق فقط"]} value={schoolScope} onChange={setSchoolScope} /></>}
        {facilityType === "مكتب / منشأة" && <><ChatCounter label="مساحة السجاد والموكيت" value={facilityCarpet} suffix="م²" onChange={setFacilityCarpet} /><ChatCounter label="عدد الأدوار" value={officeFloors} min={1} onChange={setOfficeFloors} /><ChatCounter label="عدد المكاتب والغرف" value={officeRooms} onChange={setOfficeRooms} /><ChatCounter label="عدد غرف الاجتماعات" value={meetingRooms} onChange={setMeetingRooms} /><ChatCounter label="عدد دورات المياه" value={officeBathrooms} onChange={setOfficeBathrooms} /><ChatChoices options={["تنظيف شامل لمرة واحدة", "تنظيف دوري أسبوعي", "عقد تنظيف يومي"]} value={officeFrequency} onChange={setOfficeFrequency} /></>}
      </div>}
      <div className="space-y-2">
        <p className="text-[11px] font-bold text-gray-700">خدمات إضافية مكملة (اختياري)</p>
        {addons.map((addon) => (
          <div key={addon}>
            <button type="button" onClick={() => toggle(addon)} className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-[10px] transition-colors ${addOns.includes(addon) ? "border-primary bg-primary/10 font-bold text-primary" : "border-gray-200 bg-white text-gray-700"}`}>
              <span className="flex items-center gap-1.5">{addOns.includes(addon) ? <CheckSquare size={13} /> : <Square size={13} />}{addon}</span>
              <span>{addOns.includes(addon) ? "محددة" : "+ إضافة"}</span>
            </button>
            {addOns.includes(addon) && addon === "غسيل وتنظيف مكيفات الهواء" && <div className="mr-3 space-y-1 rounded-lg bg-cyan-50 p-2"><ChatCounter label="سبلت" value={addonAcSplit} onChange={setAddonAcSplit} /><ChatCounter label="شباك" value={addonAcWindow} onChange={setAddonAcWindow} /><ChatCounter label="مخفي / مركزي" value={addonAcConcealed} onChange={setAddonAcConcealed} /></div>}
            {addOns.includes(addon) && addon === "غسيل وتطهير مجالس وكنب بالبخار" && <div className="mr-3 space-y-1 rounded-lg bg-purple-50 p-2"><ChatCounter label="أطقم المجالس" value={addonMajlisSets} min={1} onChange={setAddonMajlisSets} /><ChatCounter label="أطقم الكنب" value={addonSofaSets} onChange={setAddonSofaSets} /><ChatCounter label="السجاد والموكيت" value={addonCarpetMeters} suffix="م²" onChange={setAddonCarpetMeters} /></div>}
            {addOns.includes(addon) && addon === "تنظيف وتطهير خزان المياه الأرضي والعلوي" && <div className="mr-3 rounded-lg bg-teal-50 p-2"><ChatChoices options={["خزان أرضي + علوي", "خزان أرضي فقط", "خزان علوي فقط"]} value={addonTankType} onChange={setAddonTankType} /></div>}
            {addOns.includes(addon) && addon === "رش مبيدات ومكافحة الحشرات بضمان" && <div className="mr-3 space-y-1 rounded-lg bg-rose-50 p-2"><ChatMultiChoices options={["صراصير", "بق الفراش", "نمل أبيض (رمة)", "قوارض وفئران"]} values={addonPestTypes} onToggle={(value) => toggleValue(addonPestTypes, value, setAddonPestTypes)} /><ChatChoices options={["ضمان 12 شهراً", "ضمان 6 أشهر", "أحتاج توصية الفريق"]} value={addonPestWarranty} onChange={setAddonPestWarranty} /></div>}
            {addOns.includes(addon) && addon === "جلي وتلميع رخام وسيراميك بالألماس" && <div className="mr-3 space-y-1 rounded-lg bg-yellow-50 p-2"><ChatChoices options={["رخام", "سيراميك", "بلاط"]} value={addonMarbleMaterial} onChange={setAddonMarbleMaterial} /><ChatCounter label="المساحة" value={addonMarbleMeters} suffix="م²" onChange={setAddonMarbleMeters} /></div>}
            {addOns.includes(addon) && addon === "تنظيف وتطهير المسبح والفلتر" && <div className="mr-3 rounded-lg bg-blue-50 p-2"><ChatChoices options={["مسبح فيلا متوسط", "مسبح قصر / مجمع كبير"]} value={addonPoolSize} onChange={setAddonPoolSize} /></div>}
          </div>
        ))}
      </div>
      <button type="button" onClick={submit} className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-primary/90">متابعة اختيار الموقع والموعد</button>
    </div>
  )
}

function DateTimePickerInChat({ onSend }: { onSend: (value: string) => void }) {
  const [value, setValue] = useState("")
  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minValue = new Date(minDate.getTime() - minDate.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)

  return (
    <div className="shrink-0 space-y-2 border-t border-gray-100 bg-white px-3 py-3">
      <p className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
        <CalendarClock size={12} className="text-primary" /> اختر تاريخ ووقت الموعد
      </p>
      <div className="flex gap-2">
        <Input
          type="datetime-local"
          min={minValue}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="h-10 flex-1 rounded-xl bg-gray-50 text-xs"
        />
        <Button
          type="button"
          disabled={!value}
          onClick={() => onSend(value)}
          className="h-10 rounded-xl bg-primary px-4 text-xs font-bold text-white"
        >
          متابعة
        </Button>
      </div>
      <p className="text-[10px] text-gray-400">الموعد المطلوب خاضع لتأكيد فريقنا.</p>
    </div>
  )
}

// ─── Order Confirm Card ───────────────────────────────────────────────────

function OrderConfirmCard({
  data, onConfirm, onEdit,
}: {
  data: Record<string, unknown>
  onConfirm: () => void
  onEdit: () => void
}) {
  const rows = [
    { label: "الخدمة",  value: data.serviceType  as string, icon: <Package size={12} /> },
    ...(data.packageSize ? [{ label: "الباقة", value: data.packageSize as string, icon: <Package size={12} /> }] : []),
    ...(data.appointmentType ? [{ label: "نوع الطلب", value: data.appointmentType === "scheduled" ? "موعد مسبق" : "طلب فوري", icon: <Zap size={12} /> }] : []),
    ...(data.scheduledAt ? [{ label: "الموعد", value: data.scheduledAt as string, icon: <CalendarClock size={12} /> }] : []),
    ...(data.duration ? [{ label: "المدة", value: data.duration as string, icon: <Clock size={12} /> }] : []),
    ...(data.activityType  ? [{ label: "النشاط",  value: data.activityType  as string, icon: <Package size={12} /> }] : []),
    ...(data.monthlyEvacuations ? [{ label: "التفريغات", value: `${data.monthlyEvacuations} / شهر`, icon: <Package size={12} /> }] : []),
    ...(data.packageDetailsText ? [{ label: "تفاصيل الباقة", value: data.packageDetailsText as string, icon: <FileText size={12} /> }] : []),
    ...(data.notes ? [{ label: "الملاحظات", value: data.notes as string, icon: <FileText size={12} /> }] : []),
    { label: "الموقع",  value: data.location      as string, icon: <MapPin size={12} /> },
    { label: "الاسم",   value: data.name           as string, icon: <User size={12} /> },
    { label: "الجوال",  value: data.phone          as string, icon: <Phone size={12} /> },
  ].filter(r => r.value)

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mt-2">
      <div className="bg-gradient-to-l from-primary/5 to-primary/10 border-b border-primary/10 px-4 py-2.5">
        <p className="text-primary font-bold text-xs flex items-center gap-1.5">
          <Package size={13} /> مراجعة طلبك
        </p>
      </div>
      <div className="p-4 space-y-2.5">
        {rows.map(({ label, value, icon }) => (
          <div key={label} className="flex items-start gap-2.5 text-xs">
            <span className="text-primary mt-0.5 shrink-0">{icon}</span>
            <span className="text-gray-400 shrink-0 w-14">{label}</span>
            <span className="text-gray-800 font-medium flex-1 text-right">{value}</span>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-gray-100 flex gap-2">
        <Button
          onClick={onConfirm}
          className="flex-1 h-9 text-xs bg-primary hover:bg-primary/90 text-white rounded-xl"
        >
          <CheckCircle size={13} className="ml-1.5" /> تأكيد الطلب
        </Button>
        <Button
          onClick={onEdit}
          variant="outline"
          className="h-9 px-4 text-xs rounded-xl border-gray-200 text-gray-600 hover:border-primary/30"
        >
          تعديل
        </Button>
      </div>
    </div>
  )
}

// ─── Success Card ─────────────────────────────────────────────────────────

function SuccessCard({ data, orderTrackingEnabled }: {
  data: Record<string, unknown>
  orderTrackingEnabled: boolean
}) {
  const openTracking = () => {
    window.dispatchEvent(new CustomEvent("openTrackingModal"))
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 text-center mt-2">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 14 }}
        className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-200"
      >
        <CheckCircle size={28} className="text-white" />
      </motion.div>
      <h3 className="font-bold text-gray-900 text-sm mb-2">تم إرسال طلبك! 🎉</h3>
      <div className="bg-white rounded-2xl px-4 py-2 mb-3 inline-block shadow-sm border border-green-100">
        <p className="text-[10px] text-gray-400">رقم الطلب</p>
        <p className="text-2xl font-black text-primary">#{data.orderId as number}</p>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mb-3">سيتواصل معك فريقنا قريباً لتأكيد التفاصيل.</p>

      {/* Track order CTA */}
      {orderTrackingEnabled && (
        <button
          onClick={openTracking}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white text-xs font-bold py-2.5 rounded-xl hover:bg-primary/90 active:scale-95 transition-all duration-150 shadow-md shadow-primary/20 mb-3"
        >
          <Search size={13} />
          تتبع طلبك الآن
        </button>
      )}

    </div>
  )
}

// ─── Location Picker (in-chat) ────────────────────────────────────────────

function LocationPickerInChat({ onSend }: { onSend: (loc: string) => void }) {
  const [address,   setAddress]   = useState("")
  const [gpsState,  setGpsState]  = useState<"idle" | "loading" | "map" | "error">("idle")
  const [gpsLabel,  setGpsLabel]  = useState("")
  const [initCoords, setInitCoords] = useState<{ lat: number; lng: number } | null>(null)

  const getGPS = async () => {
    setGpsState("loading")
    setGpsLabel("جاري تحديد موقعك...")
    try {
      const pos = await getHighAccuracyPosition()
      const lat = +pos.coords.latitude.toFixed(6)
      const lng = +pos.coords.longitude.toFixed(6)
      setInitCoords({ lat, lng })
      setGpsState("map")
    } catch {
      setGpsState("error")
    }
  }

  const handleMapConfirm = (addr: string) => {
    setAddress(addr)
    setGpsState("idle")
  }

  // في وضع الخريطة: تُعرض الخريطة التفاعلية فقط
  if (gpsState === "map" && initCoords) {
    return (
      <div className="shrink-0 border-t border-gray-100 bg-white px-3 pt-3 pb-3">
        <p className="text-[11px] text-primary font-semibold flex items-center gap-1.5 mb-2">
          <Navigation size={11} /> اسحب الدبوس إلى مبناك بالضبط ثم اضغط «تأكيد»
        </p>
        <DraggableMapPicker
          initialLat={initCoords.lat}
          initialLng={initCoords.lng}
          onConfirm={(addr, lat, lng) => {
            // نُضمّن الإحداثيات مع العنوان للاتجاهات الدقيقة
            const fullLocation = `${addr}\nإحداثيات GPS: ${lat},${lng}`
            handleMapConfirm(fullLocation)
            onSend(fullLocation)
          }}
          compact
        />
      </div>
    )
  }

  return (
    <div className="shrink-0 border-t border-gray-100 bg-white px-3 pt-3 pb-3 space-y-2">
      <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1.5">
        <MapPin size={11} className="text-primary" /> أين تحتاج إيصال الخدمة؟
      </p>

      <div className="relative">
        <MapPin size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && address.trim() && onSend(address.trim())}
          placeholder="مثال: الرياض - حي الملقا..."
          className="w-full pr-8 pl-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={getGPS}
          disabled={gpsState === "loading"}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold rounded-xl border border-primary/30 text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-60"
        >
          {gpsState === "loading"
            ? <><Loader2 size={11} className="animate-spin" /> {gpsLabel}</>
            : <><Navigation size={11} /> تحديد موقعي على الخريطة</>}
        </button>
        <button
          type="button"
          onClick={() => address.trim() && onSend(address.trim())}
          disabled={!address.trim()}
          className="px-5 py-2 text-[11px] font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition disabled:opacity-40"
        >
          إرسال
        </button>
      </div>

      {gpsState === "error" && (
        <p className="text-[10px] text-red-500 flex items-center gap-1">
          <AlertCircle size={10} /> تعذّر الموقع، أدخله يدوياً
        </p>
      )}
    </div>
  )
}

// ─── Message Bubble ───────────────────────────────────────────────────────

function MessageBubble({
  msg, onOptionSelect, onPackageDetailsSubmit, onConfirmOrder, onEditOrder,
  orderTrackingEnabled,
}: {
  msg: BotMessage
  onOptionSelect: (v: string, l: string) => void
  onPackageDetailsSubmit: (payload: PackageDetailsPayload) => void
  onConfirmOrder: () => void
  onEditOrder: () => void
  orderTrackingEnabled: boolean
}) {
  if (msg.isUser) {
    return (
      <div className="flex justify-end mb-3">
        <div className="max-w-[78%] px-4 py-2.5 rounded-2xl rounded-br-sm bg-primary text-white text-sm shadow-sm leading-relaxed">
          {msg.text}
        </div>
      </div>
    )
  }

  const renderText = (text?: string) =>
    (text || "").split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith("**") && part.endsWith("**")
        ? <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>
        : part,
    )

  const isInteractive = ["options", "service_cards", "container_cards", "package_detail", "package_form"].includes(msg.type)

  return (
    <div className="flex justify-start mb-3 max-w-[92%]">
      <div className="flex-1">
        {/* Text bubble */}
        {msg.type !== "order_confirm" && msg.type !== "success" && (
          <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm text-sm text-gray-800 leading-relaxed whitespace-pre-line">
            {renderText(msg.text)}
          </div>
        )}

        {/* Locked selection chip */}
        {msg.locked && msg.selectedLabel && (
          <div className="flex items-center gap-2 mt-1.5 mr-1">
            <span className="flex items-center gap-1.5 text-[11px] text-primary bg-primary/8 border border-primary/15 px-2.5 py-1 rounded-full font-semibold">
              <CheckCircle size={10} />
              {msg.selectedLabel}
            </span>
            <button
              onClick={onEditOrder}
              className="text-[10px] text-gray-400 hover:text-primary flex items-center gap-0.5 transition-colors"
            >
              <Pencil size={9} />
              تعديل
            </button>
          </div>
        )}

        {/* Interactive elements — hidden when locked */}
        {!msg.locked && isInteractive && (
          <>
            {msg.type === "options" && msg.options && (
              <OptionsGrid options={msg.options} onSelect={onOptionSelect} />
            )}
            {msg.type === "service_cards" && msg.cards && (
              <ServiceCardGrid cards={msg.cards as ServiceCard[]} onSelect={onOptionSelect} />
            )}
            {msg.type === "container_cards" && msg.cards && (
              <CleaningPackageCardList cards={msg.cards as CleaningPackageCard[]} onSelect={onOptionSelect} />
            )}
            {msg.type === "package_detail" && msg.packageData && (
              <>
                <PackageDetailCard card={msg.packageData} />
                {msg.options && <OptionsGrid options={msg.options} onSelect={onOptionSelect} />}
              </>
            )}
            {msg.type === "package_form" && msg.packageForm && (
              <PackageDetailsForm
                category={msg.packageForm.category}
                serviceType={msg.packageForm.serviceType}
                onSubmit={onPackageDetailsSubmit}
                locked={msg.locked}
              />
            )}
          </>
        )}

        {/* Order confirm card */}
        {msg.type === "order_confirm" && msg.orderData && (
          <OrderConfirmCard
            data={msg.orderData}
            onConfirm={onConfirmOrder}
            onEdit={onEditOrder}
          />
        )}

        {/* Success card */}
        {msg.type === "success" && msg.orderData && (
          <SuccessCard data={msg.orderData} orderTrackingEnabled={orderTrackingEnabled} />
        )}
      </div>
    </div>
  )
}

// ─── Main Widget ──────────────────────────────────────────────────────────

export function AIChatbotWidget({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const { companyName, orderTrackingEnabled } = useSiteSettings()
  const [isOpen,        setIsOpen]        = useState(false)
  const [hasOpened,     setHasOpened]     = useState(false)
  const [messages,      setMessages]      = useState<BotMessage[]>([])
  const [input,         setInput]         = useState("")
  const [isTyping,      setIsTyping]      = useState(false)
  const [flowState,     setFlowState]     = useState<FlowState>({ step: "welcome", data: {} })
  const [conversationId, setConversationId] = useState<number | null>(loadAiConversationId)
  const [unread,        setUnread]        = useState(1)
  const [liveChatOpen,  setLiveChatOpen]  = useState(false)
  const [supportStatus, setSupportStatus] = useState("unavailable")
  const [requestsLocked, setRequestsLocked] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
  }, [])

  // Fetch settings every 60s
  useEffect(() => {
    const load = () =>
      fetchSettings().then((s) => {
        setSupportStatus(s.support_status || "unavailable")
        setRequestsLocked(s.requests_locked === "true")
      })
    load()
    const id = setInterval(load, 60000)
    return () => clearInterval(id)
  }, [])

  const botDisabled = supportStatus === "available"

  // Load/reload welcome
  const loadWelcome = useCallback(() => {
    setMessages([])
    setFlowState({ step: "welcome", data: {} })
    setInput("")
    setIsTyping(true)
    getWelcome()
      .then((resp) => {
        setIsTyping(false)
        if (resp && resp.reply) {
          addBotMessage(resp)
          setFlowState(resp.flowState || { step: "welcome", data: {} })
        } else {
          addBotMessage({
            reply: `أهلاً وسهلاً بك في ${companyName}! 👋\nيسعدنا خدمتك، كيف نقدر نساعدك اليوم؟`,
            messageType: "options",
            options: [
              { label: "اطلب خدمة الآن", value: "order", emoji: "📦" },
              { label: "طلب عرض سعر", value: "quote", emoji: "📋" },
            ],
            flowState: { step: "main_menu", data: {} },
          })
          setFlowState({ step: "main_menu", data: {} })
        }
      })
      .catch(() => {
        setIsTyping(false)
        addBotMessage({
          reply: `أهلاً وسهلاً بك في ${companyName}! 👋\nيسعدنا خدمتك، كيف نقدر نساعدك اليوم؟`,
          messageType: "options",
          options: [
            { label: "اطلب خدمة الآن", value: "order", emoji: "📦" },
            { label: "طلب عرض سعر", value: "quote", emoji: "📋" },
          ],
          flowState: { step: "main_menu", data: {} },
        })
        setFlowState({ step: "main_menu", data: {} })
      })
  }, [companyName])

  useEffect(() => {
    if (isOpen && !hasOpened && !botDisabled) {
      setHasOpened(true)
      setUnread(0)
      loadWelcome()
    }
    if (isOpen) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen, hasOpened, botDisabled, loadWelcome])

  useEffect(() => { scrollToBottom() }, [messages, isTyping])

  useEffect(() => {
    onOpenChange?.(isOpen || liveChatOpen)
  }, [isOpen, liveChatOpen, onOpenChange])

  useEffect(() => {
    const openAssistant = () => {
      setLiveChatOpen(false)
      setIsOpen(true)
    }
    const openSupport = () => {
      setIsOpen(false)
      setLiveChatOpen(true)
    }
    window.addEventListener("openAIChatbot", openAssistant)
    window.addEventListener("openLiveSupportChat", openSupport)
    return () => {
      window.removeEventListener("openAIChatbot", openAssistant)
      window.removeEventListener("openLiveSupportChat", openSupport)
    }
  }, [])

  // ── Helpers ──────────────────────────────────────────────────────────────

  function addBotMessage(resp: Record<string, unknown>) {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        isUser: false,
        text: resp.reply as string,
        type: (resp.messageType as MessageType) || "text",
        options:   resp.options   as OptionItem[]               | undefined,
        cards:     resp.cards     as ServiceCard[] | CleaningPackageCard[] | undefined,
        packageData: resp.packageData as CleaningPackageCard | undefined,
        packageForm: resp.packageForm as { category: string; serviceType: string } | undefined,
        orderData: resp.orderData as Record<string, unknown>    | undefined,
        timestamp: new Date(),
      },
    ])
  }

  // Lock the last interactive bot message and record what was selected
  function lockLastInteractive(selectedLabel: string) {
    setMessages((prev) => {
      const updated = [...prev]
      for (let i = updated.length - 1; i >= 0; i--) {
        const m = updated[i]
        if (!m.isUser && ["options", "service_cards", "container_cards", "package_detail", "package_form"].includes(m.type)) {
          updated[i] = { ...m, locked: true, selectedLabel }
          break
        }
      }
      return updated
    })
  }

  async function sendMessage(text: string, displayText = text) {
    if (!text.trim() || isTyping || botDisabled) return
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), isUser: true, text: displayText, type: "text", timestamp: new Date() },
    ])
    setInput("")
    setIsTyping(true)
    try {
      const resp = await sendToBot(text, flowState, conversationId)
      setIsTyping(false)
      const returnedConversationId = Number(resp?.conversationId)
      if (Number.isInteger(returnedConversationId) && returnedConversationId > 0) {
        setConversationId(returnedConversationId)
        saveAiConversationId(returnedConversationId)
      }
      addBotMessage(resp)
      if (resp.flowState) setFlowState(resp.flowState)
    } catch {
      setIsTyping(false)
      addBotMessage({
        reply: "عذراً، حدث خطأ في الاتصال. حاول مرة أخرى.",
        messageType: "options",
        options: [{ label: "العودة للقائمة", value: "menu", emoji: "🏠" }],
        flowState,
      })
    }
  }

  async function handleOptionSelect(value: string, label: string) {
    lockLastInteractive(label)
    if (value === "menu" || value === "القائمة الرئيسية") {
      loadWelcome()
      return
    }
    if (value === "done") {
      setMessages((prev) => [
        ...prev,
         { id: crypto.randomUUID(), isUser: false, text: `شكراً لتواصلك مع ${companyName}! 😊`, type: "text", timestamp: new Date() },
      ])
      return
    }
    // Send value to backend but display nice Arabic label in the chat bubble
    await sendMessage(value, label)
  }

  async function handleConfirmOrder() {
    await sendMessage("تأكيد")
  }

  async function handlePackageDetailsSubmit(payload: PackageDetailsPayload) {
    lockLastInteractive("تم إدخال تفاصيل الباقة")
    await sendMessage(`__package_details__${JSON.stringify(payload)}`, "تم إدخال تفاصيل الباقة")
  }

  // Edit = restart conversation
  function handleEditOrder() {
    loadWelcome()
  }

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    sendMessage(input)
  }

  // ── Input area: what to show based on current step ────────────────────────

  const step = flowState?.step || "welcome"
  const showLocationPicker = (step === "collect_location" || step === "location") && !isTyping
  const showDatePicker     = (step === "collect_scheduled_at" || step === "date_select") && !isTyping
  const showTextInput      = (step === "collect_notes" || step === "collect_name" || step === "collect_phone" || step === "name" || step === "phone" || step === "collect_activity") && !isTyping
  // Show hint bar when user should be clicking buttons (not typing)
  const hasUnlockedInteractive = messages.some(
    (m) => !m.isUser && !m.locked && ["options", "service_cards", "container_cards", "package_detail", "package_form"].includes(m.type),
  )
  const showHint = !showLocationPicker && !showDatePicker && !showTextInput && !isTyping && hasUnlockedInteractive

  const inputPlaceholder =
    step === "collect_notes"  ? "اكتب ملاحظاتك أو اضغط تخطي..." :
    (step === "collect_name" || step === "name")  ? "اكتب اسمك الكريم..." :
    (step === "collect_phone" || step === "phone") ? "مثال: 05XXXXXXXX"      :
                               "اكتب رسالتك..."

  // ── Render ────────────────────────────────────────────────────────────────

  const isAnyOpen = liveChatOpen || (!botDisabled && isOpen)

  return (
    <>
      {/* Live Support Panel */}
      <AnimatePresence>
        {liveChatOpen && (
          <LiveSupportChat onClose={() => setLiveChatOpen(false)} />
        )}
      </AnimatePresence>

      {/* AI Bot Panel */}
      <AnimatePresence>
        {!botDisabled && isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed bottom-24 left-4 sm:left-6 z-[65] w-[340px] sm:w-[390px] max-w-[calc(100vw-2rem)] bg-gray-50 border border-gray-200 shadow-2xl rounded-3xl overflow-hidden flex flex-col"
            style={{ maxHeight: "calc(100vh - 130px)", minHeight: 480 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-l from-primary to-primary/80 px-4 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                    <Bot size={20} className="text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-primary rounded-full bg-green-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    المساعد الذكي
                    <span className="text-[9px] bg-white/15 text-white/90 px-1.5 py-0.5 rounded-full border border-white/20 font-normal tracking-wider">AI</span>
                  </h3>
                  <p className="text-[11px] text-white/60 flex items-center gap-1 mt-0.5">
                     <Sparkles size={9} /> {companyName} — خدمة 24/7
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/50 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-xl"
              >
                <X size={17} />
              </button>
            </div>

            {/* Busy banner */}
            {supportStatus === "busy" && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-[11px] font-medium shrink-0">
                <Headphones size={11} /> الدعم مشغول حالياً — البوت يساعدك
              </div>
            )}

            {/* Requests locked banner */}
            {requestsLocked && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-100 text-[11px] text-amber-700 font-medium shrink-0">
                <Lock size={11} /> الطلبات مغلقة مؤقتاً
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-4">
              {messages.length === 0 && !isTyping && (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
                  <div className="w-16 h-16 bg-primary/8 rounded-2xl flex items-center justify-center">
                    <Bot size={28} className="text-primary/30" />
                  </div>
                  <p className="text-sm text-gray-300">جاري تحميل المساعد...</p>
                </div>
              )}

              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  onOptionSelect={handleOptionSelect}
                  onPackageDetailsSubmit={handlePackageDetailsSubmit}
                  onConfirmOrder={handleConfirmOrder}
                  onEditOrder={handleEditOrder}
                  orderTrackingEnabled={orderTrackingEnabled}
                />
              ))}

              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {showLocationPicker ? (
              <LocationPickerInChat onSend={(loc) => sendMessage(loc)} />
            ) : showDatePicker ? (
              <DateTimePickerInChat onSend={(date) => sendMessage(date)} />
            ) : showTextInput ? (
              <div className="shrink-0 border-t border-gray-100 bg-white px-3 py-3">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={inputPlaceholder}
                    className="flex-1 rounded-2xl text-sm bg-gray-50 border-gray-200 focus-visible:ring-primary/40 h-10"
                    disabled={isTyping}
                  />
                  {step === "collect_notes" && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => sendMessage("__skip_notes")}
                      disabled={isTyping}
                      className="h-10 shrink-0 rounded-2xl border-gray-200 px-3 text-xs text-gray-600"
                    >
                      تخطي
                    </Button>
                  )}
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || isTyping}
                    className="rounded-2xl shrink-0 h-10 w-10 bg-primary hover:bg-primary/90 text-white shadow-sm"
                  >
                    <Send size={14} className="rtl:-scale-x-100" />
                  </Button>
                </form>
                <p className="text-center text-[10px] text-gray-300 mt-2">
                   مدعوم بالذكاء الاصطناعي · {companyName}
                </p>
              </div>
            ) : showHint ? (
              <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-2.5 text-center">
                <p className="text-[11px] text-gray-300">☝️ اختر من الخيارات أعلاه</p>
              </div>
            ) : messages.length > 0 && step === "done" ? (
              <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-2.5 text-center">
                 <p className="text-[10px] text-gray-300">مدعوم بالذكاء الاصطناعي · {companyName}</p>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle FAB */}
      <motion.button
        onClick={() => botDisabled ? setLiveChatOpen((v) => !v) : setIsOpen((v) => !v)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
         className={`fixed bottom-6 left-4 sm:left-6 z-50 h-14 w-14 rounded-2xl text-white shadow-xl flex items-center justify-center ${
           botDisabled
             ? "bg-green-600 shadow-green-500/30"
             : "bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 shadow-indigo-500/35"
        }`}
      >
        <AnimatePresence mode="wait">
          {isAnyOpen ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={22} />
            </motion.div>
          ) : botDisabled ? (
            <motion.div key="support" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Headphones size={22} />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Bot size={24} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        {!isAnyOpen && unread > 0 && !botDisabled && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
            <span className="relative inline-flex rounded-full h-5 w-5 bg-secondary text-white text-[10px] font-bold items-center justify-center border-2 border-primary">
              {unread}
            </span>
          </span>
        )}

        {/* Live support pulse */}
        {botDisabled && !liveChatOpen && (
          <span className="absolute inset-0 rounded-2xl animate-ping bg-green-400 opacity-25" />
        )}
      </motion.button>
    </>
  )
}
