import { useEffect, useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { useSiteSettings } from "@/context/SiteSettingsContext"
import { buildHomepageTitle, buildLocalBusinessSchema } from "@/lib/structuredData"
import { getSiteUrl } from "@/lib/siteUrl"

import { HeroSlider } from "@/components/home/HeroSlider"
import { StatsBar } from "@/components/home/StatsBar"
import { PackagesSection } from "@/components/home/PackagesSection"
import { ServicesSection } from "@/components/home/ServicesSection"
import { AboutSection } from "@/components/home/AboutSection"
import { HowItWorksSection } from "@/components/home/HowItWorksSection"
import { WhyChooseUs } from "@/components/home/WhyChooseUs"
import { ServiceAreasSection } from "@/components/home/ServiceAreasSection"
import { ValuesSection } from "@/components/home/ValuesSection"
import { Testimonials } from "@/components/home/Testimonials"
import { Partners } from "@/components/home/Partners"
import { BlogSection } from "@/components/home/BlogSection"
import { ServiceRequestForm } from "@/components/home/ServiceRequestForm"
import { AdsSection } from "@/components/home/AdsSection"
import { SeoPagesLinksSection } from "@/components/home/SeoPagesLinksSection"
import { CEOMessage } from "@/components/home/CEOMessage"
import { OffersSection } from "@/components/home/OffersSection"

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || ""

function SectionBlock({
  id,
  phoneCall,
  phoneWhatsapp,
  homepageContent,
}: {
  id: string
  phoneCall: string
  phoneWhatsapp: string
  homepageContent: any
}) {
  const waNumber = phoneWhatsapp.replace(/^0/, "966")
  const callHref = `tel:${phoneCall}`
  const waHref   = `https://wa.me/${waNumber}`

  switch (id) {
    case "hero":
      return (
        <>
          <HeroSlider />
          <AdsSection position="after_hero" />
        </>
      )
    case "stats":
      return <StatsBar />
    case "packages":
    case "containers":
      return (
        <>
          <PackagesSection />
          <AdsSection position="after_packages" />
        </>
      )
    case "services":
      return (
        <>
          <ServicesSection />
          <AdsSection position="after_services" />
          <OffersSection />
        </>
      )
    case "offers":
      return <OffersSection />
    case "about":
      return <AboutSection />
    case "ceo":
    case "ceo_message":
      return <CEOMessage />
    case "how_it_works":
      return <HowItWorksSection />
    case "why_choose_us":
      return <WhyChooseUs />
    case "areas":
      return <ServiceAreasSection />
    case "values":
      return <ValuesSection />
    case "testimonials":
      return <Testimonials />
    case "partners":
      return (
        <>
          <Partners />
          <SeoPagesLinksSection />
        </>
      )
    case "blog":
      return (
        <>
          <BlogSection />
        </>
      )
    case "service_request":
      return <ServiceRequestForm />
    case "contact":
      if (!phoneCall && !phoneWhatsapp) return null
      const contactCopy = homepageContent.sections?.contact
      return (
        <>
          <AdsSection position="before_footer" />
          <section id="contact" className="py-12 bg-white border-t">
            <div className="container mx-auto px-4 md:px-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-primary/5 p-8 rounded-2xl border border-primary/10">
                <div>
                  {contactCopy?.title && <h3 className="text-2xl font-bold text-primary mb-2">{contactCopy.title}</h3>}
                  {contactCopy?.description && <p className="text-gray-600">{contactCopy.description}</p>}
                </div>
                <div className="flex gap-4 flex-wrap">
                  {phoneWhatsapp && contactCopy?.whatsappText && (
                    <a href={waHref} target="_blank" rel="noreferrer"
                      className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-md">
                      {contactCopy.whatsappText}
                    </a>
                  )}
                  {phoneCall && contactCopy?.callText && (
                    <a href={callHref}
                      className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-primary px-6 py-3 rounded-lg font-bold transition-colors shadow-sm">
                      {contactCopy.callText}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>
        </>
      )
    default:
      return null
  }
}

const DEFAULT_SECTIONS_ORDER = [
  "hero",
  "stats",
  "packages",
  "services",
  "about",
  "ceo",
  "how_it_works",
  "why_choose_us",
  "areas",
  "values",
  "testimonials",
  "partners",
  "blog",
  "service_request",
  "contact",
]

export default function Home() {
  const siteSettings = useSiteSettings()
  const { companyName, description, logoUrl, phones, phoneCall, phoneWhatsapp, homepageContent, publicUrl, isLoaded } = siteSettings
  const [sectionsOrder, setSectionsOrder] = useState<string[]>(DEFAULT_SECTIONS_ORDER)
  const [hiddenSections, setHiddenSections] = useState<string[]>([])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" })
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    document.title = buildHomepageTitle(companyName)
    const id = "local-business-schema"
    document.getElementById(id)?.remove()
    const script = document.createElement("script")
    script.id = id
    script.type = "application/ld+json"
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        buildLocalBusinessSchema(siteSettings, {
          areaServed: siteSettings.city
            ? { "@type": "City", name: siteSettings.city }
            : undefined,
        }),
        {
          "@type": "WebSite",
          "@id": `${getSiteUrl(publicUrl)}/#website`,
          "url": `${getSiteUrl(publicUrl)}/`,
          "name": companyName,
          "inLanguage": "ar",
          "publisher": { "@id": `${getSiteUrl(publicUrl)}/#business` },
        },
      ],
    })
    document.head.appendChild(script)
    return () => document.getElementById(id)?.remove()
  }, [companyName, description, logoUrl, phones, phoneWhatsapp, publicUrl, siteSettings, isLoaded])

  useEffect(() => {
    fetch(`${API_BASE}/api/settings`)
      .then(r => r.json())
      .then(data => {
        try {
          if (data.sections_order) {
            const parsed: string[] = JSON.parse(data.sections_order)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSectionsOrder(parsed)
            }
          }
          if (data.sections_hidden) {
            const hidden: string[] = JSON.parse(data.sections_hidden)
            if (Array.isArray(hidden)) {
              setHiddenSections(hidden)
            }
          }
        } catch {}
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-background font-sans" dir="rtl">
      <Navbar />

      <main>
        {sectionsOrder
          .filter(id => !hiddenSections.includes(id))
          .map(id => (
            <SectionBlock
              key={id}
              id={id}
              phoneCall={phoneCall}
              phoneWhatsapp={phoneWhatsapp}
              homepageContent={homepageContent}
            />
          ))}
      </main>

      <Footer />
    </div>
  )
}
