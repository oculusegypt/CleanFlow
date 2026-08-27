import { useEffect, useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { useSiteSettings } from "@/context/SiteSettingsContext"

export function StatsBar() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" })
  const { statsItems: stats } = useSiteSettings()

  if (stats.length === 0) return null

  return (
    <section className="bg-slate-950 text-white py-14 border-y border-slate-800 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5" />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm"
            >
              <div className="flex items-center justify-center text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2">
                <Counter from={0} to={stat.value} trigger={isInView} />
                <span className="text-secondary mr-1">{stat.suffix}</span>
              </div>
              <p className="text-slate-300 font-bold text-xs sm:text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Counter({ from, to, trigger }: { from: number; to: number; trigger: boolean }) {
  const [count, setCount] = useState(from)

  useEffect(() => {
    if (!trigger) return
    let startTimestamp: number | null = null
    const duration = 2000
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setCount(Math.floor(easeProgress * (to - from) + from))
      if (progress < 1) window.requestAnimationFrame(step)
    }
    window.requestAnimationFrame(step)
  }, [trigger, from, to])

  return <span>{count}</span>
}
