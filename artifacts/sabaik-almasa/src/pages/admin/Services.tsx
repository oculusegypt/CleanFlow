import { useState, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { useSiteSettings } from "@/context/SiteSettingsContext"
import { useGetServices, useCreateService, useUpdateService, useDeleteService } from "@workspace/api-client-react"
import type { Service } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Plus, Pencil, Trash2, Settings, Eye, EyeOff, X, Check,
  Search, AlertTriangle, CheckCircle2, XCircle, Image, Link2,
  Images, ToggleLeft, ToggleRight, Upload, Loader2, Sparkles,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceForm = {
  title: string
  description: string
  icon: string
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
  score: number   // 0–1
  status: "ok" | "warn" | "error"
}

// ─── SEO helpers ──────────────────────────────────────────────────────────────

function calcSeoChecks(form: ServiceForm): SeoCheck[] {
  const titleLen   = form.seoTitle.trim().length
  const descLen    = form.seoDescription.trim().length
  const kwList     = form.seoKeywords.split(/[,،]/).map(k => k.trim()).filter(Boolean)
  const imgCount   = form.images.filter(u => u.trim()).length
  const wordCount  = form.description.trim().split(/\s+/).filter(Boolean).length
  const slug       = form.seoSlug.trim()
  const slugOk     = slug.length > 0 && /^[\u0600-\u06FF0-9-]+$/.test(slug)

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
      label: "صور الخدمة",
      hint:
        imgCount === 0 ? "لا توجد صور — أضف صورة واحدة على الأقل" :
        imgCount === 1 ? "صورة واحدة — يُنصح بإضافة 2-3 صور" :
                         `${imgCount} صور — ممتاز ✓`,
      score:  imgCount === 0 ? 0 : imgCount === 1 ? 0.6 : 1,
      status: imgCount === 0 ? "error" : imgCount === 1 ? "warn" : "ok",
    },
    {
      label: "محتوى وصف الخدمة",
      hint:
        wordCount < 10 ? `${wordCount} كلمات — قليل جداً (الهدف 30+ كلمة)` :
        wordCount < 30 ? `${wordCount} كلمة — مقبول (يُنصح بـ 30+) — من حقل وصف الخدمة في الأعلى` :
                         `${wordCount} كلمة — ممتاز ✓`,
      score:  wordCount < 10 ? 0.2 : wordCount < 30 ? 0.6 : 1,
      status: wordCount < 10 ? "error" : wordCount < 30 ? "warn" : "ok",
    },
    {
      label: "رابط الصفحة (Slug)",
      hint:
        !slug    ? "مطلوب — أضف رابطاً عربياً للخدمة" :
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

// ─── Images Tab Component ─────────────────────────────────────────────────────

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || ""

type ImagesTabProps = {
  images: string[]
  onUpdate: (imgs: string[]) => void
}

function ImagesTab({ images, onUpdate }: ImagesTabProps) {
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
      setUploadErrors(prev => { const e = { ...prev }; delete e[i]; return e })
      try {
        const fd = new FormData()
        fd.append("file", file)
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
      }
    }
    input.click()
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        أضف صور الخدمة — الصورة الأولى هي الصورة الرئيسية للبطاقة
      </p>

      <div className="space-y-4">
        {images.map((url, i) => (
          <div key={i} className="space-y-2">
            {/* Row: index + upload button + URL input + delete */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 w-5 text-center shrink-0">{i + 1}</span>

              {/* Upload from device */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5 px-2.5 h-9"
                onClick={() => pickAndUpload(i)}
                disabled={uploading === i}
                title="رفع صورة من جهازك"
              >
                {uploading === i
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Upload size={14} />}
                <span className="text-xs hidden sm:inline">رفع</span>
              </Button>

              {/* URL input */}
              <div className="relative flex-1">
                <Link2 size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <Input
                  value={url}
                  onChange={e => updateImage(i, e.target.value)}
                  placeholder="أو أدخل رابط الصورة مباشرةً"
                  dir="ltr"
                  className="font-mono text-xs pr-8"
                />
              </div>

              {/* Remove */}
              <Button variant="ghost" size="icon"
                onClick={() => removeImage(i)}
                disabled={images.length === 1}
                className="text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0 h-9 w-9">
                <X size={14} />
              </Button>
            </div>

            {/* Upload error */}
            {uploadErrors[i] && (
              <p className="text-xs text-red-500 mr-7">{uploadErrors[i]}</p>
            )}

            {/* Preview */}
            {url.trim() && (
              <div className="mr-7 flex items-center gap-3">
                <img
                  src={url}
                  alt=""
                  className="h-28 w-auto rounded-xl object-cover border border-gray-200"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
                  onLoad={e  => { (e.target as HTMLImageElement).style.display = "" }}
                />
                {i === 0 && (
                  <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold">
                    ★ الصورة الرئيسية
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={addImage} className="gap-2 w-full border-dashed">
        <Plus size={14} /> إضافة صورة أخرى
      </Button>

      {/* Preview strip */}
      {images.filter(u => u.trim()).length > 1 && (
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs text-gray-500 font-bold mb-2">
            معاينة الصور ({images.filter(u => u.trim()).length})
          </p>
          <div className="flex gap-2 flex-wrap">
            {images.filter(u => u.trim()).map((imgUrl, i) => (
              <div key={i} className="relative shrink-0">
                <img
                  src={imgUrl}
                  alt=""
                  className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                  onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = "none" }}
                />
                {i === 0 && (
                  <span className="absolute bottom-1 right-1 bg-primary text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                    رئيسية
                  </span>
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
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${check.score * 100}%` }}
        />
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

const emptyForm = (): ServiceForm => ({
  title: "",
  description: "",
  icon: "Wrench",
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
    if (Array.isArray(arr) && arr.length > 0) return arr
  } catch {}
  return fallback ? [fallback] : [""]
}

// ─── Main component ───────────────────────────────────────────────────────────

type FormTab = "basic" | "images" | "seo"

export default function AdminServices() {
  const { companyName } = useSiteSettings()
  const { data: services = [], refetch } = useGetServices()
  const { mutate: createService, isPending: creating } = useCreateService()
  const { mutate: updateService, isPending: updating } = useUpdateService()
  const { mutate: deleteService } = useDeleteService()

  const [editing, setEditing] = useState<number | "new" | null>(null)
  const [form, setForm]       = useState<ServiceForm>(emptyForm())
  const [tab, setTab]         = useState<FormTab>("basic")
  const formRef               = useRef<HTMLDivElement | null>(null)

  const scrollToForm = () => {
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    }, 100)
  }

  const openNew = () => {
    setForm({ ...emptyForm(), order: services.length })
    setEditing("new")
    setTab("basic")
    scrollToForm()
  }

  const openEdit = (svc: Service) => {
    const raw = svc as any
    setForm({
      title:          svc.title,
      description:    svc.description,
      icon:           svc.icon,
      images:         parseImages(raw.images, svc.imageUrl),
      order:          svc.order,
      isActive:       svc.isActive,
      seoEnabled:     !!(raw.seoEnabled),
      seoTitle:       raw.seoTitle   || "",
      seoDescription: raw.seoDescription || "",
      seoKeywords:    raw.seoKeywords || "",
      seoSlug:        raw.seoSlug    || "",
    })
    setEditing(svc.id)
    setTab("basic")
    scrollToForm()
  }

  const handleSave = () => {
    const validImages = form.images.filter(u => u.trim())
    const payload: any = {
      title:          form.title,
      description:    form.description,
      icon:           form.icon,
      imageUrl:       validImages[0] || undefined,
      images:         JSON.stringify(validImages),
      order:          form.order,
      isActive:       form.isActive,
      seoEnabled:     form.seoEnabled,
      seoTitle:       form.seoTitle,
      seoDescription: form.seoDescription,
      seoKeywords:    form.seoKeywords,
      seoSlug:        form.seoSlug,
    }
    if (editing === "new") {
      createService({ data: payload }, { onSuccess: () => { refetch(); setEditing(null) } })
    } else if (typeof editing === "number") {
      updateService({ id: editing, data: payload }, { onSuccess: () => { refetch(); setEditing(null) } })
    }
  }

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الخدمة؟"))
      deleteService({ id }, { onSuccess: () => refetch() })
  }

  const toggleActive = (svc: Service) =>
    updateService({ id: svc.id, data: { isActive: !svc.isActive } as any }, { onSuccess: () => refetch() })

  const addImage    = () => setForm(f => ({ ...f, images: [...f.images, ""] }))
  const removeImage = (i: number) => setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }))
  const updateImage = (i: number, val: string) =>
    setForm(f => { const imgs = [...f.images]; imgs[i] = val; return { ...f, images: imgs } })

  // ── AI SEO generation ──────────────────────────────────────────────────────
  const [aiGenerating, setAiGenerating] = useState(false)
  const { toast } = useToast()

  async function generateSeoWithAI(descriptionOnly = false) {
    if (!form.title && !form.description) {
      toast({ title: "يرجى إدخال اسم الخدمة أو وصفها أولاً", variant: "destructive" })
      return
    }
    setAiGenerating(true)
    try {
      const r = await fetch(`${API_BASE}/api/admin/ai/generate-seo`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
        body: JSON.stringify({ title: form.title, description: form.description }),
      })
      const data = await r.json() as {
        serviceDescription?: string
        seoTitle?: string; seoDescription?: string; seoKeywords?: string; seoSlug?: string
        provider?: string; error?: string
      }
      if (!r.ok) throw new Error(data.error ?? "فشل التوليد")

      if (descriptionOnly) {
        // Only fill the main description field
        setForm(f => ({
          ...f,
          description: data.serviceDescription || f.description,
        }))
        toast({ title: `تم توليد الوصف بـ ${data.provider ?? "AI"} ✓`, description: "راجع النص وعدّله حسب الحاجة" })
      } else {
        // Fill SEO fields + main description
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

  // Live SEO score
  const seoChecks = calcSeoChecks(form)
  const seoScore  = calcOverallScore(seoChecks)

  const TABS: { id: FormTab; label: string; icon: React.ElementType }[] = [
    { id: "basic",  label: "معلومات الخدمة",  icon: Settings },
    { id: "images", label: `الصور (${form.images.filter(u => u.trim()).length})`, icon: Images },
    { id: "seo",    label: form.seoEnabled ? `السيو (${seoScore}/100)` : "السيو", icon: Search },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">إدارة الخدمات</h2>
        <Button onClick={openNew} className="gap-2">
          <Plus size={16} /> إضافة خدمة
        </Button>
      </div>

      {/* ═══════════════ FORM PANEL ═══════════════ */}
      {editing !== null && (
        <div ref={formRef} className="scroll-mt-6">
          <Card className="border-primary/30 shadow-md">
            <CardHeader className="pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-gray-800">
                  {editing === "new" ? "إضافة خدمة جديدة" : "تعديل الخدمة"}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="service-title" className="text-sm font-medium text-gray-700 mb-1 block">اسم الخدمة *</label>
                    <Input id="service-title" name="title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                      placeholder="اسم الخدمة" dir="rtl" />
                  </div>
                  <div>
                    <label htmlFor="service-icon" className="text-sm font-medium text-gray-700 mb-1 block">الأيقونة (Lucide)</label>
                    <Input id="service-icon" name="icon" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })}
                      placeholder="Wrench" dir="ltr" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="service-desc" className="text-sm font-medium text-gray-700">الوصف *</label>
                    <button
                      type="button"
                      onClick={() => generateSeoWithAI(true)}
                      disabled={aiGenerating || (!form.title && !form.description)}
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 transition-colors font-medium"
                    >
                      {aiGenerating
                        ? <><Loader2 size={11} className="animate-spin" /> جاري التوليد...</>
                        : <><Sparkles size={11} /> توليد وصف بالذكاء الاصطناعي</>}
                    </button>
                  </div>
                  <textarea
                    id="service-desc"
                    name="description"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="وصف تفصيلي للخدمة — يُنصح بـ 30 كلمة أو أكثر لقوة المحتوى"
                    rows={4} dir="rtl"
                    className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="service-order" className="text-sm font-medium text-gray-700 mb-1 block">الترتيب</label>
                    <Input id="service-order" name="order" type="number" value={form.order}
                      onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="flex items-end pb-1">
                    <label htmlFor="service-isactive" className="flex items-center gap-2 cursor-pointer">
                      <input id="service-isactive" name="isActive" type="checkbox" checked={form.isActive}
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
                    <p className="font-bold text-gray-800">تفعيل السيو لهذه الخدمة</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {form.seoEnabled
                        ? "السيو مفعّل — ستُرفق بيانات الخدمة في نتائج جوجل"
                        : "السيو معطّل — لن تظهر البيانات الوصفية لهذه الخدمة"}
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
                      {/* Gauge */}
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
                        {seoScore < 80 && (
                          <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                            أكمل المتطلبات المميّزة بـ <span className="text-red-400 font-bold">✕</span> و <span className="text-amber-500 font-bold">⚠</span> لرفع الدرجة
                          </p>
                        )}
                      </div>

                      {/* Checks list */}
                      <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                        <p className="text-xs font-bold text-gray-500">مؤشرات متطلبات جوجل</p>
                        {seoChecks.map((check, i) => <SeoCheckRow key={i} check={check} />)}
                      </div>
                    </div>

                    {/* SEO Fields */}
                    <div className="space-y-4 bg-gray-50 rounded-2xl border border-gray-100 p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-500">بيانات السيو</p>
                        <button
                          type="button"
                          onClick={() => generateSeoWithAI(false)}
                          disabled={aiGenerating}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-60 transition-colors font-medium"
                        >
                          {aiGenerating
                            ? <><Loader2 size={12} className="animate-spin" /> جاري التوليد...</>
                            : <>✨ توليد بالذكاء الاصطناعي</>}
                        </button>
                      </div>

                      {/* Title */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label htmlFor="service-seo-title" className="text-sm font-medium text-gray-700">عنوان السيو (Title Tag) *</label>
                          <span className={`text-xs font-mono ${
                            form.seoTitle.length === 0 ? "text-gray-400"
                            : form.seoTitle.length <= 60 ? "text-green-600"
                            : "text-red-500"
                          }`}>{form.seoTitle.length} / 60</span>
                        </div>
                        <Input
                          id="service-seo-title"
                          name="seoTitle"
                          value={form.seoTitle}
                          onChange={e => setForm({ ...form, seoTitle: e.target.value })}
                          placeholder={`مثال: تأجير باقات التنظيف الرياض — ${companyName}`}
                          dir="rtl"
                        />
                        <p className="text-[11px] text-gray-400 mt-1">الهدف: 50-60 حرف — يظهر كعنوان النتيجة في جوجل</p>
                      </div>

                      {/* Description */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label htmlFor="service-seo-desc" className="text-sm font-medium text-gray-700">وصف السيو (Meta Description) *</label>
                          <span className={`text-xs font-mono ${
                            form.seoDescription.length === 0 ? "text-gray-400"
                            : form.seoDescription.length <= 160 ? "text-green-600"
                            : "text-red-500"
                          }`}>{form.seoDescription.length} / 160</span>
                        </div>
                        <textarea
                          id="service-seo-desc"
                          name="seoDescription"
                          value={form.seoDescription}
                          onChange={e => setForm({ ...form, seoDescription: e.target.value })}
                          placeholder="وصف مختصر للخدمة يظهر أسفل العنوان في نتائج جوجل..."
                          rows={3} dir="rtl"
                          className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none bg-white"
                        />
                        <p className="text-[11px] text-gray-400 mt-1">الهدف: 120-160 حرف — يظهر كوصف النتيجة في جوجل</p>
                      </div>

                      {/* Keywords */}
                      <div>
                        <label htmlFor="service-seo-keywords" className="text-sm font-medium text-gray-700 mb-1 block">الكلمات المفتاحية</label>
                        <Input
                          id="service-seo-keywords"
                          name="seoKeywords"
                          value={form.seoKeywords}
                          onChange={e => setForm({ ...form, seoKeywords: e.target.value })}
                          placeholder="تأجير باقات التنظيف, باقات التنظيف أنقاض, نقل مخلفات الرياض"
                          dir="rtl"
                        />
                        <p className="text-[11px] text-gray-400 mt-1">
                          مفصولة بفواصل —&nbsp;
                          {form.seoKeywords.split(/[,،]/g).filter(k => k.trim()).length} كلمة&nbsp;
                          {form.seoKeywords.split(/[,،]/g).filter(k => k.trim()).length < 3 &&
                            <span className="text-amber-500">(يُنصح بـ 3+)</span>}
                        </p>
                      </div>

                      {/* Slug */}
                      <div>
                        <label htmlFor="service-seo-slug" className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                          <Link2 size={13} className="text-gray-500" />
                          رابط الخدمة (Slug) *
                        </label>
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono">/</span>
                            <Input
                              id="service-seo-slug"
                              name="seoSlug"
                              value={form.seoSlug}
                              onChange={e => setForm({ ...form, seoSlug: slugify(e.target.value) })}
                              placeholder="تنظيف-منازل-بالرياض"
                              dir="rtl"
                              className="pr-6 bg-white font-mono text-sm"
                            />
                          </div>
                          <Button variant="outline" size="sm"
                            onClick={() => setForm(f => ({ ...f, seoSlug: slugify(f.title) }))}
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
                            /services/{form.seoSlug || "..."}
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
              <Button onClick={handleSave} disabled={creating || updating} className="gap-2 bg-primary">
                <Check size={16} />
                {creating || updating ? "جاري الحفظ..." : "حفظ الخدمة"}
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)} className="gap-2">
                <X size={16} /> إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* ═══════════════ SERVICES LIST ═══════════════ */}
      <div className="grid gap-3">
        {services.map((svc) => {
          const raw = svc as any
          const imgs = (() => { try { return JSON.parse(raw.images || "[]") } catch { return [] } })()
          const imgCount = imgs.filter((u: string) => u).length || (svc.imageUrl ? 1 : 0)
          const seoOn    = !!(raw.seoEnabled)
          const seoScore_ = seoOn
            ? calcOverallScore(calcSeoChecks({
                ...emptyForm(),
                title: svc.title, description: svc.description,
                images: imgs.length ? imgs : svc.imageUrl ? [svc.imageUrl] : [],
                seoEnabled: true,
                seoTitle: raw.seoTitle || "", seoDescription: raw.seoDescription || "",
                seoKeywords: raw.seoKeywords || "", seoSlug: raw.seoSlug || "",
              }))
            : null

          const firstImg = imgs.find((u: string) => u) || svc.imageUrl

          return (
            <Card key={svc.id} className="overflow-hidden">
              <CardContent className="p-0 flex items-stretch">
                {/* Image thumbnail */}
                {firstImg ? (
                  <div className="w-20 shrink-0 relative">
                    <img src={firstImg} alt={svc.title}
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).parentElement!.className = "w-20 shrink-0 bg-primary/10 flex items-center justify-center" }}
                    />
                    {imgCount > 1 && (
                      <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        +{imgCount - 1}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="w-20 shrink-0 bg-primary/10 flex items-center justify-center">
                    <Settings size={22} className="text-primary" />
                  </div>
                )}

                <div className="flex items-center gap-3 flex-1 min-w-0 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h3 className="font-bold text-gray-900 truncate">{svc.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                        svc.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>{svc.isActive ? "نشط" : "مخفي"}</span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1 mb-1.5">{svc.description}</p>

                    {/* Meta badges */}
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      <span className="flex items-center gap-1 text-gray-400">
                        <Image size={11} />
                        {imgCount} {imgCount === 1 ? "صورة" : "صور"}
                      </span>
                      {seoOn && seoScore_ !== null ? (
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-bold ${
                          seoScore_ >= 80 ? "bg-green-100 text-green-700"
                          : seoScore_ >= 50 ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-600"
                        }`}>
                          <Search size={10} /> سيو {seoScore_}/100
                        </span>
                      ) : (
                        <span className="text-gray-300">سيو معطّل</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => toggleActive(svc)} className="text-gray-400 hover:text-gray-700">
                      {svc.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(svc)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50">
                      <Pencil size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(svc.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {services.length === 0 && (
          <Card>
            <CardContent className="py-16 flex flex-col items-center gap-3 text-gray-400">
              <Settings size={48} strokeWidth={1} />
              <p className="text-lg font-medium">لا توجد خدمات بعد</p>
              <Button onClick={openNew} variant="outline" className="gap-2 mt-2">
                <Plus size={16} /> أضف خدمة
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
