import { motion } from "framer-motion"
import { MapPin, ArrowLeft } from "lucide-react"
import { useSiteSettings } from "@/context/SiteSettingsContext"

export function ServiceAreasSection() {
  const { phoneCall, homepageContent } = useSiteSettings()
  const content = homepageContent.areas
  const areas = content?.items?.filter(area => area.slug && area.name && area.description) ?? []
  if (!content || areas.length === 0) return null

  return (
    <section className="py-20 bg-gray-50" aria-labelledby="areas-heading">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {content.eyebrow && (
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-4">
              <MapPin size={15} />
              {content.eyebrow}
            </div>
          )}
          {(content.title || content.highlight) && (
            <h2 id="areas-heading" className="text-3xl md:text-4xl font-bold text-primary mb-4">
              {content.title} {content.highlight && <span className="text-secondary">{content.highlight}</span>}
            </h2>
          )}
          <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full mb-6" />
          {content.description && <p className="text-gray-600 text-lg">{content.description}</p>}
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {areas.map((area, index) => (
            <motion.a
              key={area.slug}
              href={`/areas/${area.slug}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <MapPin size={16} />
                </div>
                <ArrowLeft size={14} className="text-gray-300 group-hover:text-primary transition-colors rotate-180" />
              </div>
              <h3 className="font-bold text-primary text-base">{area.name}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{area.description}</p>
            </motion.a>
          ))}
        </div>

        {(content.missingText || (phoneCall && (content.phonePrefix || content.phoneSuffix))) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-10"
          >
            {content.missingText && <span className="text-gray-500 text-sm">{content.missingText} </span>}
            {phoneCall && content.phonePrefix && (
              <a href={`tel:${phoneCall}`} className="text-primary font-bold hover:text-secondary transition-colors">
                {content.phonePrefix} {phoneCall}
              </a>
            )}
            {content.phoneSuffix && <span className="text-gray-500 text-sm"> {content.phoneSuffix}</span>}
          </motion.div>
        )}
      </div>
    </section>
  )
}