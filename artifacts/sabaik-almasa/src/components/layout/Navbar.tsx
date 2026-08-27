import * as React from "react"
import { Link, useLocation } from "wouter"
import { useServiceRequest } from "@/context/ServiceRequestContext"
import { useSiteSettings } from "@/context/SiteSettingsContext"
import { Menu, X, Search, ShieldCheck, ArrowLeft } from "lucide-react"
import { TrackOrderModal } from "@/components/home/TrackOrderModal"

const NAV_LINKS = [
  { href: "/", text: "الرئيسية" },
  { href: "/cleaning-packages", text: "باقات التنظيف" },
  { href: "/services", text: "الخدمات" },
  { href: "/pricing", text: "الأسعار" },
  { href: "/blog", text: "المدونة" },
  { href: "/faq", text: "الأسئلة الشائعة" },
  { href: "/contact", text: "اتصل بنا" },
  { href: "/اتصل-الآن", text: "اتصل الآن" },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [trackingOpen, setTrackingOpen] = React.useState(false)
  const [trackingId, setTrackingId] = React.useState<string | undefined>()
  const { openModal } = useServiceRequest()
  const [location] = useLocation()
  const { logoUrl, isLoaded, orderTrackingEnabled, companyName } = useSiteSettings()

  const isHeaderSolid = isScrolled

  React.useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  React.useEffect(() => {
    const handler = (event: Event) => {
      const id = (event as CustomEvent<{ id?: number | string }>).detail?.id
      setTrackingId(id !== undefined && id !== null && String(id).trim() ? String(id) : undefined)
      setTrackingOpen(true)
    }
    window.addEventListener("openTrackingModal", handler)
    return () => window.removeEventListener("openTrackingModal", handler)
  }, [])

  React.useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false) }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [menuOpen])

  return (
    <>
      <header
        dir="rtl"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isHeaderSolid
            ? "border-b border-[color:var(--home-line)]/80 bg-[#edf7f5]/94 shadow-[0_12px_34px_rgba(18,56,75,.1)] backdrop-blur-xl py-2.5"
            : "border-b border-transparent bg-transparent shadow-none backdrop-blur-0 py-3.5"
        }`}
      >
        <div className="mx-auto w-full px-4 md:px-8">
          <div className="flex min-h-12 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" data-testid="link-home-logo" aria-label="العودة إلى الصفحة الرئيسية" className="group flex shrink-0 items-center gap-2.5">
              {isLoaded && logoUrl ? (
                <img src={logoUrl} onError={e => { e.currentTarget.src = "/logo.png" }} alt={companyName || "شركة تنظيف بالرياض"} className="h-9 w-auto object-contain md:h-11" />
              ) : (
                <span className={`font-extrabold text-base tracking-tight md:text-lg ${isHeaderSolid ? "text-[color:var(--home-ink)]" : "text-white"}`}>
                  {companyName || "خدمات التنظيف"}
                </span>
              )}
              <span className={`hidden h-7 w-px sm:block ${isHeaderSolid ? "bg-[color:var(--home-line)]" : "bg-white/20"}`} />
              <span className={`hidden text-[10px] font-bold leading-tight tracking-[.08em] sm:block ${isHeaderSolid ? "text-[color:var(--home-water)]" : "text-[#c8e8e3]"}`}>
                تنظيف موثوق<br />في الرياض
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-1 md:flex lg:gap-2" aria-label="التنقل الرئيسي">
              {NAV_LINKS.map(l => (
                <NavLink key={l.href} href={l.href} text={l.text} isScrolled={isHeaderSolid} currentLocation={location} />
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {isLoaded && orderTrackingEnabled && (
                <button
                  onClick={() => setTrackingOpen(true)}
                  data-testid="button-track-order"
                  className={`hidden sm:inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all duration-200 md:text-sm ${
                    isHeaderSolid
                      ? "border-[color:var(--home-line)] bg-white/72 text-[color:var(--home-ink-soft)] hover:border-[color:var(--home-water)] hover:text-[color:var(--home-water)]"
                      : "border-white/20 bg-white/10 text-white hover:border-[color:var(--home-gold)] hover:bg-white/15 hover:text-white"
                  }`}
                >
                  <Search size={14} />
                  تتبع الطلب
                </button>
              )}

              <Link
                href="/admin/login"
                data-testid="link-admin-login"
                className={`hidden sm:inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all duration-200 md:text-sm ${
                  isHeaderSolid
                    ? "border-[color:var(--home-line)] bg-white/70 text-[color:var(--home-ink-soft)] hover:border-[color:var(--home-water)] hover:text-[color:var(--home-water)]"
                    : "border-white/20 bg-white/10 text-white hover:border-[color:var(--home-gold)] hover:bg-white/15 hover:text-white"
                }`}
              >
                <ShieldCheck size={14} />
                دخول الإدارة
              </Link>

              {/* CTA */}
              <button
                onClick={() => openModal()}
                data-testid="button-request-service"
                className="hidden items-center gap-2 rounded-xl bg-[color:var(--home-gold)] px-4 py-2.5 text-xs font-black text-white shadow-[0_10px_22px_rgba(201,155,67,.24)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#b9852d] hover:shadow-[0_14px_28px_rgba(201,155,67,.3)] sm:inline-flex md:px-5 md:text-sm"
              >
                اطلب باقة التنظيف
                <ArrowLeft size={15} strokeWidth={2.5} />
              </button>

              {/* Burger button */}
              <button
                onClick={() => setMenuOpen(p => !p)}
                aria-label="القائمة الرئيسية"
                aria-expanded={menuOpen}
                 className={`md:hidden flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                   isHeaderSolid ? "text-[color:var(--home-ink)] hover:bg-[color:var(--home-water-soft)]" : "text-white hover:bg-white/10"
                 }`}
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Backdrop */}
      <div
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
      {/* Track order modal */}
      {isLoaded && orderTrackingEnabled && (
        <TrackOrderModal isOpen={trackingOpen} onClose={() => { setTrackingOpen(false); setTrackingId(undefined) }} initialId={trackingId} />
      )}
      {/* Mobile menu drawer */}
      <div
        dir="rtl"
        className={`fixed top-0 right-0 z-[60] flex h-full w-[min(88vw,22rem)] flex-col border-l border-[color:var(--home-line)] bg-[#f4faf8] shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e7dccb]">
          {isLoaded && logoUrl ? (
            <img src={logoUrl} onError={e => { e.currentTarget.src = "/logo.png" }} alt={companyName || "شركة تنظيف بالرياض"} className="h-10 w-auto" />
          ) : (
            <span className="font-bold text-primary text-base">{companyName || "خدمات التنظيف"}</span>
          )}
          <button
            onClick={() => setMenuOpen(false)}
            data-testid="button-close-mobile-menu"
            className="w-9 h-9 flex items-center justify-center rounded-xl text-primary/70 hover:text-primary hover:bg-primary/10 transition-colors"
            aria-label="أغلق القائمة"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="flex flex-col px-3 py-5 gap-0.5 flex-1 overflow-y-auto">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              data-testid={`link-mobile-nav-${l.href === "/" ? "home" : l.href.replace(/[^a-zA-Z0-9\u0600-\u06ff]+/g, "-")}`}
               className={`flex items-center rounded-xl px-4 py-3.5 text-[1rem] font-bold transition-colors ${
                 isCurrentPath(location, l.href)
                   ? "bg-[color:var(--home-water-soft)] text-[color:var(--home-ink)] shadow-sm"
                   : "text-[color:var(--home-ink-soft)] hover:bg-[color:var(--home-water-soft)]/70 hover:text-[color:var(--home-water)]"
               }`}
            >
              {l.text}
            </Link>
          ))}
        </nav>

        <div className="px-4 pb-8 pt-3 border-t border-[#e7dccb] space-y-2.5">
          <button
            onClick={() => { setMenuOpen(false); openModal() }}
            data-testid="button-mobile-request-service"
             className="w-full rounded-xl bg-[color:var(--home-gold)] py-3.5 text-base font-black text-white shadow-lg transition-colors hover:bg-[#b9852d]"
          >
            اطلب خدمة التنظيف الآن
          </button>
          {isLoaded && orderTrackingEnabled && (
            <button
              onClick={() => { setMenuOpen(false); setTrackingOpen(true) }}
               data-testid="button-mobile-track-order"
               className="w-full flex items-center justify-center gap-2 rounded-xl border border-[color:var(--home-line)] py-3 text-sm font-bold text-[color:var(--home-ink-soft)] transition-colors hover:border-[color:var(--home-water)] hover:text-[color:var(--home-water)]"
            >
              <Search size={15} />
              تتبع الطلب
            </button>
          )}
          <Link
            href="/admin/login"
            onClick={() => setMenuOpen(false)}
            data-testid="link-mobile-admin-login"
             className="w-full flex items-center justify-center gap-2 rounded-xl border border-[color:var(--home-gold)]/60 py-3 text-sm font-black text-[color:var(--home-gold)] transition-colors hover:bg-[color:var(--home-gold)] hover:text-white"
          >
            <ShieldCheck size={15} />
            دخول الإدارة
          </Link>
        </div>
      </div>
    </>
  );
}

function isCurrentPath(location: string, href: string) {
  if (href === "/") return location === "/"
  return location === href || location.startsWith(`${href}/`)
}

function NavLink({ href, text, isScrolled, currentLocation }: { href: string; text: string; isScrolled: boolean; currentLocation: string }) {
  const active = isCurrentPath(currentLocation, href)
  return (
    <Link
      href={href}
      data-testid={`link-nav-${href === "/" ? "home" : href.replace(/[^a-zA-Z0-9\u0600-\u06ff]+/g, "-")}`}
      aria-current={active ? "page" : undefined}
      className={`relative rounded-xl px-3 py-2 text-sm font-bold transition-all duration-200 ${
        active
          ? isScrolled
            ? "bg-[color:var(--home-water-soft)] text-[color:var(--home-ink)] shadow-sm"
            : "bg-white/15 text-white"
          : isScrolled
            ? "text-[color:var(--home-ink-soft)] hover:bg-[color:var(--home-water-soft)]/70 hover:text-[color:var(--home-water)]"
            : "text-white/80 hover:bg-white/10 hover:text-white"
      }`}
    >
      {text}
    </Link>
  )
}
