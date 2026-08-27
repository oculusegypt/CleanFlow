import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowLeft,
  CalendarCheck,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Headphones,
  MapPin,
  MessageCircle,
  Play,
  Sparkles,
  UserRound,
  Wrench,
} from "lucide-react"
import { useSiteSettings } from "@/context/SiteSettingsContext"
import { useServiceRequest } from "@/context/ServiceRequestContext"

const serviceChoices = [
  { title: "تنظيف المنازل والفلل", description: "تنظيف عميق للمساحات السكنية", icon: Wrench },
  { title: "غسيل المجالس والكنب", description: "بخار، إزالة بقع وتعقيم", icon: Sparkles },
  { title: "تنظيف المكيفات", description: "تنظيف وصيانة حسب نوع المكيف", icon: ClipboardList },
]

const detailChoices = [
  { label: "نوع العقار", value: "فيلا سكنية" },
  { label: "المساحة التقريبية", value: "حتى 250 م²" },
  { label: "الخدمات الإضافية", value: "غسيل كنب ومجالس" },
]

const appointmentChoices = [
  { title: "موعد قريب", description: "ننسق أقرب وقت مناسب لك", icon: Clock3 },
  { title: "موعد محدد", description: "اختر اليوم والوقت المفضل", icon: CalendarCheck },
]

const steps = [
  {
    number: "01",
    title: "اختر الخدمة",
    description: "حدد نوع التنظيف الذي تحتاجه، وسنقترح لك الباقة الأنسب.",
    icon: ClipboardList,
  },
  {
    number: "02",
    title: "أرسل التفاصيل",
    description: "أخبرنا عن المكان والمساحة والخدمات الإضافية المطلوبة.",
    icon: MapPin,
  },
  {
    number: "03",
    title: "نسّق الموعد",
    description: "اختر الوقت المناسب، ويتواصل معك الفريق لتأكيد التفاصيل.",
    icon: CalendarCheck,
  },
  {
    number: "04",
    title: "نبدأ الخدمة",
    description: "يصلك تأكيد الطلب، ثم يحضر الفريق في الموعد المتفق عليه.",
    icon: CheckCircle2,
  },
] as const

export function HowItWorksSection() {
  const { homepageContent } = useSiteSettings()
  const { openModal } = useServiceRequest()
  const content = homepageContent.how
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % steps.length)
    }, 4200)
    return () => window.clearInterval(timer)
  }, [])

  if (!content) return null

  const step = steps[activeStep]
  const StepIcon = step.icon

  function openRequest() {
    openModal()
  }

  function openSupport() {
    window.dispatchEvent(new CustomEvent("openLiveSupportChat"))
  }

  function openAssistant() {
    window.dispatchEvent(new CustomEvent("openAIChatbot"))
  }

  return (
    <section id="how-it-works" className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white py-16 md:py-24">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
          {content.eyebrow && (
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-4 py-1.5 text-xs font-black text-secondary">
              <Play size={11} className="fill-secondary" />
              {content.eyebrow}
            </span>
          )}
          <h2 className="mb-4 text-2xl font-black text-primary md:text-4xl">طريقة طلب خدمة التنظيف</h2>
          <div className="mx-auto mb-4 h-1.5 w-20 rounded-full bg-secondary" />
          <p className="text-base leading-relaxed text-gray-500 md:text-lg">
            اطلب خدمتك بسهولة. اختر الخدمة، أرسل تفاصيل المكان، وسننسق معك الموعد المناسب خطوة بخطوة.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white px-4 py-2 text-sm font-bold text-primary shadow-sm">
            <Clock3 size={16} className="text-secondary" />
            من الطلب إلى التأكيد في خطوات واضحة
          </div>
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="mb-6 grid grid-cols-4 gap-1 md:gap-3">
            {steps.map((item, index) => (
              <motion.button
                key={item.number}
                type="button"
                onClick={() => setActiveStep(index)}
                aria-label={`عرض خطوة ${item.title}`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={`relative flex flex-col items-center gap-2 bg-transparent p-0 text-center ${activeStep === index ? "text-primary" : "text-gray-400"}`}
              >
                {index < steps.length - 1 && (
                  <span className={`absolute right-1/2 top-4 h-px w-full ${activeStep > index ? "bg-secondary" : "bg-primary/10"}`} />
                )}
                <span className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-black transition-all md:h-10 md:w-10 ${
                  activeStep === index
                    ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                    : activeStep > index
                      ? "border-secondary bg-secondary text-white"
                      : "border-gray-200 bg-white"
                }`}>
                  {activeStep > index ? <Check size={15} /> : item.number}
                </span>
                <span className="text-[10px] font-black leading-tight md:text-xs">{item.title}</span>
              </motion.button>
            ))}
          </div>

          <div className="mb-7 h-1.5 overflow-hidden rounded-full bg-primary/10">
            <motion.div
              className="h-full rounded-full bg-secondary"
              animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
          </div>

          <div className="grid items-stretch gap-5 lg:grid-cols-[1.25fr_.75fr]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28 }}
                className="rounded-[1.75rem] border border-primary/10 bg-white p-5 shadow-xl shadow-primary/5 md:p-8"
              >
                <div className="mb-7 flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-black text-secondary">{step.number} / 04</span>
                    <h3 className="mt-1 text-xl font-black text-primary md:text-2xl">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-500">{step.description}</p>
                  </div>
                  <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/10 text-secondary sm:flex">
                    <StepIcon size={23} />
                  </span>
                </div>

                {activeStep === 0 && (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {serviceChoices.map((service, index) => {
                      const Icon = service.icon
                      return (
                        <div key={service.title} className={`rounded-2xl border-2 p-4 ${index === 0 ? "border-secondary bg-secondary/10 shadow-md" : "border-gray-100"}`}>
                          <div className="mb-4 flex items-center justify-between text-secondary">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary"><Icon size={19} /></span>
                            {index === 0 && <CheckCircle2 size={17} />}
                          </div>
                          <p className="text-sm font-black text-primary">{service.title}</p>
                          <p className="mt-1 text-xs leading-relaxed text-gray-500">{service.description}</p>
                        </div>
                      )
                    })}
                  </div>
                )}

                {activeStep === 1 && (
                  <div className="space-y-3">
                    {detailChoices.map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-slate-50/80 px-4 py-3">
                        <span className="text-xs font-bold text-gray-400">{item.label}</span>
                        <span className="text-sm font-black text-primary">{item.value}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 rounded-2xl border border-secondary/20 bg-secondary/10 px-4 py-3 text-xs font-bold text-primary">
                      <MapPin size={16} className="shrink-0 text-secondary" />
                      نحدد الموقع بدقة من خلال الخريطة أو اسم الحي
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {appointmentChoices.map((item, index) => {
                      const Icon = item.icon
                      return (
                        <div key={item.title} className={`rounded-2xl border-2 p-4 ${index === 0 ? "border-primary bg-primary/5" : "border-gray-100"}`}>
                          <div className="mb-4 flex items-center justify-between">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary"><Icon size={19} /></span>
                            {index === 0 && <CheckCircle2 size={17} className="text-secondary" />}
                          </div>
                          <p className="text-sm font-black text-primary">{item.title}</p>
                          <p className="mt-1 text-xs leading-relaxed text-gray-500">{item.description}</p>
                        </div>
                      )
                    })}
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="rounded-2xl border border-secondary/20 bg-primary/[0.04] p-5">
                    <div className="mb-5 flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary/15 text-secondary"><Check size={21} /></span>
                      <div>
                        <p className="font-black text-primary">تم إرسال طلبك بنجاح</p>
                        <p className="text-xs text-gray-500">فريق المؤسسة يراجع التفاصيل للتنسيق معك</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="mb-1 block text-xs text-gray-400">الخدمة</span><strong className="text-primary">تنظيف المنازل والفلل</strong></div>
                      <div><span className="mb-1 block text-xs text-gray-400">الموقع</span><strong className="text-primary">الرياض · حي الملقا</strong></div>
                      <div><span className="mb-1 block text-xs text-gray-400">الموعد</span><strong className="text-primary">الأقرب المتاح</strong></div>
                      <div><span className="mb-1 block text-xs text-gray-400">المتابعة</span><strong className="text-primary">رسالة تأكيد من الفريق</strong></div>
                    </div>
                  </div>
                )}

                <div className="mt-7 flex items-center justify-center gap-2 border-t border-gray-100 pt-5 text-sm font-bold text-secondary">
                  <Sparkles size={16} />
                  {activeStep === 3 ? "فريقنا معك حتى اكتمال الخدمة" : "ينتقل العرض التوضيحي تلقائيًا للخطوة التالية"}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-col justify-between rounded-[1.75rem] bg-primary p-5 text-white shadow-xl shadow-primary/15 md:p-7">
              <div>
                <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-secondary">
                  <Headphones size={23} />
                </span>
                <h3 className="text-xl font-black md:text-2xl">تحتاج مساعدة في اختيار الباقة؟</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  لا تحتاج معرفة كل التفاصيل. شاركنا احتياجك، وسيساعدك فريق الدعم أو المساعد الذكي في الوصول للخيار المناسب.
                </p>
              </div>
              <div className="mt-7 space-y-2.5">
                <button type="button" onClick={openRequest} className="flex w-full items-center justify-between rounded-2xl bg-secondary px-4 py-3 text-sm font-black text-primary transition-transform hover:-translate-y-0.5">
                  <span className="flex items-center gap-2"><UserRound size={17} /> ابدأ طلب الخدمة</span>
                  <ArrowLeft size={17} />
                </button>
                <button type="button" onClick={openSupport} className="flex w-full items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-white/15">
                  <span className="flex items-center gap-2"><MessageCircle size={17} /> تحدث مع الدعم المباشر</span>
                  <ArrowLeft size={17} />
                </button>
                <button type="button" onClick={openAssistant} className="flex w-full items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-white/15">
                  <span className="flex items-center gap-2"><Sparkles size={17} /> اسأل المساعد الذكي</span>
                  <ArrowLeft size={17} />
                </button>
              </div>
            </div>
          </div>

          {content.footnote && <p className="mt-5 text-center text-xs text-gray-400">{content.footnote}</p>}
        </div>
      </div>
    </section>
  )
}