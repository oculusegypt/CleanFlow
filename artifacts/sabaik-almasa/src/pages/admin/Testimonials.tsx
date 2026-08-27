import { useState } from "react"
import { useGetTestimonials, useCreateTestimonial, useUpdateTestimonial, useDeleteTestimonial } from "@workspace/api-client-react"
import type { Testimonial } from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Pencil, Trash2, Star, Eye, EyeOff, X, Check } from "lucide-react"

type TestimonialForm = {
  clientName: string
  company: string
  content: string
  rating: number
  avatarUrl: string
  isActive: boolean
}

const emptyForm = (): TestimonialForm => ({
  clientName: "",
  company: "",
  content: "",
  rating: 5,
  avatarUrl: "",
  isActive: true,
})

export default function AdminTestimonials() {
  const { data: testimonials = [], refetch } = useGetTestimonials()
  const { mutate: createTestimonial, isPending: creating } = useCreateTestimonial()
  const { mutate: updateTestimonial, isPending: updating } = useUpdateTestimonial()
  const { mutate: deleteTestimonial } = useDeleteTestimonial()

  const [editing, setEditing] = useState<number | "new" | null>(null)
  const [form, setForm] = useState<TestimonialForm>(emptyForm())

  const openNew = () => {
    setForm(emptyForm())
    setEditing("new")
  }

  const openEdit = (t: Testimonial) => {
    setForm({
      clientName: t.clientName,
      company: t.company,
      content: t.content,
      rating: t.rating,
      avatarUrl: t.avatarUrl ?? "",
      isActive: t.isActive,
    })
    setEditing(t.id)
  }

  const handleSave = () => {
    const data = { ...form, avatarUrl: form.avatarUrl || undefined }
    if (editing === "new") {
      createTestimonial({ data }, { onSuccess: () => { refetch(); setEditing(null) } })
    } else if (typeof editing === "number") {
      updateTestimonial({ id: editing, data }, { onSuccess: () => { refetch(); setEditing(null) } })
    }
  }

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الشهادة؟")) {
      deleteTestimonial({ id }, { onSuccess: () => refetch() })
    }
  }

  const toggleActive = (t: Testimonial) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateTestimonial({ id: t.id, data: { isActive: !t.isActive } as any }, { onSuccess: () => refetch() })
  }

  const StarRating = ({ value, onChange }: { value: number; onChange?: (v: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          className={`${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
        >
          <Star size={18} className={n <= value ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
        </button>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">إدارة الشهادات</h2>
        <Button onClick={openNew} className="gap-2">
          <Plus size={16} />
          إضافة شهادة
        </Button>
      </div>

      {/* Form */}
      {editing !== null && (
        <Card className="border-primary/30 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-lg text-gray-800">
              {editing === "new" ? "إضافة شهادة جديدة" : "تعديل الشهادة"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">اسم العميل *</label>
                <Input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} placeholder="اسم العميل" dir="rtl" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">الشركة / الجهة</label>
                <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="اسم الشركة" dir="rtl" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">نص الشهادة *</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="نص الشهادة..."
                rows={4}
                dir="rtl"
                className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">التقييم</label>
                <StarRating value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">رابط الصورة الشخصية</label>
                <Input value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} placeholder="https://..." dir="ltr" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4" id="testimonial-active" />
              <label htmlFor="testimonial-active" className="text-sm font-medium text-gray-700 cursor-pointer">نشط (ظاهر في الموقع)</label>
            </div>
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

      {/* Testimonials List */}
      <div className="grid gap-4">
        {testimonials.map((t) => (
          <Card key={t.id}>
            <CardContent className="p-5 flex gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-lg">
                {t.avatarUrl ? (
                  <img src={t.avatarUrl} alt={t.clientName} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  t.clientName.charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-bold text-gray-900">{t.clientName}</span>
                  <span className="text-sm text-gray-400">{t.company}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    t.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {t.isActive ? "نشط" : "مخفي"}
                  </span>
                </div>
                <div className="flex mb-2">
                  {[1,2,3,4,5].map((n) => (
                    <Star key={n} size={14} className={n <= t.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{t.content}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => toggleActive(t)} className="text-gray-400 hover:text-gray-700">
                  {t.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(t)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50">
                  <Pencil size={16} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50">
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {testimonials.length === 0 && (
          <Card>
            <CardContent className="py-16 flex flex-col items-center gap-3 text-gray-400">
              <Star size={48} strokeWidth={1} />
              <p className="text-lg font-medium">لا توجد شهادات بعد</p>
              <Button onClick={openNew} variant="outline" className="gap-2 mt-2"><Plus size={16} /> أضف شهادة</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
