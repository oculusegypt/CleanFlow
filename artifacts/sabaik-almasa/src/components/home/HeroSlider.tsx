import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useGetSlides } from "@workspace/api-client-react"
import { useServiceRequest } from "@/context/ServiceRequestContext"
import { useSiteSettings } from "@/context/SiteSettingsContext"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"

export function HeroSlider() {
  const { data: slides, isLoading } = useGetSlides()
  const [currentIndex, setCurrentIndex] = useState(0)
  const { openModal } = useServiceRequest()
  const {
    companyName,
    heroCompanyVisible,
    heroCtaVisible,
    heroCompanyPosition,
    heroCtaPosition,
  } = useSiteSettings()

  const resolvedCompany = companyName || "خدمات التنظيف بالرياض"
  const displaySlides = slides ?? []

  const positionClasses = (position: string) => {
    const [vertical, horizontal] = position.split("-")
    const verticalClass = vertical === "top"
      ? "top-6 md:top-10"
      : vertical === "bottom"
        ? "bottom-6 md:bottom-10"
        : "top-1/2 -translate-y-1/2"
    const horizontalClass = horizontal === "left"
      ? "left-6 md:left-10"
      : horizontal === "right"
        ? "right-6 md:right-10"
        : "left-1/2 -translate-x-1/2"
    return `${verticalClass} ${horizontalClass}`
  }

  const centeredCompany = heroCompanyPosition === "center-center"
  const centeredCta = heroCtaPosition === "center-center"

  useEffect(() => {
    if (displaySlides.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displaySlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [displaySlides.length])

  // Keep the hero's footprint stable while the real slides arrive. Do not
  // render fallback marketing copy here: it flashes briefly before the API
  // response and makes the hero feel like it changed content after loading.
  if (isLoading || displaySlides.length === 0) {
    return (
      <section
        className="home-hero relative flex min-h-[100dvh] w-full items-center overflow-hidden"
        aria-busy={isLoading}
        aria-label={isLoading ? "جاري تحميل المحتوى" : undefined}
      >
        <div className="container relative z-10 mx-auto w-full px-5 py-32 md:px-8">
          <div className="max-w-xl space-y-5">
            <div className="hero-skeleton h-7 w-36 rounded-full" />
            <div className="hero-skeleton h-16 w-full rounded-2xl md:h-24" />
            <div className="hero-skeleton h-5 w-4/5 rounded-lg" />
            <div className="hero-skeleton h-14 w-44 rounded-xl" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="home-hero relative min-h-[100dvh] w-full overflow-hidden bg-primary" aria-roledescription="سلايدر" aria-label="عروض وخدمات CleanFlow">
      {displaySlides.map((slide, index) => (
        <div
          key={slide.id}
          aria-hidden={index !== currentIndex}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <div className="absolute inset-0">
            {slide.imageUrl?.trim() && (
              <img
                src={slide.imageUrl}
                alt={`${slide.title} | ${resolvedCompany}`}
                data-active={index === currentIndex}
                className="hero-slide-image h-full w-full object-cover"
                onError={(event) => { event.currentTarget.style.display = "none" }}
              />
            )}
            <div className="hero-slide-overlay absolute inset-0" />
          </div>

          <div className="absolute inset-0 z-20 text-white">
            <div className="container relative mx-auto h-full px-5 md:px-8">
              <div className="hero-frame pointer-events-none absolute inset-x-5 bottom-5 top-24 rounded-[2rem] md:inset-x-8 md:bottom-8 md:top-28" />
              {heroCompanyVisible && (
                <div data-testid="text-hero-company" className={`absolute z-30 inline-flex items-center gap-2 rounded-full border border-[#c8e8e3]/35 bg-[#12384b]/45 px-3.5 py-2 text-xs font-semibold text-[#d5f1ed] shadow-lg backdrop-blur-md md:px-4 md:text-sm ${centeredCompany ? "top-28 left-1/2 -translate-x-1/2 md:top-36" : positionClasses(heroCompanyPosition)}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--home-gold)] shadow-[0_0_0_4px_rgba(201,155,67,.14)]" />
                  {resolvedCompany}
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: index === currentIndex ? 1 : 0, y: index === currentIndex ? 0 : 30 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`hero-slide-content absolute top-1/2 -translate-y-1/2 ${centeredCta ? "right-5 left-5 flex flex-col items-center md:left-1/2 md:right-auto md:w-[min(88vw,48rem)] md:-translate-x-1/2" : "right-5 left-5 md:left-auto md:right-8 md:w-[min(62vw,48rem)]"}`}
              >
                <div className="mb-5 inline-flex items-center gap-2 text-xs font-bold text-[#c8e8e3] md:text-sm">
                  <span className="h-px w-8 bg-[color:var(--home-gold)]" />
                  خدمة تنظيف بمعايير واضحة
                </div>
                {/* Only the active slide gets h1 */}
                {index === 0 ? (
                  <h1 data-testid="heading-hero-slide" className="mb-5 max-w-3xl text-4xl font-extrabold leading-[1.16] text-white md:mb-6 md:text-6xl lg:text-7xl">
                    {slide.title}
                  </h1>
                ) : (
                  <h2 data-testid={`heading-hero-slide-${slide.id}`} className="mb-5 max-w-3xl text-4xl font-extrabold leading-[1.16] text-white md:mb-6 md:text-6xl lg:text-7xl">
                    {slide.title}
                  </h2>
                )}

                <p data-testid={`text-hero-subtitle-${slide.id}`} className="mb-8 max-w-2xl text-base font-medium leading-8 text-[#e5f5f2] md:mb-10 md:text-xl md:leading-9">
                  {slide.subtitle}
                </p>

                {heroCtaVisible && centeredCta && slide.ctaText && (
                  <button
                    onClick={() => openModal()}
                    data-testid={`button-hero-cta-${slide.id}`}
                    className="hero-cta inline-flex h-14 items-center justify-center gap-3 rounded-xl px-7 text-base font-extrabold transition-all duration-300 hover:-translate-y-0.5 md:px-8 md:text-lg"
                  >
                    {slide.ctaText}
                    <ArrowLeft size={18} />
                  </button>
                )}
              </motion.div>
              {heroCtaVisible && slide.ctaText && !centeredCta && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: index === currentIndex ? 1 : 0, scale: index === currentIndex ? 1 : 0.9 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className={`absolute z-30 flex flex-wrap gap-4 ${positionClasses(heroCtaPosition)}`}
                >
                  <button
                    onClick={() => openModal()}
                    data-testid={`button-hero-cta-${slide.id}`}
                    className="hero-cta inline-flex h-14 items-center justify-center gap-3 rounded-xl px-7 text-base font-extrabold transition-all duration-300 hover:-translate-y-0.5 md:px-8 md:text-lg"
                  >
                    {slide.ctaText}
                    <ArrowLeft size={18} />
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      ))}
      <div className="absolute bottom-9 left-0 right-0 z-30 flex items-end justify-between px-8 md:bottom-12 md:px-12">
        <div className="hidden items-center gap-2 text-xs font-bold text-white/70 md:flex">
          <span className="font-mono text-sm text-[#d5f1ed]">{String(currentIndex + 1).padStart(2, "0")}</span>
          <span className="h-px w-10 bg-white/30" />
          <span>{String(displaySlides.length).padStart(2, "0")}</span>
        </div>
        <div className="flex items-center gap-2.5" role="tablist" aria-label="اختيار الشريحة">
        {displaySlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            type="button"
            role="tab"
            aria-selected={idx === currentIndex}
            aria-label={`الشريحة ${idx + 1}`}
            data-testid={`button-hero-slide-${idx}`}
            data-active={idx === currentIndex}
            className={`hero-progress h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-12" : "w-5 hover:bg-white/80"}`}
          />
        ))}
        </div>
        <div className="hidden items-center gap-1 md:flex">
          <button type="button" onClick={() => setCurrentIndex((currentIndex - 1 + displaySlides.length) % displaySlides.length)} aria-label="الشريحة السابقة" data-testid="button-hero-previous" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white/50 hover:bg-white/10 hover:text-white">
            <ChevronRight size={17} />
          </button>
          <button type="button" onClick={() => setCurrentIndex((currentIndex + 1) % displaySlides.length)} aria-label="الشريحة التالية" data-testid="button-hero-next" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white/50 hover:bg-white/10 hover:text-white">
            <ChevronLeft size={17} />
          </button>
        </div>
      </div>
    </section>
  );
}
