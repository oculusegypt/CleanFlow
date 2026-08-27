import React from "react"
import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { SERVICE_TYPES } from "./constants"

interface StepServiceSelectProps {
  onSelectService: (id: string) => void
}

export function StepServiceSelect({ onSelectService }: StepServiceSelectProps) {
  return (
    <motion.div
      key="service"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-3"
    >
      <p className="text-xs text-gray-500 mb-2">اختر الخدمة أو الباقة المراد حجزها وتنفيذها بالرياض:</p>
      <div className="grid grid-cols-1 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
        {SERVICE_TYPES.map((st) => {
          const Icon = st.icon
          return (
            <motion.button
              key={st.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={() => onSelectService(st.id)}
              className={`w-full text-right p-3.5 rounded-2xl border bg-gradient-to-r ${st.color} hover:shadow-md transition-all flex items-center justify-between group`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                  <Icon size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm group-hover:text-primary transition-colors">
                    {st.label}
                  </h4>
                  <p className="text-[11px] text-gray-500 leading-tight line-clamp-1">
                    {st.desc}
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 shrink-0" />
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
