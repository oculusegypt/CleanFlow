import { useState } from "react"
import { useGetPartners, useCreatePartner, useUpdatePartner, useDeletePartner } from "@workspace/api-client-react"
import type { Partner } from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Pencil, Trash2, Users, Eye, EyeOff, X, Check, ExternalLink } from "lucide-react"

type PartnerForm = {
  name: string
  logoUrl: string
  websiteUrl: string
  order: number
  isActive: boolean
}

const emptyForm = (): PartnerForm => ({
  name: "",
  logoUrl: "",
  websiteUrl: "",
  order: 0,
  isActive: true,
})

export default function AdminPartners() {
  const { data: partners = [], refetch } = useGetPartners()
  const { mutate: createPartner, isPending: creating } = useCreatePartner()
  const { mutate: updatePartner, isPending: updating } = useUpdatePartner()
  const { mutate: deletePartner } = useDeletePartner()

  const [editing, setEditing] = useState<number | "new" | null>(null)
  const [form, setForm] = useState<PartnerForm>(emptyForm())

  const openNew = () => {
    setForm({ ...emptyForm(), order: partners.length })
    setEditing("new")
  }

  const openEdit = (p: Partner) => {
    setForm({
      name: p.name,
      logoUrl: p.logoUrl,
      websiteUrl: p.websiteUrl ?? "",
      order: p.order,
      isActive: p.isActive,
    })
    setEditing(p.id)
  }

  const handleSave = () => {
    const data = { ...form, websiteUrl: form.websiteUrl || undefined }
    if (editing === "new") {
      createPartner({ data }, { onSuccess: () => { refetch(); setEditing(null) } })
    } else if (typeof editing === "number") {
      updatePartner({ id: editing, data }, { onSuccess: () => { refetch(); setEditing(null) } })
    }
  }

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الشريك؟")) {
      deletePartner({ id }, { onSuccess: () => refetch() })
    }
  }

  const toggleActive = (p: Partner) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updatePartner({ id: p.id, data: { isActive: !p.isActive } as any }, { onSuccess: () => refetch() })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">إدارة الشركاء</h2>
        <Button onClick={openNew} className="gap-2">
          <Plus size={16} />
          إضافة شريك
        </Button>
      </div>

      {/* Form */}
      {editing !== null && (
        <Card className="border-primary/30 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-lg text-gray-800">
              {editing === "new" ? "إضافة شريك جديد" : "تعديل الشريك"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">اسم الشريك *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="اسم الشركة الشريكة" dir="rtl" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">الترتيب</label>
                <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">رابط الشعار *</label>
              <Input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://..." dir="ltr" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">رابط الموقع</label>
              <Input value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} placeholder="https://..." dir="ltr" />
            </div>
            {form.logoUrl && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <img src={form.logoUrl} alt="logo preview" className="h-12 w-auto object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                <span className="text-sm text-gray-500">معاينة الشعار</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4" id="partner-active" />
              <label htmlFor="partner-active" className="text-sm font-medium text-gray-700 cursor-pointer">نشط (ظاهر في الموقع)</label>
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

      {/* Partners Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {partners.map((p) => (
          <Card key={p.id} className={`overflow-hidden ${!p.isActive ? "opacity-60" : ""}`}>
            <div className="h-24 flex items-center justify-center bg-gray-50 p-4">
              <img
                src={p.logoUrl}
                alt={p.name}
                className="max-h-16 max-w-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/120x60?text=" + encodeURIComponent(p.name) }}
              />
            </div>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900 text-sm truncate">{p.name}</h3>
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                  p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {p.isActive ? "نشط" : "مخفي"}
                </span>
              </div>
              {p.websiteUrl && (
                <a href={p.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline mb-2">
                  <ExternalLink size={10} />
                  الموقع
                </a>
              )}
              <div className="flex gap-1 border-t border-gray-100 pt-2">
                <Button variant="ghost" size="icon" onClick={() => toggleActive(p)} className="h-7 w-7 text-gray-400">
                  {p.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(p)} className="h-7 w-7 text-blue-500 hover:bg-blue-50">
                  <Pencil size={13} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="h-7 w-7 text-red-400 hover:bg-red-50">
                  <Trash2 size={13} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {partners.length === 0 && (
          <div className="col-span-4">
            <Card>
              <CardContent className="py-16 flex flex-col items-center gap-3 text-gray-400">
                <Users size={48} strokeWidth={1} />
                <p className="text-lg font-medium">لا يوجد شركاء بعد</p>
                <Button onClick={openNew} variant="outline" className="gap-2 mt-2"><Plus size={16} /> أضف شريكاً</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
