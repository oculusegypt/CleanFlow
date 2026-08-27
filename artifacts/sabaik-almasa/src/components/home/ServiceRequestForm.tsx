import { Sparkles, CalendarClock, CheckCircle } from "lucide-react"
import { useServiceRequest } from "@/context/ServiceRequestContext"
import { useSiteSettings } from "@/context/SiteSettingsContext"
import { Button } from "@/components/ui/button"

export function ServiceRequestForm() {
  const { openModal } = useServiceRequest()
  const { companyName } = useSiteSettings()

  const steps = [
    ["1", "اختر الخدمة", Sparkles],
    ["2", "اختر الباقة", CheckCircle],
    ["3", "أرسل التفاصيل", CalendarClock],
  ] as const

  return (
    <section id="service-request" className="py-24 bg-gradient-to-br from-primary/5 via-white to-secondary/5 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <span className="text-secondary font-bold text-sm tracking-wider bg-secondary/10 px-4 py-1.5 rounded-full inline-block mb-3">
            نموذج طلب باقة تنظيف
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            اطلب باقة التنظيف <span className="text-secondary">المناسبة لك</span>
          </h2>
          <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full mb-6" />
          <p className="text-gray-600 text-lg">
            اختر خدمة التنظيف ثم الباقة المناسبة، وحدد الموعد والموقع ليتواصل معك فريق {companyName || "التنظيف"} بالتفاصيل النهائية.
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10">
          <div className="grid sm:grid-cols-3 gap-4 mb-8 text-center">
            {steps.map(([number, label, Icon]) => (
              <div key={number} className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                <div className="mx-auto mb-2 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  {number}
                </div>
                <div className="flex items-center justify-center gap-1.5 text-sm font-bold text-gray-700">
                  <Icon size={15} className="text-secondary" />
                  {label}
                </div>
              </div>
            ))}
          </div>
          <Button
            type="button"
            onClick={() => openModal()}
            className="w-full h-14 rounded-2xl bg-primary hover:bg-secondary text-white font-bold text-base shadow-lg"
          >
            فتح نموذج طلب باقة التنظيف
          </Button>
          <p className="text-center text-xs text-gray-500 mt-4">
            يمكنك تحديد الطلب الفوري أو حجز موعد مسبق من داخل النموذج.
          </p>
        </div>
      </div>
    </section>
  )
}