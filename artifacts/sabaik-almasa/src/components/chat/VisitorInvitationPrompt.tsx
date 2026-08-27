import { useCallback, useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, Headphones, X } from "lucide-react"
import { useLocation } from "wouter"
import { getVisitorTracking } from "@/lib/visitorAttribution"

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || ""
const DISMISSED_INVITATION_KEY = "sabaik_dismissed_visitor_invitation"

type VisitorInvitation = {
  message: string
  createdAt: string
}

export function VisitorInvitationPrompt() {
  const [location] = useLocation()
  const [invitation, setInvitation] = useState<VisitorInvitation | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const checkInvitation = useCallback(async () => {
    if (location.startsWith("/admin")) return

    let sessionId = ""
    try {
      sessionId = getVisitorTracking().sessionId
    } catch {
      return
    }
    if (!sessionId) return

    try {
      const response = await fetch(
        `${API_BASE}/api/visitor/invitation?sessionId=${encodeURIComponent(sessionId)}`,
        { cache: "no-store" },
      )
      if (!response.ok) return
      const payload = await response.json() as { invitation?: VisitorInvitation | null }
      const nextInvitation = payload.invitation
      if (!nextInvitation?.message || !nextInvitation.createdAt) return

      const dismissedAt = localStorage.getItem(DISMISSED_INVITATION_KEY)
      if (dismissedAt === nextInvitation.createdAt) return

      setInvitation(nextInvitation)
      setIsOpen(true)
    } catch {
      // A temporary polling failure must not affect the public site.
    }
  }, [location])

  useEffect(() => {
    if (location.startsWith("/admin")) return
    void checkInvitation()
    const timer = window.setInterval(() => void checkInvitation(), 4000)
    return () => window.clearInterval(timer)
  }, [checkInvitation, location])

  const dismiss = () => {
    if (invitation) localStorage.setItem(DISMISSED_INVITATION_KEY, invitation.createdAt)
    setIsOpen(false)
  }

  const openChat = () => {
    if (invitation) localStorage.setItem(DISMISSED_INVITATION_KEY, invitation.createdAt)
    setIsOpen(false)
    window.dispatchEvent(new Event("openLiveSupportChat"))
  }

  return (
    <AnimatePresence>
      {isOpen && invitation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/35 p-4 backdrop-blur-[2px] sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="visitor-invitation-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            dir="rtl"
            className="w-full max-w-md overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-2xl"
          >
            <div className="flex items-start gap-3 bg-gradient-to-l from-primary to-emerald-700 px-5 py-4 text-white">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <Headphones size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 id="visitor-invitation-title" className="text-base font-black">فريق الدعم متاح لمساعدتك</h2>
                <p className="mt-1 text-xs text-white/75">لديك دعوة مباشرة من فريق الدعم</p>
              </div>
              <button
                type="button"
                onClick={dismiss}
                className="rounded-xl p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="إغلاق الدعوة"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-5 p-5">
              <p className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm leading-7 text-slate-700">
                {invitation.message}
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <CheckCircle2 size={15} className="text-emerald-600" />
                سيُطلب اسمك ورقم جوالك لبدء المحادثة
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={openChat}
                  className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700"
                >
                  فتح المحادثة
                </button>
                <button
                  type="button"
                  onClick={dismiss}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-50"
                >
                  لاحقاً
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}