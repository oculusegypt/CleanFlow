import React from "react"
import { LayoutGrid, Building2, Sparkles, Wind, Bug, Droplets, Gem, HardHat, Briefcase, ShieldCheck } from "lucide-react"

export interface TabConfig {
  key: string
  label: string
  icon: any
  activeClass: string
}

export const TABS: TabConfig[] = [
  { key: "all",        label: "جميع باقات التنظيف", icon: LayoutGrid, activeClass: "bg-slate-950 text-white shadow-xl shadow-slate-950/20 border-slate-950" },
  { key: "apartments", label: "الشقق والمنازل", icon: Building2, activeClass: "bg-blue-600 text-white shadow-xl shadow-blue-600/20 border-blue-600" },
  { key: "villas",     label: "الفلل والقصور", icon: Building2, activeClass: "bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 border-emerald-600" },
  { key: "majlis",     label: "المجالس والكنب", icon: Sparkles, activeClass: "bg-purple-600 text-white shadow-xl shadow-purple-600/20 border-purple-600" },
  { key: "ac",         label: "المكيفات", icon: Wind, activeClass: "bg-cyan-600 text-white shadow-xl shadow-cyan-600/20 border-cyan-600" },
  { key: "pest",       label: "مكافحة الحشرات", icon: Bug, activeClass: "bg-rose-600 text-white shadow-xl shadow-rose-600/20 border-rose-600" },
  { key: "tanks",      label: "الخزانات", icon: Droplets, activeClass: "bg-teal-600 text-white shadow-xl shadow-teal-600/20 border-teal-600" },
  { key: "marble",     label: "جلي الرخام", icon: Gem, activeClass: "bg-yellow-500 text-slate-950 shadow-xl shadow-yellow-500/20 border-yellow-500" },
  { key: "postcon",    label: "بعد البناء", icon: HardHat, activeClass: "bg-orange-600 text-white shadow-xl shadow-orange-600/20 border-orange-600" },
  { key: "facades",    label: "الواجهات والمكاتب", icon: Briefcase, activeClass: "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 border-indigo-600" },
  { key: "fire_safety", label: "السلامة والدفاع المدني", icon: ShieldCheck, activeClass: "bg-red-600 text-white shadow-xl shadow-red-600/20 border-red-600" },
]

interface CategoryTabsProps {
  activeTab: string
  onSelectTab: (key: string) => void
}

export function CategoryTabs({ activeTab, onSelectTab }: CategoryTabsProps) {
  return (
    <div className="flex items-center justify-start sm:justify-center gap-2.5 overflow-x-auto pb-4 mb-12 scrollbar-none px-2">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key
        const Icon = tab.icon
        return (
          <button
            key={tab.key}
            onClick={() => onSelectTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold border-2 transition-all duration-300 whitespace-nowrap shrink-0 transform active:scale-95 ${
              isActive
                ? `${tab.activeClass} scale-[1.02]`
                : `bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-50 border-slate-200/80 shadow-sm hover:shadow`
            }`}
          >
            <Icon size={16} className={isActive ? "" : "text-amber-500"} />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
