import { useEffect, useState } from "react"
import { useLocation } from "wouter"
import { ArrowUp } from "lucide-react"

export function ScrollToTop() {
  const [location] = useLocation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior })
  }, [location])

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <button
      type="button"
      aria-label="الصعود إلى أعلى الصفحة"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-[7.75rem] left-5 z-[70] flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-primary text-white shadow-xl shadow-primary/25 transition-all duration-300 hover:-translate-y-1 hover:bg-secondary hover:text-primary ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <ArrowUp size={19} strokeWidth={2.5} />
    </button>
  )
}
