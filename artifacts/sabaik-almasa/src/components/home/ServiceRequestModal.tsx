import { useState, useEffect, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X, ChevronRight, ChevronLeft, MapPin, Navigation, CheckCircle, Package,
  Phone, User, Loader2, AlertCircle, Building2, Home, Sparkles, Wind, Bug,
  Droplets, Waves, Gem, Briefcase, HardHat, Mail, FileText, Lock, Calendar, Clock, Zap,
  CalendarClock, Trash2, ClipboardList, HelpCircle, Plus, Minus, ShieldCheck,
  CheckSquare, Square, Wrench
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useServiceRequest } from "@/context/ServiceRequestContext"
import { useSiteSettings } from "@/context/SiteSettingsContext"
import { DraggableMapPicker } from "@/components/ui/DraggableMapPicker"
import { getHighAccuracyPosition } from "@/lib/reverseGeocode"
import { useGetPackages } from "@workspace/api-client-react"
import { getVisitorTracking } from "@/lib/visitorAttribution"
import {
  SafetyComplianceDetails,
  summarizeSafetyCompliance,
  type SafetyComplianceFormState,
} from "@/components/home/SafetyComplianceDetails"

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || ""

// ─── Data & Config ────────────────────────────────────────────────────────────

// ─── Data & Config ────────────────────────────────────────────────────────────

const SERVICE_TYPES = [
  { id: "تنظيف الشقق السكنية", label: "تنظيف الشقق السكنية", icon: Building2, desc: "تنظيف عميق وتطهير شامل للشقق بجميع المساحات", color: "from-blue-500/20 to-blue-600/10 border-blue-200 text-blue-700" },
  { id: "تنظيف الفلل السكنية", label: "تنظيف الفلل السكنية", icon: Home, desc: "تنظيف الفلل (الأدوار، الأحواش، الدرج، والزجاج)", color: "from-emerald-500/20 to-emerald-600/10 border-emerald-200 text-emerald-700" },
  { id: "تنظيف القصور والمجمعات", label: "تنظيف القصور والمجمعات", icon: Sparkles, desc: "تنظيف ملكي شامل للأجنحة، الثريات، الحدائق، والمباني الضخمة", color: "from-amber-500/20 to-amber-600/10 border-amber-200 text-amber-700" },
  { id: "تنظيف قبل وبعد النقل والترميم", label: "تنظيف قبل/بعد النقل والترميم", icon: Briefcase, desc: "تطهير وتعقيم العقار قبل الانتقال السكني أو بعد الرحيل", color: "from-indigo-500/20 to-indigo-600/10 border-indigo-200 text-indigo-700" },
  { id: "غسيل المجالس والكنب", label: "غسيل المجالس والكنب بالبخار", icon: Sparkles, desc: "بخار حراري 140° مع التطهير والتجفيف السريع في 30 دقيقة", color: "from-purple-500/20 to-purple-600/10 border-purple-200 text-purple-700" },
  { id: "جلي وتلميع الرخام", label: "جلي وتلميع الرخام والبلاط", icon: Gem, desc: "جلي بالألماس وتلميع بالكريستال الإيطالي لمعان ناصع", color: "from-yellow-500/20 to-yellow-600/10 border-yellow-200 text-yellow-700" },
  { id: "تنظيف وتطهير الخزانات", label: "تنظيف وتطهير خزانات المياه", icon: Droplets, desc: "غسيل الخزان الأرضي والعلوي بالضغط والتطهير بالكلور", color: "from-teal-500/20 to-teal-600/10 border-teal-200 text-teal-700" },
  { id: "تنظيف وغسيل المكيفات", label: "غسيل وتنظيف المكيفات", icon: Wind, desc: "غسيل سبلت ومخفي بالضغط العالي بجراب الحماية المائي", color: "from-cyan-500/20 to-cyan-600/10 border-cyan-200 text-cyan-700" },
  { id: "مكافحة وإبادة الحشرات", label: "مكافحة وإبادة الحشرات والرش", icon: Bug, desc: "إبادة الصراصير، البق، النمل الأبيض والقوارض بضمان سنة", color: "from-rose-500/20 to-rose-600/10 border-rose-200 text-rose-700" },
  { id: "تنظيف بعد البناء والتشطيب", label: "تنظيف بعد البناء والتشطيب", icon: HardHat, desc: "إزالة بقايا الإسمنت والدهانات وتلميع البلاط والشبابيك", color: "from-orange-500/20 to-orange-600/10 border-orange-200 text-orange-700" },
  { id: "واجهات المباني والمكاتب", label: "واجهات المباني والمكاتب والشركات", icon: Building2, desc: "غسيل الواجهات الزجاجية والكلادينج وعقود نظافة المؤسسات", color: "from-blue-600/20 to-blue-700/10 border-blue-300 text-blue-800" },
  { id: "تنظيف المساجد والمدارس", label: "تنظيف المساجد والمدارس والمنشآت", icon: Home, desc: "غسيل موكيت المساجد والمرافق التعليمية والتطهير الصحي", color: "from-emerald-600/20 to-emerald-700/10 border-emerald-300 text-emerald-800" },
  { id: "شهادة سلامة", label: "شهادة سلامة للمنشآت", icon: ShieldCheck, desc: "تجهيز ملف المنشأة والمعاينة ومتابعة الملاحظات الفنية", color: "from-teal-600/20 to-teal-700/10 border-teal-300 text-teal-800" },
  { id: "شهادة تركيب أدوات الوقاية والحماية من الحريق", label: "تركيب أدوات الوقاية والحماية من الحريق", icon: ShieldCheck, desc: "حصر وتركيب أدوات وأنظمة الوقاية والحماية حسب الموقع", color: "from-red-600/20 to-red-700/10 border-red-300 text-red-800" },
  { id: "تقرير فني فوري", label: "تقرير فني فوري", icon: ClipboardList, desc: "معاينة عاجلة ورصد حالة المنشأة والملاحظات الفنية", color: "from-amber-600/20 to-amber-700/10 border-amber-300 text-amber-800" },
  { id: "تقرير فني غير فوري", label: "تقرير فني غير فوري", icon: FileText, desc: "تقرير مجدول بعد مراجعة بيانات المنشأة ونطاق الطلب", color: "from-slate-600/20 to-slate-700/10 border-slate-300 text-slate-800" },
  { id: "عقد صيانة مع تفعيل دفاع مدني", label: "عقد صيانة مع تفعيل دفاع مدني", icon: Wrench, desc: "صيانة دورية وتقارير ومتابعة طلب التفعيل حسب الأهلية", color: "from-blue-600/20 to-blue-700/10 border-blue-300 text-blue-800" },
]

const SAFETY_SERVICE_TYPES = [
  "شهادة سلامة",
  "شهادة تركيب أدوات الوقاية والحماية من الحريق",
  "تقرير فني فوري",
  "تقرير فني غير فوري",
  "عقد صيانة مع تفعيل دفاع مدني",
  "باقة شهادة السلامة وتجهيز ملف المنشأة",
  "باقة تركيب وتجهيز أنظمة الحماية من الحريق",
  "باقة التقرير الفني الفوري",
  "باقة التقرير الفني المجدول",
  "باقة عقد صيانة أنظمة السلامة وتفعيل دفاع مدني",
]

function isSafetyService(serviceType: string) {
  const s = String(serviceType || "")
  return SAFETY_SERVICE_TYPES.includes(s)
    || s.includes("شهادة سلامة")
    || s.includes("شهادة السلامة")
    || s.includes("الوقاية والحماية من الحريق")
    || s.includes("الحماية من الحريق")
    || s.includes("التقرير الفني")
    || s.includes("تقرير فني")
    || s.includes("صيانة أنظمة السلامة")
    || s.includes("عقد صيانة مع تفعيل دفاع مدني")
    || s.includes("دفاع مدني")
    || s.includes("سلامة ودفاع مدني")
}

// باقات التنظيف الشاملة
const DEBRIS_CONTAINERS = [
  { id: "باقة تنظيف الشقق السكنية", name: "باقة تنظيف الشقق السكنية", size: "شقق ومنازل بالرياض", capacity: "شقة كاملة (غرف، مطبخ، حمامات)", priceText: "طلب عرض سعر مجاني ←", icon: Building2, best: "الشقق السكنية بالرياض", color: "bg-blue-50 text-blue-600 border-blue-200" },
  { id: "باقة تنظيف الفلل الشاملة", name: "باقة تنظيف الفلل الشاملة", size: "فلل سكنية ودوائر", capacity: "جميع الأدوار والأحواش والدرج", priceText: "طلب عرض سعر مجاني ←", icon: Home, best: "الفلل والبيوت السكنية", color: "bg-amber-50 text-amber-600 border-amber-200" },
  { id: "باقة غسيل وتنظيف المكيفات", name: "باقة غسيل وتنظيف المكيفات", size: "سبلت / مخفي / شباك", capacity: "غسيل بالضغط العالي وتطهير الفلاتر", priceText: "طلب عرض سعر مجاني ←", icon: Wind, best: "منازل وفلل ومكاتب", color: "bg-cyan-50 text-cyan-600 border-cyan-200" },
  { id: "باقة مكافحة الحشرات والرش", name: "باقة مكافحة الحشرات بضمان", size: "رش + جل ألماني", capacity: "إبادة شاملة وضمان سنة", priceText: "طلب عرض سعر مجاني ←", icon: Bug, best: "الشقق والفلل والمطاعم", color: "bg-red-50 text-red-600 border-red-200" },
]

// باقات التنظيف المتخصصة
const WASTE_CONTAINERS = [
  { id: "باقة تنظيف بعد البناء والتشطيب", name: "باقة تنظيف بعد التشطيب", size: "عقار جديد / مبنى", capacity: "إزالة الإسمنت والدهان والترويبة", priceText: "طلب عرض سعر مجاني ←", icon: HardHat, best: "المباني والفلل الجديدة", color: "bg-orange-50 text-orange-600 border-orange-200" },
  { id: "باقة غسيل المجالس بالبخار", name: "باقة غسيل المجالس بالبخار", size: "طقم مجلس + كنب + سجاد", capacity: "بخار حراري 140° وتجفيف فوري", priceText: "طلب عرض سعر مجاني ←", icon: Sparkles, best: "المجالس والصالونات", color: "bg-purple-50 text-purple-600 border-purple-200" },
  { id: "باقة جلي وتلميع الرخام", name: "باقة جلي وتلميع الرخام", size: "رخام / بلاط / سيراميك", capacity: "أقراص ألماس + كريستال إيطالي", priceText: "طلب عرض سعر مجاني ←", icon: Gem, best: "أرضيات الفلل والقصور", color: "bg-yellow-50 text-yellow-600 border-yellow-200" },
  { id: "باقة تنظيف وتطهير الخزانات", name: "باقة تنظيف الخزانات", size: "أرضي / علوي", capacity: "تطهير بالكلور وإزالة الرواسب", priceText: "طلب عرض سعر مجاني ←", icon: Droplets, best: "خزانات المنازل والشركات", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTodayString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function normalizePhone(value: string) {
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩"
  return value
    .replace(/[٠-٩]/g, digit => String(arabicDigits.indexOf(digit)))
    .replace(/[^\d+]/g, "")
}

function isValidSaudiPhone(value: string) {
  const digits = normalizePhone(value).replace(/^\+966/, "").replace(/^966/, "")
  return /^05\d{8}$/.test(digits) || /^5\d{8}$/.test(digits)
}

function getMinTime(date: string) {
  const today = getTodayString()
  if (date === today) {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 60)
    return now.toTimeString().slice(0, 5)
  }
  return "07:00"
}

function getOrderId(value: unknown): string | null {
  if (!value || typeof value !== "object") return null
  const rawId = (value as { id?: unknown }).id
  if (typeof rawId === "number" && Number.isInteger(rawId) && rawId > 0) return String(rawId)
  if (typeof rawId === "string" && /^\d+$/.test(rawId) && Number(rawId) > 0) return rawId
  return null
}

// ─── Location Picker ──────────────────────────────────────────────────────────

function LocationPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [gpsState, setGpsState] = useState<"idle" | "loading" | "map" | "error">("idle")
  const [gpsLabel, setGpsLabel] = useState("")
  const [initCoords, setInitCoords] = useState<{ lat: number; lng: number } | null>(null)

  const getGPS = async () => {
    setGpsState("loading")
    setGpsLabel("جاري فتح خريطة الرياض...")
    try {
      const pos = await getHighAccuracyPosition()
      const lat = +pos.coords.latitude.toFixed(6)
      const lng = +pos.coords.longitude.toFixed(6)
      setInitCoords({ lat, lng })
    } catch {
      // Fallback to Riyadh center (24.7136, 46.6753) on permission policy restriction
      setInitCoords({ lat: 24.7136, lng: 46.6753 })
    } finally {
      setGpsState("map")
    }
  }

  const handleMapConfirm = (address: string, lat: number, lng: number) => {
    const fullLocation = `${address}\nإحداثيات GPS: ${lat},${lng}`
    onChange(fullLocation)
    setGpsState("idle")
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <MapPin size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="مثال: الرياض - حي الملقا، شارع الأمير محمد..."
          className="pr-10 h-12 bg-gray-50 border-gray-200 text-sm"
        />
      </div>

      {gpsState !== "map" && (
        <Button type="button" variant="outline" size="sm" onClick={getGPS} disabled={gpsState === "loading"}
          className="flex items-center gap-2 text-primary border-primary/30 hover:bg-primary hover:text-white h-10 text-xs w-full">
          {gpsState === "loading" ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
          {gpsState === "loading" ? gpsLabel : "تحديد موقعي على الخريطة"}
        </Button>
      )}

      {gpsState === "error" && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={12} /> تعذّر الوصول إلى موقعك. أدخل العنوان يدوياً.
        </p>
      )}

      <AnimatePresence>
        {gpsState === "map" && initCoords && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="bg-primary/5 border border-primary/20 rounded-xl px-3 py-2 mb-2 text-xs text-primary font-semibold flex items-center gap-2">
              <Navigation size={13} className="shrink-0" />
              اسحب الدبوس إلى مبناك بالضبط ثم اضغط «تأكيد»
            </div>
            <DraggableMapPicker
              initialLat={initCoords.lat}
              initialLng={initCoords.lng}
              onConfirm={handleMapConfirm}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Step Bar ─────────────────────────────────────────────────────────────────

function StepBar({ current, total }: { current: number; total: number }) {
  const labels = ["الخدمة", "نطاق العمل", "الموقع", "التوقيت", "بياناتك"]
  return (
    <div
      className="mb-6"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current + 1}
      aria-label={`الخطوة ${current + 1} من ${total}: ${labels[current]}`}
    >
      <div className="flex items-center gap-1" dir="rtl">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-1 flex-1">
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i < current ? "bg-secondary" : i === current ? "bg-primary" : "bg-gray-200"}`} />
        </div>
      ))}
      </div>
      <div className="flex justify-between mt-2 text-[10px] font-semibold text-gray-400">
        {labels.map((label, index) => (
          <span key={label} className={index <= current ? "text-primary" : ""}>{label}</span>
        ))}
      </div>
    </div>
  )
}

const STEP_META: Record<Step, { eyebrow: string; title: string; description: string }> = {
  service: {
    eyebrow: "البداية",
    title: "ما الخدمة التي تريد ترتيبها؟",
    description: "اختر الأقرب لاحتياجك. سيستخدم الفريق هذا الاختيار لتجهيز الأسئلة المناسبة للمعاينة أو عرض السعر.",
  },
  details: {
    eyebrow: "نطاق العمل",
    title: "كمّ العمل الذي سيصل إليه الفريق",
    description: "هذه التفاصيل تقديرية وليست تسعيراً نهائياً؛ تساعدنا على فهم المكان وتجهيز الفريق المناسب.",
  },
  location: {
    eyebrow: "مكان التنفيذ",
    title: "أين يقع العقار في الرياض؟",
    description: "العنوان أو نقطة الخريطة تساعد الفريق على معرفة نطاق التغطية والتواصل معك بوضوح.",
  },
  appointment: {
    eyebrow: "التوقيت",
    title: "هل لديك توقيت مفضّل؟",
    description: "اختر طريقة المتابعة. الطلب القريب يعني تواصلاً لتنسيق أقرب وقت متاح، وليس حجزاً فورياً.",
  },
  personal: {
    eyebrow: "الخطوة الأخيرة",
    title: "كيف نتواصل معك؟",
    description: "نراجع طلبك ثم يتواصل معك الفريق لتأكيد التفاصيل والتوقيت المناسب قبل التنفيذ.",
  },
  success: {
    eyebrow: "اكتمل الإرسال",
    title: "وصل طلبك إلى الفريق",
    description: "احتفظ برقم الطلب؛ ستحتاجه عند متابعة الحالة أو عند التواصل معنا.",
  },
}

function StepIntro({ step }: { step: Step }) {
  const meta = STEP_META[step]
  return (
    <div className="mb-5">
      <p className="text-[11px] font-bold tracking-wide text-secondary mb-1">{meta.eyebrow}</p>
      <h3 className="text-xl font-black tracking-tight text-primary">{meta.title}</h3>
      <p className="text-xs leading-6 text-gray-500 mt-1.5 max-w-2xl">{meta.description}</p>
    </div>
  )
}

function RequestSummary({
  form,
  selectedPackageName,
  selectedAddOns,
}: {
  form: FormData
  selectedPackageName: string
  selectedAddOns: string[]
}) {
  const locationText = form.location.trim()
    ? form.location.split("\n")[0]
    : "لم يُحدد بعد"
  const timingText = form.appointmentType === "scheduled"
    ? form.scheduledDate
      ? `${form.scheduledDate} — ${form.scheduledTime || "09:00"}`
      : "اختر التاريخ والوقت"
    : "طلب قريب — يتواصل الفريق لتنسيق أقرب وقت متاح"

  return (
    <aside className="rounded-2xl border border-primary/15 bg-[#f5fbfa] p-4 h-fit lg:sticky lg:top-0" aria-label="ملخص الطلب">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center">
          <ClipboardList size={16} />
        </div>
        <div>
          <p className="text-sm font-black text-primary">ملخص طلبك</p>
          <p className="text-[10px] text-gray-500">يتحدث مع كل اختيار</p>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        <SummaryRow icon={<Package size={14} />} label="الخدمة" value={form.serviceType || "لم تُحدد بعد"} />
        {selectedPackageName && <SummaryRow icon={<ShieldCheck size={14} />} label="الباقة المختارة" value={selectedPackageName} />}
        <SummaryRow icon={<FileText size={14} />} label="نطاق العمل" value={selectedAddOns.length ? `${selectedAddOns.length} خدمات إضافية` : "سيُحدد من تفاصيل الخدمة"} />
        <SummaryRow icon={<MapPin size={14} />} label="الموقع" value={locationText} />
        <SummaryRow
          icon={form.appointmentType === "scheduled" ? <CalendarClock size={14} /> : <Clock size={14} />}
          label="التوقيت"
          value={timingText}
        />
      </div>

      <div className="mt-4 pt-3 border-t border-primary/10 flex gap-2 text-[11px] leading-5 text-gray-500">
        <ShieldCheck size={14} className="text-secondary shrink-0 mt-0.5" />
        <p>لا يظهر في هذا النموذج سعر أو وعد بموعد نهائي. يؤكد الفريق التفاصيل معك بعد مراجعة الطلب.</p>
      </div>
    </aside>
  )
}

function SummaryRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="w-6 h-6 rounded-lg bg-white text-secondary border border-primary/10 flex items-center justify-center shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
        <p className="font-bold text-gray-800 leading-5 break-words">{value}</p>
      </div>
    </div>
  )
}

function DetailCounter({
  label,
  value,
  onChange,
  min = 0,
  suffix,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  suffix?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-gray-600">{label}</span>
      <div className="flex items-center gap-2 shrink-0">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="w-7 h-7 rounded-lg bg-white border flex items-center justify-center text-gray-700 font-bold hover:border-primary/50">
          <Minus size={12} />
        </button>
        <span className="min-w-10 text-center font-bold text-sm">{value}{suffix ? ` ${suffix}` : ""}</span>
        <button type="button" onClick={() => onChange(value + 1)} className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center font-bold hover:bg-primary/90">
          <Plus size={12} />
        </button>
      </div>
    </div>
  )
}

function DetailChoices({
  options,
  value,
  onChange,
  columns = 2,
}: {
  options: string[]
  value: string
  onChange: (value: string) => void
  columns?: 2 | 3
}) {
  return (
    <div className={`grid ${columns === 3 ? "grid-cols-3" : "grid-cols-2"} gap-2`}>
      {options.map(option => (
        <button
          type="button"
          key={option}
          onClick={() => onChange(option)}
          className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors ${
            value === option
              ? "bg-primary text-white border-primary"
              : "bg-white text-gray-700 border-gray-200 hover:border-primary/40"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

function DetailMultiChoices({
  options,
  values,
  onToggle,
  columns = 2,
}: {
  options: string[]
  values: string[]
  onToggle: (value: string) => void
  columns?: 2 | 3
}) {
  return (
    <div className={`grid ${columns === 3 ? "grid-cols-3" : "grid-cols-2"} gap-2`}>
      {options.map(option => {
        const selected = values.includes(option)
        return (
          <button
            type="button"
            key={option}
            onClick={() => onToggle(option)}
            className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors ${
              selected
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-700 border-gray-200 hover:border-primary/40"
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

// ─── Locked State ─────────────────────────────────────────────────────────────

const API_BASE_MODAL = import.meta.env.BASE_URL?.replace(/\/$/, "") || ""

function LockedState({ message, onClose }: { message: string; onClose: () => void }) {
  const [view, setView] = useState<"locked" | "quoteForm" | "quoteSuccess">("locked")
  const [quoteForm, setQuoteForm] = useState({ name: "", phone: "", serviceType: "", packageSize: "", location: "", notes: "" })
  const [quoteErrors, setQuoteErrors] = useState<{ name?: string; phone?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quoteOrderId, setQuoteOrderId] = useState<string | null>(null)

  const handleQuoteSubmit = async () => {
    const errs: { name?: string; phone?: string } = {}
    if (!quoteForm.name.trim()) errs.name = "الاسم مطلوب"
    if (quoteForm.phone.trim().length < 9) errs.phone = "رقم الجوال غير صحيح"
    if (Object.keys(errs).length) { setQuoteErrors(errs); return }

    setIsSubmitting(true)
    try {
      const res = await fetch(`${API_BASE_MODAL}/api/service-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isQuoteRequest: true,
          clientName: quoteForm.name,
          phone: quoteForm.phone,
          serviceType: quoteForm.serviceType || "طلب عرض سعر",
          packageSize: quoteForm.packageSize || null,
          location: quoteForm.location || "غير محدد",
          notes: quoteForm.notes,
          appointmentType: "immediate",
           tracking: getVisitorTracking(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "فشل الإرسال")
      const requestId = getOrderId(data)
      if (!requestId) throw new Error("missing_request_id")
      setQuoteOrderId(requestId)
      setView("quoteSuccess")
    } catch {
      setQuoteErrors({ phone: "حدث خطأ في الإرسال. حاول مرة أخرى." })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (view === "quoteSuccess") {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
          <CheckCircle size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">تم إرسال طلب عرض السعر!</h3>
        <p className="text-xs text-gray-500 mb-4">رقم الطلب: <span className="font-bold text-primary">#{quoteOrderId}</span></p>
        <Button onClick={onClose} className="w-full h-11 bg-primary text-white font-bold rounded-xl">إغلاق</Button>
      </div>
    )
  }

  return (
    <div className="py-6 text-center space-y-4">
      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
        <Lock size={32} />
      </div>
      <h3 className="text-xl font-bold text-gray-900">الطلبات متوقفة حالياً</h3>
      <p className="text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
        {message || "عذراً، استقبال الطلبات المباشرة متوقف حالياً. يمكنك ترك بياناتك وسنقوم بالتواصل معك لتحديد عرض سعر مناسب."}
      </p>
      <Button onClick={() => setView("quoteForm")} className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-md">
        طلب عرض سعر خاص
      </Button>
    </div>
  )
}

// ─── Step Types ───────────────────────────────────────────────────────────────

type Step = "service" | "details" | "location" | "appointment" | "personal" | "success"

interface FormData {
  clientName: string
  phone: string
  email: string
  serviceType: string
  packageSize: string
  location: string
  appointmentType: "immediate" | "scheduled"
  scheduledDate: string
  scheduledTime: string
  organization: string
  activityType: string
  monthlyEvacuations: string
  notes: string
}

const BLANK_FORM: FormData = {
  clientName: "",
  phone: "",
  email: "",
  serviceType: "",
  packageSize: "",
  location: "",
  appointmentType: "immediate",
  scheduledDate: "",
  scheduledTime: "09:00",
  organization: "",
  activityType: "",
  monthlyEvacuations: "",
  notes: "",
}

const BLANK_SAFETY_FORM: SafetyComplianceFormState = {
  establishmentName: "",
  ownerName: "",
  activity: "",
  crStatus: "",
  crNumber: "",
  licenseNumber: "",
  facilityType: "",
  siteAddress: "",
  floors: "",
  approximateArea: "",
  existingSystems: [],
  requestReason: "",
  urgency: "",
  requestAuthority: "",
  installationScope: "",
  reportPurpose: "",
  documentsAvailability: "",
  maintenanceTerm: "",
  maintenanceFrequency: "",
  maintenanceResponse: "",
  civilDefenseActivationRequested: false,
  notes: "",
}

// ─── Main Modal Component ──────────────────────────────────────────────────────

export function ServiceRequestModal() {
  const { isOpen, preselect, closeModal } = useServiceRequest()
  const { companyName } = useSiteSettings()
  const { data: apiCleaningPackages } = useGetPackages()
  const [step, setStep] = useState<Step>("service")
  const [form, setForm] = useState<FormData>(BLANK_FORM)
  const [safetyForm, setSafetyForm] = useState<SafetyComplianceFormState>(BLANK_SAFETY_FORM)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  // Specialized custom details state per service category
  const [roomsCount, setRoomsCount] = useState(3)
  const [bathroomsCount, setBathroomsCount] = useState(2)
  const [kitchensCount, setKitchensCount] = useState(1)
  const [salonsCount, setSalonsCount] = useState(1)
  const [floorsCount, setFloorsCount] = useState(2)
  const [yardAreaCount, setYardAreaCount] = useState(50)
  const [splitAcCount, setSplitAcCount] = useState(4)
  const [windowAcCount, setWindowAcCount] = useState(0)
  const [concealedAcCount, setConcealedAcCount] = useState(0)
  const [majlisSetsCount, setMajlisSetsCount] = useState(1)
  const [sofaSetsCount, setSofaSetsCount] = useState(1)
  const [carpetMetersCount, setCarpetMetersCount] = useState(20)
  const [majlisFurnitureTypes, setMajlisFurnitureTypes] = useState<string[]>(["مجالس عربية", "كنب"])
  const [majlisFabricType, setMajlisFabricType] = useState("قماش")
  const [majlisCleaningLevel, setMajlisCleaningLevel] = useState("غسيل عميق وإزالة البقع")
  const [majlisCurtainsCount, setMajlisCurtainsCount] = useState(0)
  const [marbleMetersCount, setMarbleMetersCount] = useState(100)
  const [marbleMaterial, setMarbleMaterial] = useState("رخام")
  const [postconMetersCount, setPostconMetersCount] = useState(250)
  const [postconTasks, setPostconTasks] = useState<string[]>(["إزالة بقايا الإسمنت", "إزالة الدهانات", "إزالة الترويبة"])
  const [facadeFloorsCount, setFacadeFloorsCount] = useState(3)
  const [moveStatus, setMoveStatus] = useState("قبل الانتقال والسكن")
  const [propertyType, setPropertyType] = useState("فيلا سكنية")
  const [pestTypes, setPestTypes] = useState<string[]>(["صراصير"])
  const [pestWarranty, setPestWarranty] = useState("ضمان 12 شهراً ورش مجاني")
  const [tankType, setTankType] = useState("خزان أرضي + علوي")
  const [facadeMaterial, setFacadeMaterial] = useState("زجاج")
  const [facilityType, setFacilityType] = useState("مسجد / مصلى جامع")
  const [facilityAreaMeters, setFacilityAreaMeters] = useState(200)
  const [facilityCarpetMeters, setFacilityCarpetMeters] = useState(100)
  const [mosquePrayerHallsCount, setMosquePrayerHallsCount] = useState(1)
  const [mosqueAblutionUnits, setMosqueAblutionUnits] = useState(4)
  const [mosqueBathroomsCount, setMosqueBathroomsCount] = useState(2)
  const [mosqueCourtyardArea, setMosqueCourtyardArea] = useState(50)
  const [mosqueCleaningScope, setMosqueCleaningScope] = useState("تنظيف شامل للمصلى والمرافق")
  const [schoolBuildingsCount, setSchoolBuildingsCount] = useState(1)
  const [schoolClassroomsCount, setSchoolClassroomsCount] = useState(10)
  const [schoolBathroomsCount, setSchoolBathroomsCount] = useState(4)
  const [schoolCourtyardArea, setSchoolCourtyardArea] = useState(100)
  const [schoolCleaningScope, setSchoolCleaningScope] = useState("تنظيف الفصول والممرات")
  const [officeFloorsCount, setOfficeFloorsCount] = useState(1)
  const [officeRoomsCount, setOfficeRoomsCount] = useState(8)
  const [officeMeetingRoomsCount, setOfficeMeetingRoomsCount] = useState(1)
  const [officeBathroomsCount, setOfficeBathroomsCount] = useState(2)
  const [officeCleaningFrequency, setOfficeCleaningFrequency] = useState("تنظيف شامل لمرة واحدة")
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [selectedPackageName, setSelectedPackageName] = useState("")

  // Add-on specific interactive sub-states
  const [addonAcSplit, setAddonAcSplit] = useState(2)
  const [addonAcWindow, setAddonAcWindow] = useState(0)
  const [addonAcConcealed, setAddonAcConcealed] = useState(0)
  const [addonMajlisSets, setAddonMajlisSets] = useState(1)
  const [addonSofaSets, setAddonSofaSets] = useState(1)
  const [addonCarpetMeters, setAddonCarpetMeters] = useState(15)
  const [addonTankType, setAddonTankType] = useState("خزان أرضي + علوي")
  const [addonPoolSize, setAddonPoolSize] = useState("مسبح فيلا متوسط")
  const [addonPestTypes, setAddonPestTypes] = useState<string[]>(["صراصير"])
  const [addonPestWarranty, setAddonPestWarranty] = useState("ضمان 12 شهراً")
  const [addonMarbleMeters, setAddonMarbleMeters] = useState(50)
  const [addonMarbleMaterial, setAddonMarbleMaterial] = useState("رخام")

  // Settings state
  const [requestsLocked, setRequestsLocked] = useState(false)
  const [lockedMessage, setLockedMessage] = useState("")

  useEffect(() => {
    fetch(`${API_BASE}/api/settings`)
      .then(r => r.json())
      .then(s => {
        setRequestsLocked(s.requests_locked === "true")
        setLockedMessage(s.requests_locked_message || "")
      })
      .catch(() => {})
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
       const rawType: unknown = preselect.serviceType
       const safeType = typeof rawType === "string"
         ? rawType
         : (rawType && typeof rawType === "object"
           ? String((rawType as { name?: unknown; label?: unknown; title?: unknown }).name
             || (rawType as { label?: unknown }).label
             || (rawType as { title?: unknown }).title
             || "")
           : String(rawType || ""))

      const rawSize = preselect.packageSize
      const safeSize = typeof rawSize === "string" ? rawSize : String(rawSize || "")
       setSelectedPackageName(preselect.containerName || "")

      const newForm: FormData = {
        ...BLANK_FORM,
        serviceType: safeType,
        packageSize: safeSize,
         clientName: preselect.clientName || "",
         phone: preselect.phone || "",
        scheduledDate: getTodayString(),
      }
      setForm(newForm)
       setSafetyForm(BLANK_SAFETY_FORM)
      setErrors({})
      setSelectedAddOns([])
      setRoomsCount(3)
      setBathroomsCount(2)
      setKitchensCount(1)
      setSalonsCount(1)
      setFloorsCount(2)
      setYardAreaCount(50)
      setSplitAcCount(4)
      setWindowAcCount(0)
      setConcealedAcCount(0)
      setMajlisSetsCount(1)
      setSofaSetsCount(1)
      setCarpetMetersCount(20)
       setMajlisFurnitureTypes(["مجالس عربية", "كنب"])
       setMajlisFabricType("قماش")
       setMajlisCleaningLevel("غسيل عميق وإزالة البقع")
       setMajlisCurtainsCount(0)
      setMarbleMetersCount(100)
      setMarbleMaterial("رخام")
      setPostconMetersCount(250)
      setPostconTasks(["إزالة بقايا الإسمنت", "إزالة الدهانات", "إزالة الترويبة"])
      setFacadeFloorsCount(3)
      setMoveStatus("قبل الانتقال والسكن")
      setPropertyType("فيلا سكنية")
      setPestTypes(["صراصير"])
      setPestWarranty("ضمان 12 شهراً ورش مجاني")
      setTankType("خزان أرضي + علوي")
      setFacadeMaterial("زجاج")
      setFacilityType("مسجد / مصلى جامع")
      setFacilityAreaMeters(200)
      setFacilityCarpetMeters(100)
       setMosquePrayerHallsCount(1)
       setMosqueAblutionUnits(4)
       setMosqueBathroomsCount(2)
       setMosqueCourtyardArea(50)
       setMosqueCleaningScope("تنظيف شامل للمصلى والمرافق")
       setSchoolBuildingsCount(1)
       setSchoolClassroomsCount(10)
       setSchoolBathroomsCount(4)
       setSchoolCourtyardArea(100)
       setSchoolCleaningScope("تنظيف الفصول والممرات")
       setOfficeFloorsCount(1)
       setOfficeRoomsCount(8)
       setOfficeMeetingRoomsCount(1)
       setOfficeBathroomsCount(2)
       setOfficeCleaningFrequency("تنظيف شامل لمرة واحدة")
      setAddonAcSplit(2)
      setAddonAcWindow(0)
      setAddonAcConcealed(0)
      setAddonMajlisSets(1)
      setAddonSofaSets(1)
      setAddonCarpetMeters(15)
      setAddonTankType("خزان أرضي + علوي")
      setAddonPoolSize("مسبح فيلا متوسط")
      setAddonPestTypes(["صراصير"])
      setAddonPestWarranty("ضمان 12 شهراً")
      setAddonMarbleMeters(50)
      setAddonMarbleMaterial("رخام")
      if (safeType) {
        setStep("details")
      } else {
        setStep("service")
      }
      setOrderId(null)
    }
  }, [isOpen, preselect])

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  const totalSteps = 5
  const stepIndex = (() => {
    if (step === "service") return 0
    if (step === "details") return 1
    if (step === "location") return 2
    if (step === "appointment") return 3
    if (step === "personal") return 4
    return totalSteps
  })()

  const goBack = () => {
    if (step === "details") setStep("service")
    else if (step === "location") setStep("details")
    else if (step === "appointment") setStep("location")
    else if (step === "personal") setStep("appointment")
  }

  const handleSelectService = (id: string) => {
    setForm(f => ({ ...f, serviceType: id }))
    if (!isSafetyService(id)) {
      setSafetyForm(BLANK_SAFETY_FORM)
    }
    setStep("details")
  }

  const toggleAddOn = (addon: string) => {
    setSelectedAddOns(prev =>
      prev.includes(addon) ? prev.filter(a => a !== addon) : [...prev, addon]
    )
  }

  const handleDetailsNext = () => {
    setStep("location")
  }

  const handleLocationNext = () => {
    if (!form.location.trim()) {
      setErrors({ location: "الرجاء كتابة أو تحديد الموقع بالرياض" })
      return
    }
    setErrors({})
    setStep("appointment")
  }

  const handleAppointmentNext = () => {
    if (form.appointmentType === "scheduled") {
      const today = getTodayString()
      if (!form.scheduledDate || form.scheduledDate < today) {
        setErrors({ scheduledDate: "اختر تاريخاً صحيحاً من اليوم أو بعده" })
        return
      }
      if (!form.scheduledTime || form.scheduledTime < getMinTime(form.scheduledDate)) {
        setErrors({ scheduledTime: "اختر وقتاً مناسباً للموعد" })
        return
      }
    }
    setErrors({})
    setStep("personal")
  }

  const handleSubmit = async () => {
    const errs: Partial<Record<keyof FormData, string>> = {}
    if (!form.clientName.trim()) errs.clientName = "الاسم مطلوب"
    const normalizedPhone = normalizePhone(form.phone)
    if (!isValidSaudiPhone(form.phone)) errs.phone = "أدخل رقم جوال سعودي صحيح يبدأ بـ 05"
    if (Object.keys(errs).length) { setErrors(errs); return }

    setIsSubmitting(true)
    try {
      const st = String(form.serviceType || "")
      const customDetailsText = [
        isSafetyService(st) ? [
          "تفاصيل خدمة السلامة والدفاع المدني:",
          `ملخص المنشأة: ${summarizeSafetyCompliance(safetyForm)}`,
          safetyForm.establishmentName ? `اسم المنشأة: ${safetyForm.establishmentName}` : "",
          safetyForm.ownerName ? `المالك أو المسؤول: ${safetyForm.ownerName}` : "",
          safetyForm.activity ? `النشاط: ${safetyForm.activity}` : "",
          safetyForm.crStatus ? `حالة السجل أو الترخيص: ${safetyForm.crStatus}` : "",
          safetyForm.crNumber ? `رقم السجل أو الترخيص: ${safetyForm.crNumber}` : "",
          safetyForm.licenseNumber ? `رقم رخصة النشاط: ${safetyForm.licenseNumber}` : "",
          safetyForm.facilityType ? `نوع المنشأة: ${safetyForm.facilityType}` : "",
          safetyForm.siteAddress ? `عنوان الموقع المذكور في النموذج: ${safetyForm.siteAddress}` : "",
          safetyForm.floors ? `عدد الأدوار: ${safetyForm.floors}` : "",
          safetyForm.approximateArea ? `المساحة التقريبية: ${safetyForm.approximateArea} م²` : "",
          safetyForm.existingSystems.length ? `الأنظمة الموجودة: ${safetyForm.existingSystems.join("، ")}` : "",
          safetyForm.requestReason ? `سبب طلب الشهادة: ${safetyForm.requestReason}` : "",
          safetyForm.installationScope ? `نطاق التركيب: ${safetyForm.installationScope}` : "",
          safetyForm.reportPurpose ? `غرض التقرير: ${safetyForm.reportPurpose}` : "",
          safetyForm.urgency ? `درجة الاستعجال: ${safetyForm.urgency}` : "",
          safetyForm.requestAuthority ? `الجهة الطالبة: ${safetyForm.requestAuthority}` : "",
          safetyForm.documentsAvailability ? `توفر المخططات أو الشهادات السابقة: ${safetyForm.documentsAvailability}` : "",
          safetyForm.maintenanceTerm ? `مدة عقد الصيانة: ${safetyForm.maintenanceTerm}` : "",
          safetyForm.maintenanceFrequency ? `دورية الصيانة: ${safetyForm.maintenanceFrequency}` : "",
          safetyForm.maintenanceResponse ? `زمن الاستجابة المطلوب: ${safetyForm.maintenanceResponse}` : "",
          `طلب تفعيل دفاع مدني: ${safetyForm.civilDefenseActivationRequested ? "نعم" : "لا"}`,
          safetyForm.notes ? `ملاحظات السلامة: ${safetyForm.notes}` : "",
        ].filter(Boolean).join("\n") : "",
        st.includes("شقق") || st.includes("منازل") ? [
          "تفاصيل مكونات الشقة:",
          `عدد الغرف السكنية: ${roomsCount}`,
          `عدد الحمامات: ${bathroomsCount}`,
          `عدد المطابخ: ${kitchensCount}`,
          `عدد الصالونات / غرف المعيشة: ${salonsCount}`,
        ].join("\n") : "",
        st.includes("فلل") || st.includes("قصور") ? [
          "تفاصيل العقار:",
          `نوع العقار: ${propertyType}`,
          `عدد الأدوار والطوابق: ${floorsCount}`,
          `عدد الغرف السكنية: ${roomsCount}`,
          `عدد الحمامات: ${bathroomsCount}`,
          `عدد المطابخ: ${kitchensCount}`,
          `عدد الصالونات: ${salonsCount}`,
          `مساحة الحوش التقريبية: ${yardAreaCount} م²`,
        ].join("\n") : "",
        st.includes("نقل") || st.includes("الترميم") ? [
          "تفاصيل التنظيف قبل/بعد النقل والترميم:",
          `حالة العقار: ${moveStatus}`,
          `عدد الغرف السكنية: ${roomsCount}`,
          `عدد الحمامات: ${bathroomsCount}`,
          `عدد المطابخ: ${kitchensCount}`,
        ].join("\n") : "",
        st.includes("مكيفات") ? [
          "تفاصيل المكيفات:",
          `مكيفات سبلت: ${splitAcCount}`,
          `مكيفات شباك: ${windowAcCount}`,
          `مكيفات مخفي / مركزي: ${concealedAcCount}`,
        ].join("\n") : "",
        st.includes("مجالس") || st.includes("كنب") ? [
          "تفاصيل المجالس والكنب والسجاد:",
          `أطقم المجالس: ${majlisSetsCount}`,
          `أطقم الكنب: ${sofaSetsCount}`,
          `مساحة السجاد والموكيت: ${carpetMetersCount} م²`,
           `أنواع الأثاث: ${majlisFurnitureTypes.join("، ") || "تحديدها مع الفريق"}`,
           `نوع القماش: ${majlisFabricType}`,
           `مستوى التنظيف: ${majlisCleaningLevel}`,
           `عدد الستائر: ${majlisCurtainsCount}`,
        ].join("\n") : "",
        st.includes("رخام") || st.includes("جلي") ? [
          "تفاصيل الجلي والتلميع:",
          `نوع الأرضية: ${marbleMaterial}`,
          `المساحة: ${marbleMetersCount} م²`,
        ].join("\n") : "",
        st.includes("خزانات") ? `نوع الخزان: ${tankType}` : "",
        st.includes("حشرات") ? `أنواع الحشرات المستهدفة: ${pestTypes.join("، ")} | الضمان: ${pestWarranty}` : "",
        st.includes("تشطيب") || st.includes("بناء") ? [
          "تفاصيل ما بعد البناء والتشطيب:",
          `المساحة: ${postconMetersCount} م²`,
          `الأعمال المطلوبة: ${postconTasks.join("، ") || "تحديدها مع الفريق"}`,
        ].join("\n") : "",
        st.includes("واجهات") || st.includes("مكاتب") ? `نوع الواجهة: ${facadeMaterial} | عدد الأدوار: ${facadeFloorsCount}` : "",
         st.includes("مساجد") || st.includes("مدارس") ? [
           "تفاصيل المنشأة:",
           `نوع المنشأة: ${facilityType}`,
           `مساحة المنشأة: ${facilityAreaMeters} م²`,
           facilityType === "مسجد / مصلى جامع" ? [
             `عدد المصليات / قاعات الصلاة: ${mosquePrayerHallsCount}`,
             `عدد وحدات الوضوء: ${mosqueAblutionUnits}`,
             `عدد دورات المياه: ${mosqueBathroomsCount}`,
             `مساحة الساحات الخارجية: ${mosqueCourtyardArea} م²`,
             `نطاق الخدمة: ${mosqueCleaningScope}`,
             `مساحة موكيت المصلى / السجاد: ${facilityCarpetMeters} م²`,
           ].join("\n") : "",
           facilityType === "مدرسة" ? [
             `عدد المباني: ${schoolBuildingsCount}`,
             `عدد الفصول: ${schoolClassroomsCount}`,
             `عدد دورات المياه: ${schoolBathroomsCount}`,
             `مساحة الملاعب / الساحات: ${schoolCourtyardArea} م²`,
             `نطاق الخدمة: ${schoolCleaningScope}`,
             `مساحة السجاد والموكيت: ${facilityCarpetMeters} م²`,
           ].join("\n") : "",
           facilityType === "مكتب / منشأة" ? [
             `عدد الأدوار: ${officeFloorsCount}`,
             `عدد المكاتب والغرف: ${officeRoomsCount}`,
             `عدد غرف الاجتماعات: ${officeMeetingRoomsCount}`,
             `عدد دورات المياه: ${officeBathroomsCount}`,
             `دورية التنظيف: ${officeCleaningFrequency}`,
             `مساحة السجاد والموكيت: ${facilityCarpetMeters} م²`,
           ].join("\n") : "",
         ].filter(Boolean).join("\n") : "",
        selectedAddOns.length > 0 ? [
          `الخدمات الإضافية المختارة: ${selectedAddOns.join("، ")}`,
          selectedAddOns.includes("غسيل وتطهير مجالس وكنب بالبخار") ? `تفاصيل المجالس الإضافية — مجالس: ${addonMajlisSets}، كنب: ${addonSofaSets}، سجاد وموكيت: ${addonCarpetMeters} م²` : "",
          selectedAddOns.includes("جلي وتلميع رخام وسيراميك بالألماس") ? `تفاصيل الجلي الإضافي — النوع: ${addonMarbleMaterial}، المساحة: ${addonMarbleMeters} م²` : "",
          selectedAddOns.includes("تنظيف وتطهير خزان المياه الأرضي والعلوي") ? `تفاصيل الخزان الإضافي — ${addonTankType}` : "",
          selectedAddOns.includes("غسيل وتنظيف مكيفات الهواء") ? `تفاصيل المكيفات الإضافية — سبلت: ${addonAcSplit}، شباك: ${addonAcWindow}، مخفي/مركزي: ${addonAcConcealed}` : "",
          selectedAddOns.includes("رش مبيدات ومكافحة الحشرات بضمان") ? `تفاصيل مكافحة الحشرات الإضافية — الأنواع: ${addonPestTypes.join("، ")}، ${addonPestWarranty}` : "",
          selectedAddOns.includes("تنظيف وتطهير المسبح والفلتر") ? `تفاصيل المسبح — ${addonPoolSize}` : "",
        ].filter(Boolean).join("\n") : "",
        form.notes ? `ملاحظات العميل: ${form.notes}` : "",
      ].filter(Boolean).join("\n")

      const scheduledAt = form.appointmentType === "scheduled" && form.scheduledDate
        ? `${form.scheduledDate}T${form.scheduledTime || "09:00"}:00`
        : null

      const res = await fetch(`${API_BASE}/api/service-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: form.clientName,
           phone: normalizedPhone,
          email: form.email || undefined,
          serviceType: form.serviceType,
          packageSize: form.packageSize || selectedAddOns[0] || null,
          location: form.location,
          notes: customDetailsText,
          appointmentType: form.appointmentType,
          scheduledAt,
          conversationId: preselect.conversationId ?? undefined,
           tracking: getVisitorTracking(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error === "requests_locked") {
          setRequestsLocked(true)
          setLockedMessage(data.message || "")
          return
        }
        throw new Error(data.error || "فشل الإرسال")
      }

       const requestId = getOrderId(data)
       if (!requestId) throw new Error("missing_request_id")
       setOrderId(requestId)
      setStep("success")
    } catch {
      setErrors({ phone: "حدث خطأ في الإرسال. حاول مرة أخرى." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    closeModal()
    setTimeout(() => {
      setStep("service")
      setForm(BLANK_FORM)
      setErrors({})
      setOrderId(null)
      setSelectedAddOns([])
      setSafetyForm(BLANK_SAFETY_FORM)
    }, 300)
  }

  const stepTitle = () => {
    if (requestsLocked) return "الطلبات مغلقة"
    if (step === "service") return "اختر نوع الخدمة"
    if (step === "details") return "تحديد تفاصيل العقار والخدمات الإضافية"
    if (step === "location") return "موقع العقار / الحي بالرياض"
    if (step === "appointment") return "طبيعة ورغبة التنفيذ"
    if (step === "personal") return "بياناتك والتأكيد"
    return "تم استلام الطلب"
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col"
          >
            {/* Header */}
            <div className={`text-white px-6 py-4 flex items-center justify-between shrink-0 ${requestsLocked ? "bg-amber-600" : "bg-primary"}`}>
              <div className="flex items-center gap-3">
                {!requestsLocked && step !== "service" && step !== "success" && (
                  <button onClick={goBack} className="text-white/70 hover:text-white p-1">
                    <ChevronLeft size={20} />
                  </button>
                )}
                <div>
                  <h2 className="font-bold text-base">{stepTitle()}</h2>
                  <p className="text-white/60 text-xs">{companyName} — خدمات النظافة والتطهير</p>
                </div>
              </div>
              <button onClick={handleClose} className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Progress */}
            {!requestsLocked && step !== "success" && (
              <div className="px-6 pt-4 shrink-0">
                <StepBar current={stepIndex} total={totalSteps} />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <AnimatePresence mode="wait">

                {/* ── Locked State ── */}
                {requestsLocked && (
                  <motion.div key="locked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <LockedState message={lockedMessage} onClose={handleClose} />
                  </motion.div>
                )}

                {/* ── Step 1: Service Type Selection ── */}
                {!requestsLocked && step === "service" && (
                  <motion.div key="service" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <p className="text-gray-500 text-sm mb-4 font-semibold">اختر الفئة أو الخدمة المطلوب تنفيذها بالرياض:</p>
                    <div className="grid grid-cols-1 gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
                      {SERVICE_TYPES.map((s) => {
                        const Icon = s.icon
                        return (
                          <motion.button
                            key={s.id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelectService(s.id)}
                            className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl border bg-gradient-to-l ${s.color} text-right transition-all hover:shadow-md`}
                          >
                            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                              <Icon size={22} className="text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 text-sm">{s.label}</p>
                              <p className="text-gray-500 text-xs mt-0.5">{s.desc}</p>
                            </div>
                            <ChevronRight size={18} className="text-gray-400 shrink-0" />
                          </motion.button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ── Step 2: Customization & Add-On Options ── */}
                {!requestsLocked && step === "details" && (
                  <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <div className="bg-primary/5 border border-primary/15 rounded-2xl p-3.5 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-500 block">الخدمة المختارة:</span>
                        <span className="font-bold text-primary text-sm">{form.serviceType}</span>
                       {selectedPackageName && (
                         <span className="mt-1 block text-xs font-semibold text-gray-700">الباقة: {selectedPackageName}</span>
                       )}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setStep("service")} className="text-xs text-primary underline">تغيير</Button>
                    </div>

                    {/* Counters based on service */}
                    {(() => {
                      const st = String(form.serviceType || "")
                      return (
                        <>
                          {isSafetyService(st) && (
                            <SafetyComplianceDetails
                              serviceType={st}
                              value={safetyForm}
                              onChange={setSafetyForm}
                            />
                          )}
                          {(st.includes("شقق") || st.includes("منازل")) && (
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                              <p className="text-xs font-bold text-gray-700">تفاصيل مكونات الشقة:</p>
                               <DetailCounter label="عدد الغرف السكنية" value={roomsCount} min={1} onChange={setRoomsCount} />
                               <DetailCounter label="عدد الحمامات" value={bathroomsCount} min={1} onChange={setBathroomsCount} />
                               <DetailCounter label="عدد المطابخ" value={kitchensCount} min={1} onChange={setKitchensCount} />
                               <DetailCounter label="عدد الصالونات / غرف المعيشة" value={salonsCount} min={0} onChange={setSalonsCount} />
                            </div>
                          )}

                          {(st.includes("فلل") || st.includes("قصور")) && (
                            <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100 space-y-3">
                              <p className="text-xs font-bold text-amber-900">حجم ونوع العقار:</p>
                              <div className="grid grid-cols-3 gap-2">
                                {["فيلا صغيرة", "فيلا دوبلكس 2 دور", "قصر ومجمع فخم"].map(t => (
                                  <button type="button" key={t} onClick={() => setPropertyType(t)} className={`py-2 rounded-xl text-xs font-bold border ${propertyType === t ? "bg-amber-600 text-white border-amber-600" : "bg-white text-gray-700 border-gray-200"}`}>
                                    {t}
                                  </button>
                                ))}
                              </div>
                              <div className="flex items-center justify-between pt-2">
                                 <DetailCounter label="عدد الأدوار والطوابق" value={floorsCount} min={1} onChange={setFloorsCount} />
                              </div>
                               <DetailCounter label="عدد الغرف السكنية" value={roomsCount} min={1} onChange={setRoomsCount} />
                               <DetailCounter label="عدد الحمامات" value={bathroomsCount} min={1} onChange={setBathroomsCount} />
                               <DetailCounter label="عدد المطابخ" value={kitchensCount} min={1} onChange={setKitchensCount} />
                               <DetailCounter label="عدد الصالونات" value={salonsCount} min={0} onChange={setSalonsCount} />
                               <div className="pt-1">
                                 <DetailCounter label="مساحة الحوش التقريبية" value={yardAreaCount} min={0} suffix="م²" onChange={setYardAreaCount} />
                                 <p className="text-[10px] text-gray-400 mt-1">تقدير مبدئي يساعد الفريق على تجهيز عرض السعر.</p>
                               </div>
                            </div>
                          )}

                          {st.includes("مكيفات") && (
                            <div className="bg-cyan-50/50 rounded-2xl p-4 border border-cyan-100 space-y-3">
                              <p className="text-xs font-bold text-cyan-900">عدد أجهزة المكيفات المراد غسيلها:</p>
                               <DetailCounter label="مكيفات سبلت (Split)" value={splitAcCount} onChange={setSplitAcCount} />
                               <DetailCounter label="مكيفات شباك (Window)" value={windowAcCount} onChange={setWindowAcCount} />
                               <DetailCounter label="مكيفات مخفي / مركزي (Concealed)" value={concealedAcCount} onChange={setConcealedAcCount} />
                            </div>
                          )}

                           {(st.includes("مجالس") || st.includes("كنب")) && (
                             <div className="bg-purple-50/60 rounded-2xl p-4 border border-purple-100 space-y-3">
                               <p className="text-xs font-bold text-purple-900">تفاصيل الأثاث المطلوب غسيله:</p>
                               <DetailMultiChoices
                                 options={["مجالس عربية", "كنب", "سجاد", "ستائر"]}
                                 values={majlisFurnitureTypes}
                                 onToggle={item => setMajlisFurnitureTypes(prev => prev.includes(item) ? prev.filter(value => value !== item) : [...prev, item])}
                               />
                               <DetailCounter label="أطقم المجالس" value={majlisSetsCount} min={0} onChange={setMajlisSetsCount} />
                               <DetailCounter label="أطقم الكنب" value={sofaSetsCount} min={0} onChange={setSofaSetsCount} />
                               <DetailCounter label="مساحة السجاد والموكيت" value={carpetMetersCount} min={0} suffix="م²" onChange={setCarpetMetersCount} />
                               <DetailCounter label="عدد الستائر" value={majlisCurtainsCount} min={0} onChange={setMajlisCurtainsCount} />
                               <div className="space-y-2">
                                 <p className="text-xs font-bold text-purple-900">نوع القماش الغالب:</p>
                                 <DetailChoices options={["قماش", "مخمل", "جلد", "متنوع"]} value={majlisFabricType} onChange={setMajlisFabricType} />
                               </div>
                               <div className="space-y-2">
                                 <p className="text-xs font-bold text-purple-900">طبيعة الغسيل:</p>
                                 <DetailChoices options={["غسيل عميق وإزالة البقع", "غسيل وصيانة دورية", "تعقيم وتجفيف سريع"]} value={majlisCleaningLevel} onChange={setMajlisCleaningLevel} />
                               </div>
                             </div>
                           )}

                          {st.includes("حشرات") && (
                            <div className="bg-red-50/50 rounded-2xl p-4 border border-red-100 space-y-3">
                               <p className="text-xs font-bold text-red-900">اختر نوعًا أو أكثر من الحشرات المستهدفة:</p>
                               <DetailMultiChoices options={["صراصير", "نمل زاحف", "بق الفراش", "العتة", "نمل أبيض (رمة)", "قوارض وفئران"]} values={pestTypes} onToggle={p => setPestTypes(prev => prev.includes(p) ? prev.filter(item => item !== p) : [...prev, p])} />
                               <p className="text-xs font-bold text-red-900 pt-1">الضمان:</p>
                               <DetailChoices options={["ضمان 12 شهراً ورش مجاني", "ضمان 6 أشهر", "أحتاج توصية الفريق"]} value={pestWarranty} onChange={setPestWarranty} />
                            </div>
                          )}

                           {(st.includes("رخام") || st.includes("جلي")) && (
                             <div className="bg-yellow-50/60 rounded-2xl p-4 border border-yellow-100 space-y-3">
                               <p className="text-xs font-bold text-yellow-900">تفاصيل الأرضية المراد جليها وتلميعها:</p>
                               <DetailChoices options={["رخام", "سيراميك", "بلاط"]} value={marbleMaterial} onChange={setMarbleMaterial} columns={3} />
                               <DetailCounter label="المساحة المطلوب جليها" value={marbleMetersCount} min={1} suffix="م²" onChange={setMarbleMetersCount} />
                             </div>
                           )}

                           {st.includes("خزانات") && (
                             <div className="bg-teal-50/60 rounded-2xl p-4 border border-teal-100 space-y-3">
                               <p className="text-xs font-bold text-teal-900">حدد نوع الخزان:</p>
                               <DetailChoices options={["خزان أرضي + علوي", "خزان أرضي فقط", "خزان علوي فقط"]} value={tankType} onChange={setTankType} />
                             </div>
                           )}

                           {(st.includes("نقل") || st.includes("الترميم")) && (
                             <div className="bg-indigo-50/60 rounded-2xl p-4 border border-indigo-100 space-y-3">
                               <p className="text-xs font-bold text-indigo-900">تفاصيل حالة العقار:</p>
                               <DetailChoices options={["قبل الانتقال والسكن", "بعد الانتقال والرحيل", "بعد الترميم"]} value={moveStatus} onChange={setMoveStatus} />
                               <DetailCounter label="عدد الغرف السكنية" value={roomsCount} min={1} onChange={setRoomsCount} />
                               <DetailCounter label="عدد الحمامات" value={bathroomsCount} min={1} onChange={setBathroomsCount} />
                               <DetailCounter label="عدد المطابخ" value={kitchensCount} min={1} onChange={setKitchensCount} />
                             </div>
                           )}

                           {(st.includes("تشطيب") || st.includes("بناء")) && (
                             <div className="bg-orange-50/60 rounded-2xl p-4 border border-orange-100 space-y-3">
                               <p className="text-xs font-bold text-orange-900">تفاصيل ما بعد البناء والتشطيب:</p>
                               <DetailCounter label="مساحة العقار" value={postconMetersCount} min={1} suffix="م²" onChange={setPostconMetersCount} />
                               <p className="text-xs font-bold text-orange-900 pt-1">الأعمال المطلوبة:</p>
                               <DetailMultiChoices
                                 options={["إزالة بقايا الإسمنت", "إزالة الدهانات", "إزالة الترويبة", "تلميع البلاط والشبابيك"]}
                                 values={postconTasks}
                                 onToggle={task => setPostconTasks(prev => prev.includes(task) ? prev.filter(item => item !== task) : [...prev, task])}
                               />
                             </div>
                           )}

                           {(st.includes("واجهات") || st.includes("مكاتب")) && (
                             <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100 space-y-3">
                               <p className="text-xs font-bold text-blue-900">تفاصيل الواجهة:</p>
                               <DetailChoices options={["زجاج", "كلادينج", "حجر"]} value={facadeMaterial} onChange={setFacadeMaterial} columns={3} />
                               <DetailCounter label="عدد الأدوار" value={facadeFloorsCount} min={1} onChange={setFacadeFloorsCount} />
                             </div>
                           )}

                           {(st.includes("مساجد") || st.includes("مدارس")) && (
                             <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100 space-y-3">
                               <p className="text-xs font-bold text-emerald-900">تفاصيل المنشأة:</p>
                               <DetailChoices options={["مسجد / مصلى جامع", "مدرسة", "مكتب / منشأة"]} value={facilityType} onChange={setFacilityType} columns={3} />
                               <DetailCounter label="مساحة المنشأة" value={facilityAreaMeters} min={1} suffix="م²" onChange={setFacilityAreaMeters} />
                                {facilityType === "مسجد / مصلى جامع" && (
                                  <>
                                    <DetailCounter label="مساحة موكيت المصلى / السجاد" value={facilityCarpetMeters} min={0} suffix="م²" onChange={setFacilityCarpetMeters} />
                                    <DetailCounter label="عدد المصليات / قاعات الصلاة" value={mosquePrayerHallsCount} min={1} onChange={setMosquePrayerHallsCount} />
                                    <DetailCounter label="عدد وحدات الوضوء" value={mosqueAblutionUnits} min={0} onChange={setMosqueAblutionUnits} />
                                    <DetailCounter label="عدد دورات المياه" value={mosqueBathroomsCount} min={0} onChange={setMosqueBathroomsCount} />
                                    <DetailCounter label="مساحة الساحات الخارجية" value={mosqueCourtyardArea} min={0} suffix="م²" onChange={setMosqueCourtyardArea} />
                                    <div className="space-y-2">
                                      <p className="text-xs font-bold text-emerald-900">نطاق تنظيف المسجد:</p>
                                      <DetailChoices options={["تنظيف شامل للمصلى والمرافق", "غسيل موكيت وتعقيم فقط", "تنظيف دوري للمرافق"]} value={mosqueCleaningScope} onChange={setMosqueCleaningScope} />
                                    </div>
                                  </>
                                )}
                                {facilityType === "مدرسة" && (
                                  <>
                                    <DetailCounter label="مساحة السجاد والموكيت" value={facilityCarpetMeters} min={0} suffix="م²" onChange={setFacilityCarpetMeters} />
                                    <DetailCounter label="عدد المباني" value={schoolBuildingsCount} min={1} onChange={setSchoolBuildingsCount} />
                                    <DetailCounter label="عدد الفصول الدراسية" value={schoolClassroomsCount} min={0} onChange={setSchoolClassroomsCount} />
                                    <DetailCounter label="عدد دورات المياه" value={schoolBathroomsCount} min={0} onChange={setSchoolBathroomsCount} />
                                    <DetailCounter label="مساحة الملاعب / الساحات" value={schoolCourtyardArea} min={0} suffix="م²" onChange={setSchoolCourtyardArea} />
                                    <div className="space-y-2">
                                      <p className="text-xs font-bold text-emerald-900">نطاق تنظيف المدرسة:</p>
                                      <DetailChoices options={["تنظيف الفصول والممرات", "تنظيف شامل مع التعقيم", "تنظيف الساحات والمرافق فقط"]} value={schoolCleaningScope} onChange={setSchoolCleaningScope} />
                                    </div>
                                  </>
                                )}
                                {facilityType === "مكتب / منشأة" && (
                                  <>
                                    <DetailCounter label="مساحة السجاد والموكيت" value={facilityCarpetMeters} min={0} suffix="م²" onChange={setFacilityCarpetMeters} />
                                    <DetailCounter label="عدد الأدوار" value={officeFloorsCount} min={1} onChange={setOfficeFloorsCount} />
                                    <DetailCounter label="عدد المكاتب والغرف" value={officeRoomsCount} min={0} onChange={setOfficeRoomsCount} />
                                    <DetailCounter label="عدد غرف الاجتماعات" value={officeMeetingRoomsCount} min={0} onChange={setOfficeMeetingRoomsCount} />
                                    <DetailCounter label="عدد دورات المياه" value={officeBathroomsCount} min={0} onChange={setOfficeBathroomsCount} />
                                    <div className="space-y-2">
                                      <p className="text-xs font-bold text-emerald-900">دورية تنظيف المكتب / المنشأة:</p>
                                      <DetailChoices options={["تنظيف شامل لمرة واحدة", "تنظيف دوري أسبوعي", "عقد تنظيف يومي"]} value={officeCleaningFrequency} onChange={setOfficeCleaningFrequency} />
                                    </div>
                                  </>
                                )}
                             </div>
                           )}
                        </>
                      )
                    })()}

                    {/* Add-ons checkboxes */}
                    {!isSafetyService(String(form.serviceType || "")) && <div>
                      <p className="text-xs font-bold text-gray-700 mb-2">خدمات إضافية مكملة (اختياري):</p>
                      <div className="space-y-2">
                        {[
                          "غسيل وتطهير مجالس وكنب بالبخار",
                          "جلي وتلميع رخام وسيراميك بالألماس",
                          "تنظيف وتطهير خزان المياه الأرضي والعلوي",
                          "غسيل وتنظيف مكيفات الهواء",
                          "رش مبيدات ومكافحة الحشرات بضمان",
                          "تنظيف وتطهير المسبح والفلتر",
                          "تعقيم بالبخار الحراري 140°",
                        ].map((addon) => {
                          const active = selectedAddOns.includes(addon)
                          return (
                            <div key={addon} className="space-y-2">
                              <button
                                type="button"
                                onClick={() => toggleAddOn(addon)}
                                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs text-right transition-all ${
                                  active ? "bg-primary/10 border-primary text-primary font-bold shadow-sm" : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  {active ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} className="text-gray-400" />}
                                  {addon}
                                </span>
                                <span className="text-[11px] opacity-80">{active ? "محددة" : "إضافة"}</span>
                              </button>

                              {/* Expandable options for AC washing */}
                              {active && addon === "غسيل وتنظيف مكيفات الهواء" && (
                                <div className="bg-cyan-50/80 rounded-xl p-3 border border-cyan-200 space-y-2 text-xs mr-4">
                                  <p className="font-bold text-cyan-900 mb-1">حدد أعداد المكيفات الإضافية:</p>
                                  <DetailCounter label="مكيفات سبلت" value={addonAcSplit} onChange={setAddonAcSplit} />
                                  <DetailCounter label="مكيفات شباك" value={addonAcWindow} onChange={setAddonAcWindow} />
                                  <DetailCounter label="مكيفات مخفي / مركزي" value={addonAcConcealed} onChange={setAddonAcConcealed} />
                                </div>
                              )}

                              {/* Expandable options for Majlis */}
                              {active && addon === "غسيل وتطهير مجالس وكنب بالبخار" && (
                                <div className="bg-purple-50/80 rounded-xl p-3 border border-purple-200 space-y-2 text-xs mr-4">
                                  <p className="font-bold text-purple-900 mb-1">حدد تفاصيل الأثاث والسجاد:</p>
                                  <DetailCounter label="أطقم المجالس" value={addonMajlisSets} min={1} onChange={setAddonMajlisSets} />
                                  <DetailCounter label="أطقم الكنب" value={addonSofaSets} min={0} onChange={setAddonSofaSets} />
                                  <DetailCounter label="مساحة السجاد والموكيت" value={addonCarpetMeters} min={0} suffix="م²" onChange={setAddonCarpetMeters} />
                                  <p className="text-[10px] text-purple-700/70">المساحات الشائعة للسجاد: 10–20 م² للغرفة، و30–60 م² للمجلس الكبير.</p>
                                </div>
                              )}

                              {/* Expandable options for Water Tank */}
                              {active && addon === "تنظيف وتطهير خزان المياه الأرضي والعلوي" && (
                                <div className="bg-teal-50/80 rounded-xl p-3 border border-teal-200 space-y-2 text-xs mr-4">
                                  <p className="font-bold text-teal-900 mb-1">نوع الخزان:</p>
                                  <div className="grid grid-cols-2 gap-1.5">
                                    {["خزان أرضي + علوي", "خزان أرضي فقط", "خزان علوي فقط"].map(t => (
                                      <button type="button" key={t} onClick={() => setAddonTankType(t)} className={`py-1 px-2 rounded-lg text-[11px] font-bold border ${addonTankType === t ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-700 border-gray-200"}`}>{t}</button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Expandable options for Pest */}
                              {active && addon === "رش مبيدات ومكافحة الحشرات بضمان" && (
                                <div className="bg-rose-50/80 rounded-xl p-3 border border-rose-200 space-y-2 text-xs mr-4">
                                  <p className="font-bold text-rose-900 mb-1">نوع الحشرات الموجهة:</p>
                                  <DetailMultiChoices options={["صراصير", "نمل زاحف", "بق الفراش", "العتة", "نمل أبيض (رمة)", "قوارض وفئران"]} values={addonPestTypes} onToggle={p => setAddonPestTypes(prev => prev.includes(p) ? prev.filter(item => item !== p) : [...prev, p])} />
                                  <p className="font-bold text-rose-900 pt-1">الضمان:</p>
                                  <DetailChoices options={["ضمان 12 شهراً", "ضمان 6 أشهر", "أحتاج توصية الفريق"]} value={addonPestWarranty} onChange={setAddonPestWarranty} />
                                </div>
                              )}

                              {/* Expandable options for Marble */}
                              {active && addon === "جلي وتلميع رخام وسيراميك بالألماس" && (
                                <div className="bg-yellow-50/80 rounded-xl p-3 border border-yellow-200 space-y-2 text-xs mr-4">
                                  <p className="font-bold text-yellow-900">نوع الأرضية:</p>
                                  <DetailChoices options={["رخام", "سيراميك", "بلاط"]} value={addonMarbleMaterial} onChange={setAddonMarbleMaterial} columns={3} />
                                  <DetailCounter label="المساحة" value={addonMarbleMeters} min={1} suffix="م²" onChange={setAddonMarbleMeters} />
                                </div>
                              )}

                              {/* Expandable options for Pool */}
                              {active && addon === "تنظيف وتطهير المسبح والفلتر" && (
                                <div className="bg-blue-50/80 rounded-xl p-3 border border-blue-200 space-y-2 text-xs mr-4">
                                  <p className="font-bold text-blue-900 mb-1">حجم المسبح:</p>
                                  <div className="grid grid-cols-2 gap-1.5">
                                    {["مسبح فيلا متوسط", "مسبح قصر / مجمع كبيـر"].map(ps => (
                                      <button type="button" key={ps} onClick={() => setAddonPoolSize(ps)} className={`py-1 px-2 rounded-lg text-[11px] font-bold border ${addonPoolSize === ps ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200"}`}>{ps}</button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>}

                    <Button onClick={handleDetailsNext} className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-md mt-4">
                      متابعة الموقع والموعد
                    </Button>
                  </motion.div>
                )}

                {/* ── Step 3: Location ── */}
                {!requestsLocked && step === "location" && (
                  <motion.div key="location" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 mb-4">
                      <p className="text-primary font-semibold text-sm">
                        {form.serviceType}
                        {selectedPackageName && ` — ${selectedPackageName}`}
                      </p>
                      {selectedAddOns.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">خدمات مضافة: {selectedAddOns.join(" + ")}</p>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm mb-3 font-semibold">أين تحتاج إيصال وتنفيذ الخدمة بالرياض؟</p>
                    <LocationPicker value={form.location} onChange={(v) => setForm(f => ({ ...f, location: v }))} />
                    {errors.location && <p className="text-red-500 text-xs mt-2">{errors.location}</p>}
                    <Button onClick={handleLocationNext} className="w-full mt-4 h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl">
                      التالي
                    </Button>
                  </motion.div>
                )}

                {/* ── Step 4: Appointment ── */}
                {!requestsLocked && step === "appointment" && (
                  <motion.div key="appointment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <p className="text-gray-500 text-sm mb-4 font-semibold">كيف ترغب بتنفيذ الخدمة والموعد؟</p>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setForm(f => ({ ...f, appointmentType: "immediate" }))}
                        className={`p-4 rounded-2xl border-2 text-center transition-all ${
                          form.appointmentType === "immediate"
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-gray-200 bg-white hover:border-primary/40"
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-2 ${
                          form.appointmentType === "immediate" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
                        }`}>
                          <Zap size={20} />
                        </div>
                        <p className="font-bold text-gray-900 text-sm">طلب فوري ⚡</p>
                        <p className="text-xs text-gray-500 mt-0.5">تنفيذ في أقرب وقت</p>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setForm(f => ({ ...f, appointmentType: "scheduled", scheduledDate: f.scheduledDate || getTodayString() }))}
                        className={`p-4 rounded-2xl border-2 text-center transition-all ${
                          form.appointmentType === "scheduled"
                            ? "border-secondary bg-secondary/5 shadow-md"
                            : "border-gray-200 bg-white hover:border-secondary/40"
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-2 ${
                          form.appointmentType === "scheduled" ? "bg-secondary text-white" : "bg-gray-100 text-gray-500"
                        }`}>
                          <CalendarClock size={20} />
                        </div>
                        <p className="font-bold text-gray-900 text-sm">تحديد موعد</p>
                        <p className="text-xs text-gray-500 mt-0.5">تحديد تاريخ ووقت</p>
                      </motion.button>
                    </div>

                    {form.appointmentType === "scheduled" && (
                      <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-200 mb-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">اختر التاريخ:</label>
                          <Input type="date" min={getTodayString()} value={form.scheduledDate} onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))} className="h-10 bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">اختر الوقت التقديري:</label>
                          <Input type="time" min={getMinTime(form.scheduledDate)} value={form.scheduledTime} onChange={e => setForm(f => ({ ...f, scheduledTime: e.target.value }))} className="h-10 bg-white" />
                        </div>
                      </div>
                    )}

                    <Button onClick={handleAppointmentNext} className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl">
                      التالي (البيانات الشخصية)
                    </Button>
                  </motion.div>
                )}

                {/* ── Step 5: Personal Details & Confirmation ── */}
                {!requestsLocked && step === "personal" && (
                  <motion.div key="personal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        <User size={14} className="inline ml-1 text-primary" />الاسم / اسم الشركة *
                      </label>
                      <Input value={form.clientName} onChange={(e) => setForm(f => ({ ...f, clientName: e.target.value }))}
                        placeholder="أدخل اسمك الكريم..." className="h-12 bg-gray-50 border-gray-200" />
                      {errors.clientName && <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        <Phone size={14} className="inline ml-1 text-primary" />رقم الجوال *
                      </label>
                           <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="05XXXXXXXX" dir="ltr" type="tel" className="h-12 bg-gray-50 border-gray-200 text-left" />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-primary">مراجعة الطلب قبل الإرسال</p>
                        <span className="text-[10px] text-gray-500">يمكنك الرجوع للتعديل</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-gray-500">الخدمة</span>
                          <span className="font-bold text-gray-900 text-left">{form.serviceType}</span>
                        </div>
                        {selectedPackageName && (
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-gray-500">الباقة</span>
                            <span className="font-bold text-gray-900 text-left">{selectedPackageName}</span>
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-gray-500">الموقع</span>
                          <span className="font-bold text-gray-900 text-left max-w-[68%] whitespace-pre-line">{form.location}</span>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-gray-500">التنفيذ</span>
                          <span className="font-bold text-gray-900 text-left">
                            {form.appointmentType === "immediate"
                              ? "أقرب وقت ممكن"
                              : `${form.scheduledDate} — ${form.scheduledTime}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        <FileText size={14} className="inline ml-1 text-primary" />ملاحظات إضافية (اختياري)
                      </label>
                      <textarea value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                        placeholder="أي تفاصيل خاصة بتوقيت التنفيذ أو المعاينة..." rows={2}
                        className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-primary/50 resize-none" />
                    </div>

                    <Button onClick={handleSubmit} disabled={isSubmitting}
                      className="w-full py-3.5 bg-secondary hover:bg-secondary/90 text-white font-bold text-base rounded-xl shadow-lg mt-2">
                      {isSubmitting
                        ? <span className="flex items-center gap-2"><Loader2 size={18} className="animate-spin" /> جاري إرسال الطلب...</span>
                       : "تأكيد وإرسال الطلب"}
                    </Button>
                  </motion.div>
                )}

                {/* ── Step 6: Success ── */}
                {!requestsLocked && step === "success" && (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-200 text-white">
                      <CheckCircle size={40} />
                    </div>

                    <h3 className="text-2xl font-black text-gray-900 mb-2">تم استلام طلبك بنجاح!</h3>

                    <div className="bg-primary/5 border border-primary/15 rounded-2xl px-5 py-4 mb-5 inline-block w-full">
                      <p className="text-gray-500 text-xs mb-1">رقم طلبك الخاص</p>
                      <p className="text-4xl font-black text-primary">#{orderId}</p>
                    </div>

                     <div className="text-right bg-gray-50 rounded-2xl p-4 space-y-2 text-xs mb-5">
                      <p><span className="text-gray-400">الخدمة: </span><span className="font-semibold text-gray-900">{form.serviceType}</span></p>
                      <p><span className="text-gray-400">الموقع: </span><span className="font-semibold text-gray-900">{form.location}</span></p>
                      <p><span className="text-gray-400">الموعد: </span>
                        <span className="font-semibold text-gray-900">
                           {form.appointmentType === "immediate" ? "أقرب وقت ممكن" : `${form.scheduledDate} الساعة ${form.scheduledTime}`}
                        </span>
                      </p>
                    </div>

                     <p className="text-xs text-gray-500 mb-3">احتفظ برقم الطلب لمتابعة حالته من زر «تتبع الطلب» في القائمة.</p>
                     <div className="grid grid-cols-2 gap-2">
                       <Button
                         onClick={() => {
                           if (orderId !== null) {
                             window.dispatchEvent(new CustomEvent("openTrackingModal", { detail: { id: orderId } }))
                           }
                           handleClose()
                         }}
                         className="h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl"
                       >
                         تتبع الطلب
                       </Button>
                       <Button onClick={handleClose} variant="outline" className="h-12 font-bold rounded-xl">
                         إغلاق
                       </Button>
                     </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
