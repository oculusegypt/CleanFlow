import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useGetPackages } from "@workspace/api-client-react"
import type { CleaningPackage } from "@workspace/api-client-react"
import { Check, Maximize, Weight, Phone, MessageCircle, Clock, Info, FileText } from "lucide-react"
import { useServiceRequest } from "@/context/ServiceRequestContext"
import { resolveContactNumbers, useSiteSettings } from "@/context/SiteSettingsContext"
import { CategoryTabs, TABS } from "@/components/home/packages/CategoryTabs"
import { PackageCard, resolveServiceTypeFromCleaningPackage, getCleaningPackageImage } from "@/components/home/packages/PackageCard"

const CLEANING_PACKAGE_CATEGORIES = new Set([
  "apartments", "villas", "palaces", "move_clean", "majlis", "marble",
  "tanks", "ac", "pest", "postcon", "facades", "facilities", "fire_safety",
])

export function PackagesSection({ initialCategory = "all" }: { initialCategory?: string }) {
  const { data: apiData, isLoading } = useGetPackages()
  const { openModal } = useServiceRequest()
  const { companyName, homepageContent } = useSiteSettings()
  const copy = homepageContent.sections?.packages
  const [activeTab, setActiveTab] = useState(initialCategory)

  // Sync if initialCategory changes
  useState(() => {
    if (initialCategory && initialCategory !== activeTab) {
      setActiveTab(initialCategory)
    }
  })

  const all: CleaningPackage[] = (apiData ?? [])
    .filter((c) => c.isActive && CLEANING_PACKAGE_CATEGORIES.has(c.category ?? ""))
    .sort((a, b) => a.order - b.order)

  const filtered =
    activeTab === "all" ? all : all.filter((c) => (c.category ?? "debris") === activeTab)

  if (!isLoading && all.length === 0) return null

  return (
    <section id="cleaning-packages" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">

        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-secondary font-bold text-sm tracking-wider uppercase bg-secondary/10 px-4 py-1.5 rounded-full inline-block mb-3">
            {companyName ? `باقات تنظيف ${companyName}` : "باقات التنظيف في الرياض"}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            {copy?.title || "باقات وخدمات"}{" "}
            <span className="text-secondary">{copy?.highlight || "التنظيف المتاحة"}</span>
          </h2>
          <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full mb-6" />
          <p className="text-gray-600 text-lg">
            {copy?.description || "اختر الباقة المناسبة لمنزلك أو منشأتك، وسيقوم فريقنا بتأكيد التفاصيل والسعر بسرعة."}
          </p>
        </motion.div>

        {/* Category Tabs */}
        <CategoryTabs activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Cards Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-md animate-pulse h-80" />
                ))
              : filtered.map((c, i) =>
                  c.category === "contract"
                    ? <ContractCard key={c.id} container={c} index={i} onRequest={() => openModal({ serviceType: "عقود النظافة", packageSize: "", containerName: c.name })} />
                    : <PackageCard key={c.id} container={c} index={i} companyName={companyName} onRequest={() =>
                        openModal({
                          serviceType: resolveServiceTypeFromCleaningPackage(c),
                          packageSize: `${c.name}${c.size ? ` - ${c.size}` : ""}`,
                          containerName: c.name,
                        })
                      }
                    />
                )}
            {!isLoading && filtered.length === 0 && (
              <div className="col-span-full text-center py-16 text-gray-400">
                <p className="text-lg">لا توجد باقات في هذه الفئة حالياً</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  )
}

function parseFeatures(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[]
  if (typeof raw === "string") {
    try { return JSON.parse(raw) } catch { return [] }
  }
  return []
}

function ContractCard({
  container: c,
  index,
  onRequest,
}: {
  container: CleaningPackage
  index: number
  onRequest: () => void
}) {
  const { phoneCall, phoneWhatsapp, phones } = useSiteSettings()
  const feats = parseFeatures(c.features)
  const { call: defaultCall, whatsapp: defaultWa } = resolveContactNumbers(phoneCall, phoneWhatsapp, phones)
  const contractCallNumber = c.contactPhone2 || c.contactPhone1 || defaultCall
  const contractWhatsappNumber = c.contactPhone1 || defaultWa

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl overflow-hidden shadow-lg flex flex-col text-white"
    >
      {/* Header strip */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-white/10">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
          <FileText size={24} className="text-white" />
        </div>
        <div>
          <span className="text-xs font-semibold bg-blue-500/50 px-2 py-0.5 rounded-full">عقد نظافة معتمد</span>
          <h3 className="text-lg font-bold mt-1 leading-tight">{c.name}</h3>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-4">
        {/* Price callout */}
        {c.priceText && (
          <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
            <p className="text-xs text-blue-200 mb-0.5">السعر</p>
            <p className="text-2xl font-extrabold">{c.priceText}</p>
          </div>
        )}

        {/* Description */}
        <p className="text-blue-100 text-sm leading-relaxed">{c.description}</p>

        {/* Features */}
        {feats.length > 0 && (
          <div className="space-y-1.5">
            {feats.map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-blue-100">
                <Check size={13} className="text-blue-300 shrink-0 mt-0.5" /><span>{f}</span>
              </div>
            ))}
          </div>
        )}

        {/* SuitableFor */}
        {c.suitableFor && (
          <div className="flex items-start gap-2 text-xs text-blue-100 bg-white/10 rounded-lg p-2">
            <Info size={13} className="text-blue-300 shrink-0 mt-0.5" />
            <span><strong>مناسب لـ:</strong> {c.suitableFor}</span>
          </div>
        )}

        {/* Rental period */}
        {c.rentalPeriod && (
          <div className="flex items-center gap-2 text-xs text-blue-200">
            <Clock size={13} className="text-blue-300 shrink-0" /><span>{c.rentalPeriod}</span>
          </div>
        )}

        {/* CTA */}
        <div className="flex flex-col gap-0 mt-auto pt-2">
          <button
            onClick={onRequest}
            className="w-full text-center bg-white text-blue-800 font-bold py-2.5 rounded-xl transition-all duration-200 text-sm shadow hover:shadow-lg hover:bg-blue-50"
          >
            طلب عقد النظافة الآن ←
          </button>
          {(contractCallNumber || contractWhatsappNumber) && (
            <div className="flex gap-2 mt-2">
              {contractCallNumber && <a href={`tel:${contractCallNumber}`}
                className="flex-1 flex items-center justify-center gap-1.5 border border-white/30 text-white py-2 rounded-xl text-xs font-medium hover:bg-white/10 transition-colors">
                <Phone size={13} /> اتصل
              </a>}
              {contractWhatsappNumber && <a href={`https://wa.me/966${contractWhatsappNumber.replace(/^0/, "")}?text=${encodeURIComponent(`أريد الاستفسار عن ${c.name}`)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-400 text-white py-2 rounded-xl text-xs font-medium transition-colors">
                <MessageCircle size={13} /> واتساب
              </a>}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
