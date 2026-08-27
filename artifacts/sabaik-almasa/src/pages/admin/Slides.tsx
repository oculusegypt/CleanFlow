import { useRef, useState } from "react"
import { useGetSlides, useCreateSlide, useUpdateSlide, useDeleteSlide } from "@workspace/api-client-react"
import type { HeroSlide } from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Pencil, Trash2, Image, GripVertical, Eye, EyeOff, X, Check, Upload, Loader2, AlertCircle } from "lucide-react"

type SlideForm = {
  title: string
  subtitle: string
  imageUrl: string
  ctaText: string
  order: number
  isActive: boolean
}

const emptyForm = (): SlideForm => ({
  title: "",
  subtitle: "",
  imageUrl: "",
  ctaText: "اطلب خدمتك الآن",
  order: 0,
  isActive: true,
})

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || ""
const MAX_SLIDE_IMAGE_SIZE = 8 * 1024 * 1024
const ACCEPTED_SLIDE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
])

export default function AdminSlides() {
  const { data: slides = [], refetch } = useGetSlides()
  const { mutate: createSlide, isPending: creating } = useCreateSlide()
  const { mutate: updateSlide, isPending: updating } = useUpdateSlide()
  const { mutate: deleteSlide } = useDeleteSlide()

  const [editing, setEditing] = useState<number | "new" | null>(null)
  const [form, setForm] = useState<SlideForm>(emptyForm())
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const openNew = () => {
    setForm({ ...emptyForm(), order: slides.length })
    setUploadError("")
    setEditing("new")
  }

  const openEdit = (slide: HeroSlide) => {
    setForm({
      title: slide.title,
      subtitle: slide.subtitle,
      imageUrl: slide.imageUrl,
      ctaText: slide.ctaText ?? "",
      order: slide.order,
      isActive: slide.isActive,
    })
    setUploadError("")
    setEditing(slide.id)
  }

  const handleSave = () => {
    if (editing === "new") {
      createSlide({ data: form }, { onSuccess: () => { refetch(); setEditing(null) } })
    } else if (typeof editing === "number") {
      updateSlide({ id: editing, data: form }, { onSuccess: () => { refetch(); setEditing(null) } })
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!ACCEPTED_SLIDE_IMAGE_TYPES.has(file.type)) {
      setUploadError("نوع الملف غير مسموح به. استخدم JPEG أو PNG أو WebP أو GIF أو AVIF.")
      return
    }
    if (file.size > MAX_SLIDE_IMAGE_SIZE) {
      setUploadError("حجم الصورة أكبر من 8 ميغابايت.")
      return
    }

    setUploading(true)
    setUploadError("")
    try {
      const token = localStorage.getItem("admin_token") ?? ""
      const body = new FormData()
      body.append("file", file)
      body.append("title", form.title || "خدمات التنظيف بالرياض")
      const response = await fetch(`${API_BASE}/api/admin/slides/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      })
      const result = await response.json() as { error?: string; url?: string; contentType?: string }
      if (!response.ok) throw new Error(result.error || "فشل رفع الصورة")
      if (!result.url) throw new Error("لم يُرجع الخادم رابط الصورة")
      setForm(current => ({ ...current, imageUrl: result.url!.startsWith("http") ? result.url! : `${API_BASE}${result.url}` }))
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "فشل رفع الصورة")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الشريحة؟")) {
      deleteSlide({ id }, { onSuccess: () => refetch() })
    }
  }

  const toggleActive = (slide: HeroSlide) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateSlide({ id: slide.id, data: { isActive: !slide.isActive } as any }, { onSuccess: () => refetch() })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">شرائح الهيرو</h2>
        <Button onClick={openNew} className="gap-2">
          <Plus size={16} />
          إضافة شريحة
        </Button>
      </div>

      {/* New/Edit Form */}
      {editing !== null && (
        <Card className="border-primary/30 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-lg text-gray-800 mb-4">
              {editing === "new" ? "إضافة شريحة جديدة" : "تعديل الشريحة"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">العنوان *</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="عنوان الشريحة"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">نص الزر</label>
                <Input
                  value={form.ctaText}
                  onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                  placeholder="اطلب خدمتك الآن"
                  dir="rtl"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">النص التوضيحي *</label>
              <Input
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="وصف مختصر"
                dir="rtl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">صورة الخلفية *</label>
              <div className="space-y-3">
                <label
                  htmlFor="hero-slide-image-upload"
                  className={`flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 py-6 text-center transition-colors ${
                    uploading
                      ? "cursor-wait border-primary/50 bg-primary/5"
                      : "border-gray-300 bg-gray-50 hover:border-primary hover:bg-primary/5"
                  }`}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault()
                    const file = event.dataTransfer.files?.[0]
                    if (file && !uploading) void handleImageUpload(file)
                  }}
                >
                  {uploading ? (
                    <Loader2 size={24} className="mb-2 animate-spin text-primary" />
                  ) : (
                    <Upload size={24} className="mb-2 text-primary" />
                  )}
                  <span className="text-sm font-semibold text-gray-700">
                    {uploading ? "جاري رفع وضغط الصورة..." : form.imageUrl ? "اضغط لاستبدال صورة الشريحة" : "اضغط لاختيار صورة الشريحة"}
                  </span>
                  <span className="mt-1 text-xs text-gray-500">أو اسحب الصورة وأفلتها هنا</span>
                  <input
                    id="hero-slide-image-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) void handleImageUpload(file)
                      e.currentTarget.value = ""
                    }}
                  />
                </label>
                <div className="flex items-center gap-3">
                  <span className="shrink-0 text-xs font-medium text-gray-400">أو استخدم رابط صورة</span>
                  <Input
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://example.com/hero.webp"
                    dir="ltr"
                  />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">JPEG أو PNG أو WebP أو GIF أو AVIF — حتى 8 ميغابايت. سيتم ضغطها وتحويلها تلقائياً إلى WebP.</p>
              {uploadError && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
                  <AlertCircle size={14} /> {uploadError}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">الترتيب</label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">نشط</span>
                </label>
              </div>
            </div>
            {form.imageUrl && (
              <div className="rounded-xl overflow-hidden h-32 bg-gray-100">
                <img
                  src={form.imageUrl}
                  alt="preview"
                  className="w-full h-full object-cover"
                  onError={(event) => { event.currentTarget.style.display = "none" }}
                />
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={creating || updating} className="gap-2">
                <Check size={16} />
                {creating || updating ? "جاري الحفظ..." : "حفظ"}
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)} className="gap-2">
                <X size={16} />
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Slides List */}
      <div className="grid gap-4">
        {slides.map((slide) => (
          <Card key={slide.id} className="overflow-hidden">
            <div className="flex items-stretch">
              <div className="w-48 shrink-0 bg-gray-100 relative overflow-hidden">
                {slide.imageUrl ? (
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                    onError={(event) => { event.currentTarget.style.display = "none" }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Image size={32} />
                  </div>
                )}
              </div>
              <CardContent className="flex-1 p-5 flex items-center gap-4">
                <GripVertical size={20} className="text-gray-300 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 truncate">{slide.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      slide.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {slide.isActive ? "نشط" : "مخفي"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{slide.subtitle}</p>
                  {slide.ctaText && (
                    <span className="mt-1 inline-block text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      زر: {slide.ctaText}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleActive(slide)}
                    className="text-gray-400 hover:text-gray-700"
                    title={slide.isActive ? "إخفاء" : "إظهار"}
                  >
                    {slide.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(slide)}
                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(slide.id)}
                    className="text-red-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
        {slides.length === 0 && (
          <Card>
            <CardContent className="py-16 flex flex-col items-center gap-3 text-gray-400">
              <Image size={48} strokeWidth={1} />
              <p className="text-lg font-medium">لا توجد شرائح بعد</p>
              <Button onClick={openNew} variant="outline" className="gap-2 mt-2">
                <Plus size={16} /> أضف أول شريحة
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
