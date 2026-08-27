import React, { useState, useEffect } from "react"
import { Star, CheckCircle, MessageSquare, Send, User, MapPin, ThumbsUp, AlertCircle } from "lucide-react"

interface ReviewItem {
  id: number
  serviceId: number
  customerName: string
  customerCity?: string | null
  rating: number
  comment: string
  status: string
  createdAt: string
}

interface ReviewsData {
  serviceId: number
  averageRating: number
  reviewCount: number
  breakdown: { [key: number]: number }
  reviews: ReviewItem[]
}

interface ServiceReviewsSectionProps {
  serviceId: number
  serviceTitle: string
}

export function ServiceReviewsSection({ serviceId, serviceTitle }: ServiceReviewsSectionProps) {
  const [data, setData] = useState<ReviewsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [city, setCity] = useState("")
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [consent, setConsent] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const fetchReviews = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/services/${serviceId}/reviews`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      console.error("Failed to load reviews:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (serviceId) {
      fetchReviews()
    }
  }, [serviceId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !comment.trim()) {
      setSubmitMessage({ type: "error", text: "يرجى كتابة الاسم ونص التقييم." })
      return
    }
    if (!consent) {
      setSubmitMessage({ type: "error", text: "يرجى الموافقة على نشر التقييم." })
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitMessage(null)
      const res = await fetch(`/api/services/${serviceId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          customerCity: city.trim() || "الرياض",
          rating,
          comment: comment.trim(),
        }),
      })

      if (res.ok) {
        setSubmitMessage({
          type: "success",
          text: "شكراً لتقييمك! تم استلام تقييمك بنجاح وسيتم نشره فور اعتماده من الإدارة.",
        })
        setName("")
        setCity("")
        setComment("")
        setRating(5)
        setTimeout(() => setShowForm(false), 4000)
      } else {
        const errJson = await res.json().catch(() => ({}))
        setSubmitMessage({
          type: "error",
          text: errJson.error || "حدث خطأ أثناء إرسال التقييم. يرجى المحاولة مرة أخرى.",
        })
      }
    } catch {
      setSubmitMessage({
        type: "error",
        text: "تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const reviewCount = data?.reviewCount ?? 0
  const avgRating = data?.averageRating ?? 5.0
  const breakdown = data?.breakdown ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  const reviews = data?.reviews ?? []

  return (
    <section className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-10 shadow-sm space-y-8" id="service-reviews">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-600 bg-amber-50 px-3 py-1 rounded-full mb-2">
            <Star size={14} className="fill-amber-400 text-amber-400" /> تجارب وتقييمات موثقة
          </span>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900">
            تقييمات العملاء لـ {serviceTitle}
          </h3>
          <p className="text-slate-600 text-sm mt-1">
            آراء وتجارب العملاء الذين استفادوا من هذه الخدمة في أحياء مدينة الرياض.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 rounded-xl transition shadow-sm self-start md:self-auto"
        >
          <MessageSquare size={18} />
          {showForm ? "إلغاء النموذج" : "✍️ قيّم تجربتك معنا"}
        </button>
      </div>

      {/* Review Submission Form Modal / Accordion */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-50 border-2 border-primary/20 rounded-2xl p-6 md:p-8 space-y-5 transition-all">
          <div className="border-b border-slate-200/80 pb-4">
            <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Star size={20} className="text-amber-500 fill-amber-500" /> إضافة تقييم لـ {serviceTitle}
            </h4>
            <p className="text-slate-600 text-xs mt-1">
              رأيك يهمنا ويساعد العملاء الآخرين في اختيار الخدمة المناسبة.
            </p>
          </div>

          {submitMessage && (
            <div
              className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
                submitMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {submitMessage.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              {submitMessage.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">الاسم الكريم *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: عبدالله القحطاني"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">الحي / المنطقة في الرياض</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="مثال: الرياض - حي الملقا"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">التقييم العام *</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-2xl transition hover:scale-110"
                >
                  <Star
                    size={28}
                    className={`transition ${
                      star <= (hoverRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300 fill-slate-100"
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm font-bold text-amber-600 mr-2">
                {rating} من 5 نجوم
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">نص التقييم وتفاصيل تجربتك *</label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="اكتب عن مستوى النظافة، سرعة الفريق، دقة المواعيد، أو أي ملاحظات..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="rounded border-slate-300 text-primary focus:ring-primary"
            />
            <label htmlFor="consent" className="text-xs text-slate-600 font-medium">
              أوافق على نشر التقييم كـ تجربة موثقة بعد مراجعته من الإدارة.
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl transition shadow-sm disabled:opacity-50"
          >
            <Send size={16} />
            {isSubmitting ? "جارٍ الإرسال..." : "إرسال التقييم"}
          </button>
        </form>
      )}

      {/* Review Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50/80 rounded-2xl p-6 border border-slate-200/60">
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-l border-slate-200/80">
          <div className="text-5xl font-black text-slate-900 tracking-tight">{avgRating}</div>
          <div className="flex items-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={20}
                className={s <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-100"}
              />
            ))}
          </div>
          <p className="text-slate-600 text-xs font-bold">
            بناءً على {reviewCount} تقييماً موثقاً
          </p>
        </div>

        {/* Star Rating Distribution Bars */}
        <div className="md:col-span-8 space-y-2 py-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = breakdown[star] || 0
            const pct = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0
            return (
              <div key={star} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                <span className="w-12 text-left">{star} نجوم</span>
                <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-12 text-right text-slate-500 font-semibold">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="text-center py-10 text-slate-400 text-sm">جارٍ تحميل التقييمات...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <MessageSquare size={36} className="mx-auto text-slate-400 mb-2" />
          <h4 className="font-bold text-slate-700 text-base">كن أول من يقيّم هذه الخدمة</h4>
          <p className="text-slate-500 text-xs mt-1 mb-4">لم يتم تسجيل تقييمات منشورة بعد لهذه الخدمة.</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg"
          >
            ✍️ أضف تقييمك الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-3 hover:border-slate-300 transition"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                      {rev.customerName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-sm text-slate-900 font-bold">{rev.customerName}</strong>
                        <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          ✓ موثق
                        </span>
                      </div>
                      {rev.customerCity && (
                        <span className="text-[11px] text-slate-500 flex items-center gap-0.5 mt-0.5">
                          <MapPin size={11} className="text-slate-400" /> {rev.customerCity}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={13}
                        className={s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-100"}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-slate-700 text-xs md:text-sm leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  "{rev.comment}"
                </p>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                <span>الخدمة: {serviceTitle}</span>
                <span>{new Date(rev.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
