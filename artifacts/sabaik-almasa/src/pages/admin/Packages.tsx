import { useState, useRef, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useSiteSettings } from "@/context/SiteSettingsContext"
import { useGetPackages, useCreatePackage, useUpdatePackage, useDeletePackage } from "@workspace/api-client-react"
import type { CleaningPackage } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Plus, Pencil, Trash2, Box, Eye, EyeOff, X, Check, Phone,
  Search, AlertTriangle, CheckCircle2, XCircle, Image, Link2,
  Images, ToggleLeft, ToggleRight, Upload, Loader2, Sparkles, Settings,
} from "lucide-react"
import { resolvePackageImageUrl } from "@/lib/packageImage"

// ─── Types ────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "apartments",  label: "تنظيف الشقق السكنية" },
  { value: "villas",      label: "تنظيف الفلل" },
  { value: "palaces",     label: "تنظيف القصور والمجمعات" },
  { value: "move_clean",  label: "تنظيف قبل/بعد النقل والترميم" },
  { value: "majlis",      label: "غسيل المجالس والكنب بالبخار" },
  { value: "marble",      label: "جلي وتلميع الرخام والسيراميك" },
  { value: "tanks",       label: "تطهير خزانات المياه" },
  { value: "ac",          label: "تنظيف وغسيل المكيفات" },
  { value: "pest",        label: "مكافحة وإبادة الحشرات" },
  { value: "postcon",     label: "تنظيف بعد التشطيب والبناء" },
  { value: "facades",     label: "واجهات المباني والمكاتب" },
  { value: "facilities",  label: "تنظيف المساجد والمدارس" },
  { value: "fire_safety", label: "السلامة والدفاع المدني" },
  { value: "residential", label: "تنظيف سكني عام" },
  { value: "contract",    label: "عقود نظافة دورية" },
]

const categoryColors: Record<string, string> = {
  apartments:  "bg-blue-100 text-blue-700 border-blue-200",
  villas:      "bg-emerald-100 text-emerald-700 border-emerald-200",
  palaces:     "bg-amber-100 text-amber-700 border-amber-200",
  move_clean:  "bg-indigo-100 text-indigo-700 border-indigo-200",
  majlis:      "bg-purple-100 text-purple-700 border-purple-200",
  marble:      "bg-yellow-100 text-yellow-800 border-yellow-200",
  tanks:       "bg-teal-100 text-teal-700 border-teal-200",
  ac:          "bg-cyan-100 text-cyan-700 border-cyan-200",
  pest:        "bg-rose-100 text-rose-700 border-rose-200",
  postcon:     "bg-orange-100 text-orange-700 border-orange-200",
  facades:     "bg-blue-100 text-blue-800 border-blue-300",
  facilities:  "bg-emerald-100 text-emerald-800 border-emerald-300",
  fire_safety: "bg-red-100 text-red-700 border-red-200",
  residential: "bg-blue-100 text-blue-700 border-blue-200",
  contract:    "bg-cyan-100 text-cyan-700 border-cyan-200",
}
const categoryLabels: Record<string, string> = {
  apartments:  "تنظيف الشقق السكنية",
  villas:      "تنظيف الفلل",
  palaces:     "تنظيف القصور والمجمعات",
  move_clean:  "تنظيف قبل/بعد النقل والترميم",
  majlis:      "غسيل المجالس والكنب بالبخار",
  marble:      "جلي وتلميع الرخام والسيراميك",
  tanks:       "تطهير خزانات المياه",
  ac:          "تنظيف وغسيل المكيفات",
  pest:        "مكافحة وإبادة الحشرات",
  postcon:     "تنظيف بعد التشطيب والبناء",
  facades:     "واجهات المباني والمكاتب",
  facilities:  "تنظيف المساجد والمدارس",
  fire_safety: "السلامة والدفاع المدني",
  residential: "تنظيف سكني عام",
  contract:    "عقود نظافة دورية",
}

const OFFER_BADGE_OPTIONS = [
  "عرض موسمي",
  "خصم خاص",
  "لفترة محدودة",
  "عرض نهاية الأسبوع",
  "عرض الصيف",
  "سعر خاص",
  "الأكثر طلباً",
  "باقة مميزة",
  "عرض افتتاحي",
  "خصم الشركات",
]

type CleaningPackageForm = {
  name: string
  category: string
  size: string
  capacity: string
  description: string
  suitableFor: string
  features: string
  priceText: string
  priceNote: string
  rentalPeriod: string
  contactPhone1: string
  contactPhone2: string
  pricePerDay: string
  discountPercent: string
  originalPrice: string
  salePrice: string
  salePriceExpiresAt: string
  discountLabel: string
  images: string[]
  order: number
  isActive: boolean
  seoEnabled: boolean
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  seoSlug: string
}

type SeoCheck = {
  label: string
  hint: string
  score: number
  status: "ok" | "warn" | "error"
}

// ─── SEO helpers ──────────────────────────────────────────────────────────────

function calcSeoChecks(form: CleaningPackageForm): SeoCheck[] {
  const titleLen  = form.seoTitle.trim().length
  const descLen   = form.seoDescription.trim().length
  const kwList    = form.seoKeywords.split(/[,،]/).map(k => k.trim()).filter(Boolean)
  const imgCount  = form.images.filter(u => u.trim()).length
  const wordCount = form.description.trim().split(/\s+/).filter(Boolean).length
  const slug      = form.seoSlug.trim()
  const slugOk    = slug.length > 0 && /^[\u0600-\u06FF0-9-]+$/.test(slug)

  return [
    {
      label: "عنوان السيو (Title Tag)",
      hint:
        titleLen === 0   ? "مطلوب — أضف عنواناً للسيو" :
        titleLen < 30    ? `${titleLen} حرف — قصير جداً (الهدف 50-60)` :
        titleLen <= 60   ? `${titleLen} حرف — ممتاز ✓` :
        titleLen <= 70   ? `${titleLen} حرف — مقبول (الأفضل ≤60)` :
                           `${titleLen} حرف — طويل جداً`,
      score:  titleLen === 0 ? 0 : titleLen < 30 ? 0.3 : titleLen <= 60 ? 1 : titleLen <= 70 ? 0.7 : 0.4,
      status: titleLen >= 30 && titleLen <= 60 ? "ok" : titleLen === 0 ? "error" : "warn",
    },
    {
      label: "وصف السيو (Meta Description)",
      hint:
        descLen === 0  ? "مطلوب — أضف وصفاً للسيو" :
        descLen < 70   ? `${descLen} حرف — قصير جداً (الهدف 120-160)` :
        descLen <= 160 ? `${descLen} حرف — ممتاز ✓` :
                         `${descLen} حرف — طويل جداً (سيُختصر في جوجل)`,
      score:  descLen === 0 ? 0 : descLen < 70 ? 0.3 : descLen <= 160 ? 1 : 0.6,
      status: descLen >= 70 && descLen <= 160 ? "ok" : descLen === 0 ? "error" : "warn",
    },
    {
      label: "الكلمات المفتاحية (Keywords)",
      hint:
        kwList.length === 0 ? "أضف كلمات مفتاحية مفصولة بفواصل" :
        kwList.length < 3   ? `${kwList.length} كلمة — يُنصح بـ 3 كلمات على الأقل` :
                              `${kwList.length} كلمة مفتاحية — ممتاز ✓`,
      score:  kwList.length === 0 ? 0 : kwList.length < 3 ? 0.5 : 1,
      status: kwList.length === 0 ? "error" : kwList.length < 3 ? "warn" : "ok",
    },
    {
      label: "صور الباقة",
      hint:
        imgCount === 0 ? "لا توجد صور — أضف صورة واحدة على الأقل" :
        imgCount === 1 ? "صورة واحدة — يُنصح بإضافة 2-3 صور" :
                         `${imgCount} صور — ممتاز ✓`,
      score:  imgCount === 0 ? 0 : imgCount === 1 ? 0.6 : 1,
      status: imgCount === 0 ? "error" : imgCount === 1 ? "warn" : "ok",
    },
    {
      label: "محتوى وصف الباقة",
      hint:
        wordCount < 10 ? `${wordCount} كلمات — قليل جداً (الهدف 30+ كلمة)` :
        wordCount < 30 ? `${wordCount} كلمة — مقبول (يُنصح بـ 30+)` :
                         `${wordCount} كلمة — ممتاز ✓`,
      score:  wordCount < 10 ? 0.2 : wordCount < 30 ? 0.6 : 1,
      status: wordCount < 10 ? "error" : wordCount < 30 ? "warn" : "ok",
    },
    {
      label: "رابط الصفحة (Slug)",
      hint:
        !slug    ? "مطلوب — أضف رابطاً عربياً للباقة" :
        !slugOk  ? "يجب أن يحتوي حروفاً عربية وأرقاماً وشرطات فقط" :
                   `/${slug} — ممتاز ✓`,
      score:  !slug ? 0 : !slugOk ? 0.3 : 1,
      status: !slug ? "error" : !slugOk ? "warn" : "ok",
    },
  ]
}

function calcOverallScore(checks: SeoCheck[]): number {
  return Math.round((checks.reduce((s, c) => s + c.score, 0) / checks.length) * 100)
}

// ─── Images Tab ───────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || ""

type ImagesTabProps = {
  images: string[]
  onUpdate: (imgs: string[]) => void
  onUploadingChange?: (uploading: boolean) => void
}

function ImagesTab({ images, onUpdate, onUploadingChange }: ImagesTabProps) {
  const [uploading, setUploading] = useState<number | null>(null)
  const [uploadErrors, setUploadErrors] = useState<Record<number, string>>({})

  const addImage    = () => onUpdate([...images, ""])
  const removeImage = (i: number) => onUpdate(images.filter((_, j) => j !== i))
  const updateImage = (i: number, val: string) => {
    const imgs = [...images]; imgs[i] = val; onUpdate(imgs)
  }

  async function pickAndUpload(i: number) {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/jpeg,image/jpg,image/png,image/webp,image/gif,image/avif"
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      setUploading(i)
      onUploadingChange?.(true)
      setUploadErrors(prev => { const e = { ...prev }; delete e[i]; return e })
      try {
        const fd = new FormData()
        fd.append("file", file)
        fd.append("title", "باقة تنظيف وحاوية أنقاض بالرياض")
        const res = await fetch(`${API_BASE}/api/admin/uploads`, {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
          body: fd,
        })
        if (!res.ok) throw new Error((await res.json()).error || "فشل الرفع")
        const { url } = await res.json()
        updateImage(i, `${API_BASE}${url}`)
      } catch (err: any) {
        setUploadErrors(prev => ({ ...prev, [i]: err.message || "فشل الرفع" }))
      } finally {
        setUploading(null)
        onUploadingChange?.(false)
      }
    }
    input.click()
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        أضف صور الباقة — الصورة الأولى هي الصورة الرئيسية للبطاقة
      </p>
      <div className="space-y-4">
        {images.map((url, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 w-5 text-center shrink-0">{i + 1}</span>
              <Button type="button" variant="outline" size="sm"
                className="shrink-0 gap-1.5 px-2.5 h-9"
                onClick={() => pickAndUpload(i)}
                disabled={uploading === i}
                title="رفع صورة من جهازك">
                {uploading === i ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                <span className="text-xs hidden sm:inline">رفع</span>
              </Button>
              <div className="relative flex-1">
                <Link2 size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <Input value={url} onChange={e => updateImage(i, e.target.value)}
                  placeholder="أو أدخل رابط الصورة مباشرةً"
                  dir="ltr" className="font-mono text-xs pr-8" />
              </div>
              <Button variant="ghost" size="icon"
                onClick={() => removeImage(i)}
                disabled={images.length === 1}
                className="text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0 h-9 w-9">
                <X size={14} />
              </Button>
            </div>
            {uploadErrors[i] && <p className="text-xs text-red-500 mr-7">{uploadErrors[i]}</p>}
            {url.trim() && (
              <div className="mr-7 flex items-center gap-3">
                <img src={resolvePackageImageUrl(url)} alt="" className="h-28 w-auto rounded-xl object-cover border border-gray-200"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
                  onLoad={e  => { (e.target as HTMLImageElement).style.display = "" }} />
                {i === 0 && (
                  <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold">★ الصورة الرئيسية</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <Button variant="outline" onClick={addImage} className="gap-2 w-full border-dashed">
        <Plus size={14} /> إضافة صورة أخرى
      </Button>
      {images.filter(u => u.trim()).length > 1 && (
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs text-gray-500 font-bold mb-2">
            معاينة الصور ({images.filter(u => u.trim()).length})
          </p>
          <div className="flex gap-2 flex-wrap">
            {images.filter(u => u.trim()).map((imgUrl, i) => (
              <div key={i} className="relative shrink-0">
                <img src={resolvePackageImageUrl(imgUrl)} alt="" className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                  onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = "none" }} />
                {i === 0 && (
                  <span className="absolute bottom-1 right-1 bg-primary text-white text-[9px] px-1.5 py-0.5 rounded font-bold">رئيسية</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Small UI components ──────────────────────────────────────────────────────

function SeoCheckRow({ check }: { check: SeoCheck }) {
  const icon =
    check.status === "ok"   ? <CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" /> :
    check.status === "warn" ? <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" /> :
                              <XCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
  const barColor =
    check.status === "ok"   ? "bg-green-500" :
    check.status === "warn" ? "bg-amber-400" : "bg-red-400"
  return (
    <div className="space-y-1.5">
      <div className="flex items-start gap-2">
        {icon}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">{check.label}</span>
            <span className="text-xs text-gray-400 font-mono">{Math.round(check.score * 100)}%</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{check.hint}</p>
        </div>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mr-5">
        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${check.score * 100}%` }} />
      </div>
    </div>
  )
}

function SeoScoreGauge({ score }: { score: number }) {
  const color = score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444"
  const label = score >= 80 ? "ممتاز" : score >= 50 ? "جيد" : "يحتاج تحسين"
  const r = 36, circ = 2 * Math.PI * r
  const dash = circ - (score / 100) * circ
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24">
        <svg width="96" height="96" className="-rotate-90 absolute inset-0">
          <circle cx="48" cy="48" r={r} fill="none" stroke="#e5e7eb" strokeWidth="7" />
          <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={dash}
            style={{ transition: "stroke-dashoffset 0.6s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-gray-900">{score}</span>
          <span className="text-[9px] text-gray-400">/100</span>
        </div>
      </div>
      <span className="text-xs font-bold" style={{ color }}>{label}</span>
    </div>
  )
}

// ─── Form helpers ─────────────────────────────────────────────────────────────

const emptyForm = (): CleaningPackageForm => ({
  name: "",
  category: "debris",
  size: "",
  capacity: "",
  description: "",
  suitableFor: "",
  features: "",
  priceText: "",
  priceNote: "",
  rentalPeriod: "",
  contactPhone1: "",
  contactPhone2: "",
  pricePerDay: "",
  discountPercent: "0",
  originalPrice: "",
  salePrice: "",
  salePriceExpiresAt: "",
  discountLabel: "",
  images: [""],
  order: 0,
  isActive: true,
  seoEnabled: false,
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  seoSlug: "",
})

function slugify(text: string): string {
  return text
    .replace(/[\s_]+/g, "-")
    .replace(/[^\u0600-\u06FF0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80)
}

function parseImages(raw: any, fallback?: string | null): string[] {
  try {
    const arr = JSON.parse(raw ?? "[]")
    if (Array.isArray(arr) && arr.length > 0) {
      return arr
        .filter((value): value is string => typeof value === "string")
        .map(resolvePackageImageUrl)
    }
  } catch {}
  return fallback ? [resolvePackageImageUrl(fallback)] : [""]
}

function calculateSalePrice(originalPrice: string | number, discountPercent: string | number): string {
  const original = Math.max(0, Number(originalPrice) || 0)
  const percent = Math.min(100, Math.max(0, Number(discountPercent) || 0))
  if (original <= 0 || percent <= 0) return "0"
  return (Math.round(original * (1 - percent / 100) * 100) / 100).toFixed(2).replace(/\.00$/, "")
}

// ─── Main component ───────────────────────────────────────────────────────────

type FormTab = "basic" | "images" | "seo"

export default function AdminPackages() {
  const { companyName } = useSiteSettings()
  const { data: containers = [], refetch } = useGetPackages()
  const { mutate: createPackage, isPending: creating } = useCreatePackage()
  const { mutate: updatePackage, isPending: updating } = useUpdatePackage()
  const { mutate: deletePackage } = useDeletePackage()

  const [editing, setEditing] = useState<number | "new" | null>(null)
  const [form, setForm] = useState<CleaningPackageForm>(emptyForm())
  const [imageUploading, setImageUploading] = useState(false)
  const [tab, setTab] = useState<FormTab>("basic")
  const [aiGenerating, setAiGenerating] = useState(false)
  const { toast } = useToast()
  const formRef = useRef<HTMLDivElement>(null)

  // Scroll form into view whenever editing opens
  useEffect(() => {
    if (editing !== null) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 50)
    }
  }, [editing])

  const openNew = () => {
    setForm({ ...emptyForm(), order: containers.length })
    setEditing("new")
    setTab("basic")
  }

  const openEdit = (c: CleaningPackage) => {
    const raw = c as any
    setForm({
      name: c.name,
      category: c.category ?? "debris",
      size: c.size,
      capacity: c.capacity,
      description: c.description,
      suitableFor: raw.suitableFor ?? "",
      features: Array.isArray(c.features) ? c.features.join("\n") : "",
      priceText: raw.priceText ?? "",
      priceNote: raw.priceNote ?? "",
      rentalPeriod: raw.rentalPeriod ?? "",
      contactPhone1: raw.contactPhone1 ?? "",
      contactPhone2: raw.contactPhone2 ?? "",
      pricePerDay: String(c.pricePerDay),
      discountPercent: String(raw.discountPercent ?? 0),
      originalPrice: String(raw.originalPrice ?? c.pricePerDay ?? ""),
       salePrice: calculateSalePrice(raw.originalPrice ?? c.pricePerDay ?? "", raw.discountPercent ?? 0),
      salePriceExpiresAt: raw.salePriceExpiresAt ?? "",
      discountLabel: raw.discountLabel ?? "",
      images: parseImages(raw.images, c.imageUrl),
      order: c.order,
      isActive: c.isActive,
      seoEnabled: !!(raw.seoEnabled),
      seoTitle: raw.seoTitle || "",
      seoDescription: raw.seoDescription || "",
      seoKeywords: raw.seoKeywords || "",
      seoSlug: raw.seoSlug || "",
    })
    setEditing(c.id)
    setTab("basic")
  }

  const handleSave = () => {
    if (imageUploading) {
      toast({ title: "انتظر اكتمال رفع الصورة أولاً", variant: "destructive" })
      return
    }
    const validImages = form.images
      .map(resolvePackageImageUrl)
      .filter(u => u.trim())
    const discountPercent = Math.min(100, Math.max(0, parseFloat(form.discountPercent) || 0))
    const originalPrice = Math.max(0, parseFloat(form.originalPrice) || 0)
    const salePrice = Number(calculateSalePrice(originalPrice, discountPercent))
    const offerEnabled = discountPercent > 0 && originalPrice > 0 && salePrice > 0
    const payload: any = {
      name: form.name,
      category: form.category,
      size: form.size,
      capacity: form.capacity,
      description: form.description,
      suitableFor: form.suitableFor,
      features: form.features.split("\n").map(s => s.trim()).filter(Boolean),
      priceText: form.priceText,
      priceNote: form.priceNote,
      rentalPeriod: form.rentalPeriod,
      contactPhone1: form.contactPhone1,
      contactPhone2: form.contactPhone2,
      pricePerDay: parseFloat(form.pricePerDay) || 0,
      discountPercent: offerEnabled ? discountPercent : 0,
      originalPrice,
      salePrice: offerEnabled ? salePrice : 0,
      salePriceExpiresAt: offerEnabled ? form.salePriceExpiresAt : "",
      discountLabel: offerEnabled ? form.discountLabel : "",
      imageUrl: validImages[0] || "",
      images: JSON.stringify(validImages),
      order: form.order,
      isActive: form.isActive,
      seoEnabled: form.seoEnabled,
      seoTitle: form.seoTitle,
      seoDescription: form.seoDescription,
      seoKeywords: form.seoKeywords,
      seoSlug: form.seoSlug,
    }
    if (editing === "new") {
      createPackage({ data: payload }, {
        onSuccess: () => {
          refetch()
          setEditing(null)
          toast({ title: "تم حفظ الباقة والعرض بنجاح" })
        },
        onError: (error) => {
          toast({ title: "تعذر حفظ الباقة", description: String(error), variant: "destructive" })
        },
      })
    } else if (typeof editing === "number") {
      updatePackage({ id: editing, data: payload }, {
        onSuccess: () => {
          refetch()
          setEditing(null)
          toast({ title: "تم تحديث الباقة والعرض بنجاح" })
        },
        onError: (error) => {
          toast({ title: "تعذر تحديث الباقة", description: String(error), variant: "destructive" })
        },
      })
    }
  }

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الباقة؟")) {
      deletePackage({ id }, { onSuccess: () => refetch() })
    }
  }

  const toggleActive = (c: CleaningPackage) => {
    updatePackage({ id: c.id, data: { isActive: !c.isActive } as any }, { onSuccess: () => refetch() })
  }

  async function generateSeoWithAI(descriptionOnly = false) {
    if (!form.name && !form.description) {
      toast({ title: "يرجى إدخال اسم الباقة أو وصفها أولاً", variant: "destructive" })
      return
    }
    setAiGenerating(true)
    try {
      const r = await fetch(`${API_BASE}/api/admin/ai/generate-seo`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
        body: JSON.stringify({ title: form.name, description: form.description }),
      })
      const data = await r.json() as {
        serviceDescription?: string
        seoTitle?: string; seoDescription?: string; seoKeywords?: string; seoSlug?: string
        provider?: string; error?: string
      }
      if (!r.ok) throw new Error(data.error ?? "فشل التوليد")

      if (descriptionOnly) {
        setForm(f => ({ ...f, description: data.serviceDescription || f.description }))
        toast({ title: `تم توليد الوصف بـ ${data.provider ?? "AI"} ✓`, description: "راجع النص وعدّله حسب الحاجة" })
      } else {
        setForm(f => ({
          ...f,
          description:    data.serviceDescription || f.description,
          seoTitle:       data.seoTitle       || f.seoTitle,
          seoDescription: data.seoDescription || f.seoDescription,
          seoKeywords:    data.seoKeywords    || f.seoKeywords,
          seoSlug:        data.seoSlug        ? slugify(data.seoSlug) : f.seoSlug,
        }))
        toast({ title: `تم التوليد بـ ${data.provider ?? "AI"} ✓`, description: "تم ملء الوصف وبيانات السيو — راجعها وعدّلها حسب الحاجة" })
      }
    } catch (e) {
      toast({ title: "فشل التوليد", description: String(e), variant: "destructive" })
    } finally {
      setAiGenerating(false)
    }
  }

  const isContract = form.category === "contract"
  const seoChecks  = calcSeoChecks(form)
  const seoScore   = calcOverallScore(seoChecks)

  const TABS: { id: FormTab; label: string; icon: React.ElementType }[] = [
    { id: "basic",  label: "معلومات الباقة", icon: Settings },
    { id: "images", label: `الصور (${form.images.filter(u => u.trim()).length})`, icon: Images },
    { id: "seo",    label: form.seoEnabled ? `السيو (${seoScore}/100)` : "السيو", icon: Search },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">إدارة باقات النظافة</h2>
        <Button onClick={openNew} className="gap-2">
          <Plus size={16} /> إضافة باقة جديدة
        </Button>
      </div>

      {/* ═══════════════ FORM PANEL ═══════════════ */}
      {editing !== null && (
        <Card ref={formRef} className="border-primary/30 shadow-md">
          <CardHeader className="pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-800">
                {editing === "new" ? "إضافة باقة جديدة" : "تعديل الباقة"}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setEditing(null)}>
                <X size={16} />
              </Button>
            </div>
            {/* Tab bar */}
            <div className="flex gap-1 bg-gray-50 p-1 rounded-xl mt-3">
              {TABS.map(t => {
                const Icon = t.icon
                return (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all flex-1 justify-center ${
                      tab === t.id ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-800"
                    }`}>
                    <Icon size={14} />
                    {t.label}
                  </button>
                )
              })}
            </div>
          </CardHeader>

          <CardContent className="p-6">

            {/* ── Tab 1: Basic ───────────────────────────────────────────────── */}
            {tab === "basic" && (
              <div className="space-y-4">
                {/* Category */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">الفئة *</label>
                  <div className="flex gap-2">
                    {CATEGORIES.map((cat) => (
                      <button key={cat.value} type="button"
                        onClick={() => setForm({ ...form, category: cat.value })}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                          form.category === cat.value
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-gray-600 border-gray-200 hover:border-primary/50"
                        }`}>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name + Size + Capacity */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">اسم الباقة *</label>
                    <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="باقة تنظيف الشقق" dir="rtl" />
                  </div>
                  {!isContract && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">الحجم</label>
                        <Input value={form.size} onChange={e => setForm({ ...form, size: e.target.value })}
                          placeholder="12 ياردة" dir="rtl" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">الطاقة الاستيعابية</label>
                        <Input value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })}
                          placeholder="مناسب للمنازل" dir="rtl" />
                      </div>
                    </>
                  )}
                </div>

                {/* Sale pricing */}
                <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 space-y-4">
                  <div>
                    <h4 className="font-black text-rose-900">العرض والخصم</h4>
                    <p className="text-xs text-rose-700/70 mt-1">اترك الخصم 0 لإخفاء بادج العرض من بطاقة الباقة.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">نسبة الخصم %</label>
                      <Input type="number" min="0" max="100" value={form.discountPercent}
                         onChange={e => {
                           const discountPercent = e.target.value
                           setForm({
                             ...form,
                             discountPercent,
                             salePrice: calculateSalePrice(form.originalPrice, discountPercent),
                           })
                         }} placeholder="20" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">السعر قبل الخصم</label>
                      <Input type="number" min="0" step="0.01" value={form.originalPrice}
                         onChange={e => {
                           const originalPrice = e.target.value
                           setForm({
                             ...form,
                             originalPrice,
                             salePrice: calculateSalePrice(originalPrice, form.discountPercent),
                           })
                         }} placeholder="500" />
                    </div>
                    <div>
                       <label className="text-sm font-medium text-gray-700 mb-1 block">السعر بعد الخصم</label>
                       <div className="relative">
                         <Input
                           type="number"
                           value={calculateSalePrice(form.originalPrice, form.discountPercent)}
                           readOnly
                           tabIndex={-1}
                           className="bg-white/70 font-black text-emerald-700"
                         />
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600">محسوب تلقائياً</span>
                       </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <label className="text-sm font-medium text-gray-700 mb-1 block">اسم البادج</label>
                       <select
                         value={form.discountLabel}
                         onChange={e => setForm({ ...form, discountLabel: e.target.value })}
                         className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                         dir="rtl"
                       >
                         <option value="">بدون اسم — سيظهر الخصم فقط</option>
                         {OFFER_BADGE_OPTIONS.map(label => <option key={label} value={label}>{label}</option>)}
                       </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">ينتهي السعر في</label>
                      <Input type="datetime-local" value={form.salePriceExpiresAt ? form.salePriceExpiresAt.slice(0, 16) : ""}
                        onChange={e => setForm({ ...form, salePriceExpiresAt: e.target.value ? new Date(e.target.value).toISOString() : "" })} />
                    </div>
                  </div>
                </div>

                {/* Description + SuitableFor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-gray-700">الوصف *</label>
                      <button type="button"
                        onClick={() => generateSeoWithAI(true)}
                        disabled={aiGenerating || (!form.name && !form.description)}
                        className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 transition-colors font-medium">
                        {aiGenerating
                          ? <><Loader2 size={11} className="animate-spin" /> جاري التوليد...</>
                          : <><Sparkles size={11} /> توليد بالذكاء الاصطناعي</>}
                      </button>
                    </div>
                    <textarea value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      placeholder="وصف تفصيلي للباقة — يُنصح بـ 30 كلمة أو أكثر لقوة المحتوى"
                      rows={4} dir="rtl"
                      className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                    <div className="flex items-center gap-2 mt-1">
                      {(() => {
                        const wc = form.description.trim().split(/\s+/).filter(Boolean).length
                        const color = wc >= 30 ? "text-green-600" : wc >= 10 ? "text-amber-500" : "text-red-500"
                        return (
                          <p className={`text-xs ${color} font-medium`}>
                            {wc} كلمة
                            {wc < 30 && <span className="text-gray-400 font-normal mr-1">— يُنصح بـ 30+ كلمة للسيو</span>}
                            {wc >= 30 && <span className="mr-1">✓</span>}
                          </p>
                        )
                      })()}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">مناسب لـ</label>
                    <textarea value={form.suitableFor}
                      onChange={e => setForm({ ...form, suitableFor: e.target.value })}
                      placeholder="مقاولي البناء، أصحاب المنازل..."
                      rows={4} dir="rtl"
                      className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">المميزات (سطر لكل ميزة)</label>
                  <textarea value={form.features}
                    onChange={e => setForm({ ...form, features: e.target.value })}
                    placeholder={"ميزة أولى\nميزة ثانية\nميزة ثالثة"}
                    rows={3} dir="rtl"
                    className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">نص السعر (للعرض)</label>
                    <Input value={form.priceText} onChange={e => setForm({ ...form, priceText: e.target.value })}
                      placeholder="400 ريال / للرد الواحد" dir="rtl" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">ملاحظة السعر</label>
                    <Input value={form.priceNote} onChange={e => setForm({ ...form, priceNote: e.target.value })}
                      placeholder="550 ريال شمال الرياض" dir="rtl" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">مدة الإيجار</label>
                    <Input value={form.rentalPeriod} onChange={e => setForm({ ...form, rentalPeriod: e.target.value })}
                      placeholder="10 أيام كحد أقصى" dir="rtl" />
                  </div>
                </div>

                {/* Contact Phones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">رقم التواصل الأساسي</label>
                    <Input value={form.contactPhone1} onChange={e => setForm({ ...form, contactPhone1: e.target.value })}
                      placeholder="05xxxxxxxx" dir="ltr" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">رقم التواصل البديل</label>
                    <Input value={form.contactPhone2} onChange={e => setForm({ ...form, contactPhone2: e.target.value })}
                      placeholder="05xxxxxxxx (اختياري)" dir="ltr" />
                  </div>
                </div>

                {/* Price + Order + Active */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">السعر الرقمي (للفرز)</label>
                    <Input type="number" value={form.pricePerDay}
                      onChange={e => setForm({ ...form, pricePerDay: e.target.value })} placeholder="400" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">الترتيب</label>
                    <Input type="number" value={form.order}
                      onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.isActive}
                        onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4" />
                      <span className="text-sm font-medium text-gray-700">نشط ومرئي في الموقع</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab 2: Images ──────────────────────────────────────────────── */}
            {tab === "images" && (
              <ImagesTab
                images={form.images}
                onUpdate={(imgs) => setForm(f => ({ ...f, images: imgs }))}
                onUploadingChange={setImageUploading}
              />
            )}

            {/* ── Tab 3: SEO ─────────────────────────────────────────────────── */}
            {tab === "seo" && (
              <div className="space-y-5">
                {/* SEO toggle */}
                <div className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                  form.seoEnabled ? "border-primary bg-primary/5" : "border-gray-200 bg-gray-50"
                }`}>
                  <div>
                    <p className="font-bold text-gray-800">تفعيل السيو لهذه الباقة</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {form.seoEnabled
                        ? "السيو مفعّل — ستُرفق بيانات الباقة في نتائج جوجل"
                        : "السيو معطّل — لن تظهر البيانات الوصفية لهذه الباقة"}
                    </p>
                  </div>
                  <button onClick={() => setForm(f => ({ ...f, seoEnabled: !f.seoEnabled }))}>
                    {form.seoEnabled
                      ? <ToggleRight size={40} className="text-primary" />
                      : <ToggleLeft  size={40} className="text-gray-300" />}
                  </button>
                </div>

                {form.seoEnabled && (
                  <>
                    {/* Score + checks */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center gap-3">
                        <p className="text-xs font-bold text-gray-500 self-start">قوة المحتوى</p>
                        <SeoScoreGauge score={seoScore} />
                        <div className="grid grid-cols-3 gap-1.5 w-full text-center">
                          {[
                            { label: "ممتاز", count: seoChecks.filter(c => c.status === "ok").length,    cls: "text-green-700 bg-green-50" },
                            { label: "تحذير", count: seoChecks.filter(c => c.status === "warn").length,  cls: "text-amber-700 bg-amber-50" },
                            { label: "خطأ",   count: seoChecks.filter(c => c.status === "error").length, cls: "text-red-600   bg-red-50"   },
                          ].map(s => (
                            <div key={s.label} className={`rounded-xl py-1.5 ${s.cls}`}>
                              <p className="font-black text-base">{s.count}</p>
                              <p className="text-[10px]">{s.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                        <p className="text-xs font-bold text-gray-500">مؤشرات متطلبات جوجل</p>
                        {seoChecks.map((check, i) => <SeoCheckRow key={i} check={check} />)}
                      </div>
                    </div>

                    {/* SEO Fields */}
                    <div className="space-y-4 bg-gray-50 rounded-2xl border border-gray-100 p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-500">بيانات السيو</p>
                        <button type="button"
                          onClick={() => generateSeoWithAI(false)}
                          disabled={aiGenerating}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-60 transition-colors font-medium">
                          {aiGenerating
                            ? <><Loader2 size={12} className="animate-spin" /> جاري التوليد...</>
                            : <>✨ توليد بالذكاء الاصطناعي</>}
                        </button>
                      </div>

                      {/* Title */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-sm font-medium text-gray-700">عنوان السيو (Title Tag) *</label>
                          <span className={`text-xs font-mono ${
                            form.seoTitle.length === 0 ? "text-gray-400"
                            : form.seoTitle.length <= 60 ? "text-green-600"
                            : "text-red-500"
                          }`}>{form.seoTitle.length} / 60</span>
                        </div>
                        <Input value={form.seoTitle}
                          onChange={e => setForm({ ...form, seoTitle: e.target.value })}
                          placeholder={`مثال: شركة تنظيف منازل بالرياض — ${companyName}`}
                          dir="rtl" />
                        <p className="text-[11px] text-gray-400 mt-1">الهدف: 50-60 حرف — يظهر كعنوان النتيجة في جوجل</p>
                      </div>

                      {/* Description */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-sm font-medium text-gray-700">وصف السيو (Meta Description) *</label>
                          <span className={`text-xs font-mono ${
                            form.seoDescription.length === 0 ? "text-gray-400"
                            : form.seoDescription.length <= 160 ? "text-green-600"
                            : "text-red-500"
                          }`}>{form.seoDescription.length} / 160</span>
                        </div>
                        <textarea value={form.seoDescription}
                          onChange={e => setForm({ ...form, seoDescription: e.target.value })}
                          placeholder="وصف مختصر للباقة يظهر أسفل العنوان في نتائج جوجل..."
                          rows={3} dir="rtl"
                          className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none bg-white" />
                        <p className="text-[11px] text-gray-400 mt-1">الهدف: 120-160 حرف — يظهر كوصف النتيجة في جوجل</p>
                      </div>

                      {/* Keywords */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">الكلمات المفتاحية</label>
                        <Input value={form.seoKeywords}
                          onChange={e => setForm({ ...form, seoKeywords: e.target.value })}
                          placeholder="تأجير باقات التنظيف, باقات التنظيف أنقاض, نقل مخلفات الرياض"
                          dir="rtl" />
                        <p className="text-[11px] text-gray-400 mt-1">
                          مفصولة بفواصل —&nbsp;
                          {form.seoKeywords.split(/[,،]/g).filter(k => k.trim()).length} كلمة&nbsp;
                          {form.seoKeywords.split(/[,،]/g).filter(k => k.trim()).length < 3 &&
                            <span className="text-amber-500">(يُنصح بـ 3+)</span>}
                        </p>
                      </div>

                      {/* Slug */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                          <Link2 size={13} className="text-gray-500" />
                          رابط الباقة (Slug) *
                        </label>
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono">/</span>
                            <Input value={form.seoSlug}
                              onChange={e => setForm({ ...form, seoSlug: slugify(e.target.value) })}
                              placeholder="تنظيف-فلل-بالرياض"
                              dir="rtl"
                              className="pr-6 bg-white font-mono text-sm" />
                          </div>
                          <Button variant="outline" size="sm"
                            onClick={() => setForm(f => ({ ...f, seoSlug: slugify(f.name) }))}
                            className="text-xs shrink-0">
                            توليد تلقائي
                          </Button>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">حروف عربية وأرقام وشرطات فقط</p>
                      </div>
                    </div>

                    {/* Google SERP preview */}
                    {(form.seoTitle || form.seoDescription) && (
                      <div className="bg-white rounded-2xl border border-gray-200 p-5">
                        <p className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1.5">
                          <Search size={12} /> معاينة كيف تظهر في جوجل
                        </p>
                        <div className="max-w-xl font-sans" dir="rtl">
                          <div className="text-xs text-gray-400 mb-1 font-mono">
                            /container/{form.seoSlug || "..."}
                          </div>
                          <div className="text-lg font-medium text-blue-700 cursor-pointer hover:underline leading-snug">
                            {form.seoTitle || <span className="text-gray-400 italic">(لا يوجد عنوان)</span>}
                          </div>
                          <div className="text-sm text-gray-600 mt-1 leading-relaxed">
                            {form.seoDescription || <span className="text-gray-400 italic">(لا يوجد وصف)</span>}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Save / Cancel */}
            <div className="flex gap-3 pt-5 border-t border-gray-100 mt-5">
              <Button onClick={handleSave} disabled={creating || updating || imageUploading} className="gap-2 bg-primary">
                <Check size={16} />
                {imageUploading ? "جاري رفع الصورة..." : creating || updating ? "جاري الحفظ..." : "حفظ الباقة"}
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)} className="gap-2">
                <X size={16} /> إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══════════════ CONTAINERS GRID ═══════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {containers.map((c) => {
          const raw = c as any
          const imgs = (() => { try { return JSON.parse(raw.images || "[]") } catch { return [] } })()
          const imgCount = imgs.filter((u: string) => u).length || (c.imageUrl ? 1 : 0)
          const seoOn = !!(raw.seoEnabled)
          const seoScore_ = seoOn
            ? calcOverallScore(calcSeoChecks({
                ...emptyForm(),
                name: c.name, description: c.description,
                images: imgs.length ? imgs : c.imageUrl ? [c.imageUrl] : [],
                seoEnabled: true,
                seoTitle: raw.seoTitle || "", seoDescription: raw.seoDescription || "",
                seoKeywords: raw.seoKeywords || "", seoSlug: raw.seoSlug || "",
              }))
            : null
          const firstImg = resolvePackageImageUrl(imgs.find((u: string) => u) || c.imageUrl)

          return (
            <Card key={c.id} className="overflow-hidden">
              {firstImg ? (
                <div className="h-36 bg-gray-100 overflow-hidden relative">
                  <img src={firstImg} alt={c.name} className="w-full h-full object-cover" />
                  {imgCount > 1 && (
                    <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      +{imgCount - 1} صور
                    </span>
                  )}
                </div>
              ) : null}
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[c.category ?? "debris"] ?? "bg-gray-100 text-gray-600"}`}>
                        {categoryLabels[c.category ?? "debris"] ?? c.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {c.isActive ? "نشط" : "مخفي"}
                      </span>
                      {seoOn && seoScore_ !== null && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                          seoScore_ >= 80 ? "bg-green-100 text-green-700"
                          : seoScore_ >= 50 ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-600"
                        }`}>
                          <Search size={9} /> سيو {seoScore_}/100
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900">{c.name}</h3>
                    {(c.size || c.capacity) && (
                      <p className="text-sm text-primary font-medium">{[c.size, c.capacity].filter(Boolean).join(" — ")}</p>
                    )}
                  </div>
                  <div className="text-left shrink-0 mr-2">
                    {raw.priceText ? (
                      <span className="text-sm font-bold text-gray-800">{raw.priceText}</span>
                    ) : c.pricePerDay > 0 ? (
                      <span className="font-bold text-gray-900">{c.pricePerDay} ر.س</span>
                    ) : null}
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                      <Image size={11} />
                      <span>{imgCount} {imgCount === 1 ? "صورة" : "صور"}</span>
                    </div>
                  </div>
                </div>

                {(raw.contactPhone1 || raw.contactPhone2) && (
                  <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                    <Phone size={12} />
                    <span dir="ltr">{[raw.contactPhone1, raw.contactPhone2].filter(Boolean).join(" / ")}</span>
                  </div>
                )}

                {Array.isArray(c.features) && c.features.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {c.features.map((f, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{f}</span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <Button variant="ghost" size="sm" onClick={() => toggleActive(c)} className="gap-1.5 text-gray-500">
                    {c.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                    {c.isActive ? "إخفاء" : "إظهار"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(c)} className="gap-1.5 text-blue-500 hover:bg-blue-50">
                    <Pencil size={14} /> تعديل
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="gap-1.5 text-red-400 hover:bg-red-50 mr-auto">
                    <Trash2 size={14} /> حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {containers.length === 0 && (
          <div className="col-span-2">
            <Card>
              <CardContent className="py-16 flex flex-col items-center gap-3 text-gray-400">
                <Box size={48} strokeWidth={1} />
                <p className="text-lg font-medium">لا توجد باقات بعد</p>
                <Button onClick={openNew} variant="outline" className="gap-2 mt-2"><Plus size={16} /> أضف باقة جديدة</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
